# QuickNotes Architecture

## Functional requirements

1. Users can register and authenticate.
2. Authenticated users can create, view, update and delete their own notes.
3. Users can organize notes with tags.
4. Users can list notes with pagination.
5. The API returns predictable JSON success and error responses.

## Non-functional requirements

1. The service should remain available during individual server failures.
2. API reads should be low latency under normal and peak load.
3. Data must be durable and protected from unauthorized access.
4. The system should scale horizontally as traffic grows.
5. Background work should not block user-facing requests.
6. Monitoring, logging and health checks should make failures observable.

## Load estimate for 1 million users

Assumptions:

- 1,000,000 registered users.
- 20% are active daily = 200,000 DAU.
- Each active user performs 50 note reads per day.
- Each active user creates 2 notes per day.
- Average stored note payload is approximately 4 KB including metadata.
- One year has 365 days and 86,400 seconds per day.
- Peak traffic is estimated at 5× the average.

### Reads

200,000 × 50 = **10,000,000 reads/day**

10,000,000 ÷ 86,400 ≈ **116 reads/second average**

At 5× peak: approximately **579 reads/second**.

### Writes

200,000 × 2 = **400,000 writes/day**

400,000 ÷ 86,400 ≈ **4.6 writes/second average**

At 5× peak: approximately **23 writes/second**.

### Storage

400,000 notes/day × 4 KB ≈ **1.6 GB/day**

1.6 GB × 365 ≈ **584 GB/year** of primary note data, before indexes, backups, replication and operational overhead.

The system is therefore **read-heavy**, so read caching and a read replica are important.

## Architecture diagram

    Client
      |
      +--------------------+
      |                    |
      v                    v
    CDN                 Load Balancer
    |                       |
    |                       +----------------+----------------+
    |                       |                |                |
    |                       v                v                v
    |                     App Server 1     App Server 2     App Server N
    |                       |                |                |
    |                       +----------------+----------------+
    |                                        |
    |                              +---------+----------+
    |                              |                    |
    |                              v                    v
    |                            Cache                Queue
    |                              |                    |
    |                              v                    v
    |                         Primary DB             Worker
    |                              |
    |                              | replication
    |                              v
    |                         Read Replica
    |
    +-- Static assets

## Component responsibilities

- **Client:** Provides the user interface and sends authenticated API requests without exposing backend implementation details.
- **DNS:** Resolves the public QuickNotes hostname to the service's entry point.
- **CDN:** Serves cacheable static assets close to users and reduces latency for repeated static requests. API traffic is routed separately through the load balancer.
- **Load balancer:** Distributes API traffic across healthy app servers and removes failed instances from rotation.
- **App servers:** Execute authentication, authorization, validation and business logic while scaling horizontally.
- **Cache:** Stores frequently requested note lists or metadata so repeated reads avoid unnecessary database work.
- **Primary database:** Reliably stores authoritative transactional application data.
- **Read replica:** Serves read-only queries so the primary database can concentrate on writes and transactional work.
- **Queue:** Buffers asynchronous jobs so slow background work does not block user-facing API requests.
- **Worker:** Processes queued jobs such as notifications, indexing or analytics outside the request path.

## GET /notes flow

1. The client sends GET /api/v1/notes.
2. DNS resolves the QuickNotes hostname.
3. The request reaches the load balancer.
4. The load balancer selects a healthy app server.
5. The app server authenticates the request and validates pagination parameters.
6. The app server checks the cache for the user's requested note page.
7. On a cache hit, the cached response is returned.
8. On a cache miss, the app server queries the read replica.
9. The result is placed in the cache with a suitable expiration time.
10. The app server returns the JSON response to the client.

## POST /notes flow

1. The client sends POST /api/v1/notes with the title and optional body.
2. DNS resolves the service and the request reaches the load balancer.
3. A healthy app server authenticates the user and validates the request.
4. The app server writes the new note to the primary database inside a transaction.
5. The database returns the new note ID.
6. The app server invalidates or updates affected cache entries.
7. If background work is required, such as notifications or search indexing, the app server publishes a job to the queue.
8. A worker processes the job asynchronously.
9. The API returns 201 Created with the new note representation.

## Trade-offs

### Cache vs. consistency

Caching reduces database load and improves read latency, but cached note lists can become stale. QuickNotes should use short TTLs and explicit invalidation after writes for important user-visible data.

### Read replicas vs. immediate consistency

Read replicas improve read capacity, but replication can lag behind the primary. Critical read-after-write operations can temporarily read from the primary or use a consistency-aware routing policy.

### Async queue vs. immediate processing

A queue keeps API requests fast and isolates slow jobs, but it introduces eventual consistency and requires retry/dead-letter handling.

## Avoiding single points of failure

- Run at least two app servers across separate availability zones and put them behind the load balancer.
- Use a highly available load balancer and redundant DNS configuration.
- Deploy the cache with replication/failover rather than relying on one cache node.
- Use a managed primary database with automated backups/failover and a separate read replica.
- Run multiple worker instances consuming from a durable queue.
- Keep infrastructure and configuration reproducible so failed instances can be replaced quickly.
