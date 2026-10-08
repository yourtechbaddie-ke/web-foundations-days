# QuickNotes — Scalable Architecture

## Functional requirements

1. Users can register and authenticate.
2. Authenticated users can create, view, update and delete their own notes.
3. Users can organize notes with tags.
4. Users can list notes with pagination.
5. The API returns predictable JSON success and error responses.
6. Users cannot read or modify another user's notes or tags.

## Non-functional requirements

1. The service should remain available during individual server failures.
2. API reads should have low latency under normal and peak load.
3. Data must be durable and protected from unauthorized access.
4. Application servers should scale horizontally as traffic grows.
5. Background work should not block user-facing requests.
6. Monitoring, logging and health checks should make failures observable.
7. Backups and database recovery procedures should protect against data loss.

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

The system is therefore **read-heavy**: approximately 25 reads occur for every write. This makes caching and read replicas useful while the primary database remains the source of truth for writes.

## Architecture

```text
                         ┌───────────────┐
                         │   Web / App   │
                         │     Client    │
                         └───────┬───────┘
                                 │
                       HTTPS / JSON API
                                 │
                    ┌────────────▼────────────┐
                    │     DNS + CDN/WAF       │
                    │ static assets / edge    │
                    └────────────┬────────────┘
                                 │ API traffic
                         ┌───────▼───────┐
                         │ Load Balancer │
                         └───────┬───────┘
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐┌────▼──────┐┌────▼──────┐
              │ App       ││ App       ││ App       │
              │ Server 1  ││ Server 2  ││ Server N  │
              └─────┬─────┘└────┬──────┘└────┬──────┘
                    └────────────┼────────────┘
                                 │
                   ┌─────────────┼─────────────┐
                   │             │             │
             ┌─────▼─────┐ ┌────▼──────┐ ┌────▼──────┐
             │   Cache   │ │  Primary  │ │   Queue   │
             │  Redis    │ │    DB     │ │            │
             └─────┬─────┘ └────┬──────┘ └────┬──────┘
                   │             │             │
                   │             │ replication │
                   │       ┌─────▼──────┐      ▼
                   │       │ Read       │   ┌────────┐
                   │       │ Replica(s) │   │Worker(s)│
                   │       └────────────┘   └────────┘
                   │
                   └──── cached note lists / metadata
```

The CDN handles cacheable static assets. API requests continue through the load balancer so authentication and authorization are enforced by the application layer.

## Component responsibilities

- **Client:** Provides the user interface and sends authenticated API requests.
- **DNS:** Resolves the public QuickNotes hostname.
- **CDN/WAF:** Serves cacheable static assets close to users and provides an edge security layer. API traffic is routed to the application tier.
- **Load balancer:** Distributes API traffic across healthy app servers and removes failed instances from rotation.
- **App servers:** Execute authentication, authorization, validation and business logic. They are stateless so more instances can be added horizontally.
- **Cache:** Stores frequently requested note lists or metadata in memory. Cache entries use short TTLs and are invalidated after important writes.
- **Primary database:** Stores authoritative transactional data for users, notes, tags and relationships.
- **Read replicas:** Serve read-only queries and protect the primary from heavy read traffic. Replica lag is handled where read-after-write consistency matters.
- **Queue:** Buffers asynchronous jobs such as notifications, search indexing or analytics.
- **Workers:** Process queued jobs independently of API requests.
- **Monitoring:** Collects application logs, metrics, error rates, latency and health-check information.

## GET /notes flow

1. The client sends `GET /api/v1/notes?limit=20&offset=0` with an authentication token.
2. The request reaches the load balancer.
3. A healthy app server authenticates the user and validates pagination parameters.
4. The app server checks the cache for the user's requested note page.
5. On a cache hit, the cached response is returned.
6. On a cache miss, the app server queries a read replica.
7. The result is placed in the cache with a suitable TTL.
8. The app server returns the JSON response.

## POST /notes flow

1. The client sends `POST /api/v1/notes` with the title and optional body.
2. The load balancer routes the request to an app server.
3. The app server authenticates the user and validates the request.
4. The app server writes the new note to the primary database inside a transaction.
5. The database returns the new note ID.
6. The app server invalidates or updates affected cache entries.
7. If background work is required, the app server publishes a job to the durable queue.
8. A worker processes the job asynchronously.
9. The API returns **201 Created** with the new note representation.

## Authorization and data isolation

Authentication identifies the caller, but authorization must also be enforced on every note and tag query.

For example, a request for `GET /api/v1/notes/{id}` should only return a row where both the requested note ID and the authenticated user's ID match. The application must never trust a user-supplied `userId` to decide ownership.

The database foreign keys enforce structural relationships, while the application authorization layer enforces ownership rules.

## Failure handling

- If an app server fails, the load balancer routes new requests to another healthy instance.
- If the cache is unavailable, the application can fall back to the database rather than treating the cache as the source of truth.
- If a read replica is unavailable, reads can temporarily use another replica or the primary.
- Queue jobs should be retried with backoff and moved to a dead-letter queue after repeated failure.
- Database backups should be automated and periodically tested through restore drills.
- Health checks should detect failed application instances before they receive traffic.

## Trade-offs

### Cache vs. consistency

Caching reduces database load and improves read latency, but cached note lists can become stale. QuickNotes should use short TTLs and explicit invalidation after writes for important user-visible data.

### Read replicas vs. immediate consistency

Read replicas improve read capacity, but replication can lag behind the primary. Critical read-after-write operations can temporarily read from the primary or use consistency-aware routing.

### Async queue vs. immediate processing

A queue keeps API requests fast and isolates slow jobs, but it introduces eventual consistency and requires retries and dead-letter handling.

### Horizontal scaling vs. simplicity

Multiple stateless app servers improve availability and capacity, but they require a load balancer, centralized cache/session handling and stronger observability.

## Avoiding single points of failure

- Run at least two app servers across separate availability zones behind the load balancer.
- Use a highly available load balancer and redundant DNS configuration.
- Use a replicated/failover-capable cache rather than relying on one cache node.
- Use a managed primary database with automated backups/failover and one or more read replicas.
- Run multiple worker instances consuming from a durable queue.
- Keep infrastructure and configuration reproducible so failed instances can be replaced quickly.
