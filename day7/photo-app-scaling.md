# SnapShare Scaling Plan

## 1. Assumptions

The following assumptions are used for the scaling estimates:

- SnapShare has **10 million registered users**.
- **10% of registered users are active each day**.
- Each active user uploads **1 photo per day**.
- Each active user views **50 feed pages per day**.
- The average original photo is **2 MB**.
- Each photo also has a **50 KB thumbnail**.
- There are **86,400 seconds in a day**.
- Peak traffic is assumed to be **5× the average traffic**.
- Storage calculations use the provided photo and thumbnail sizes and do not include additional database, backup, or replication overhead.

## 2. Daily Active Users

There are 10 million registered users and 10% are active each day.

**Daily active users = 10,000,000 × 10% = 1,000,000 users**

Therefore, SnapShare has approximately **1 million daily active users (DAU)**.

## 3. Upload Estimates

Each active user uploads 1 photo per day.

**Uploads per day = 1,000,000 × 1 = 1,000,000 uploads/day**

Average uploads per second:

**1,000,000 ÷ 86,400 ≈ 11.57 uploads/second**

Using the 5× peak assumption:

**11.57 × 5 ≈ 57.87 uploads/second**

Therefore:

- **Average:** approximately **11.6 uploads/second**
- **Peak:** approximately **58 uploads/second**

## 4. Feed View Estimates

Each active user views 50 feed pages per day.

**Feed views per day = 1,000,000 × 50 = 50,000,000 views/day**

Average feed views per second:

**50,000,000 ÷ 86,400 ≈ 578.70 views/second**

Using the 5× peak assumption:

**578.70 × 5 ≈ 2,893.52 views/second**

Therefore:

- **Average:** approximately **579 feed views/second**
- **Peak:** approximately **2,894 feed views/second**

## 5. Photo Storage Per Year

Each uploaded photo requires storage for:

- Original photo: **2 MB**
- Thumbnail: **50 KB**
- Total: approximately **2.05 MB per upload**

There are approximately 1 million uploads per day.

**Daily photo storage = 1,000,000 × 2.05 MB = 2,050,000 MB**

This is approximately **2.05 TB per day** using decimal storage units.

For one year:

**2.05 TB × 365 = 748.25 TB/year**

Therefore, SnapShare needs approximately **748 TB of photo and thumbnail storage per year**, before accounting for backups, replication, metadata, and other overhead.

## 6. Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system**.

The system handles approximately **579 feed views per second on average**, compared with only approximately **12 photo uploads per second**. At peak traffic, it could handle around **2,894 feed views per second** versus approximately **58 uploads per second**.

This means the architecture should prioritize fast and scalable reads. Caching, CDNs, database read replicas, and horizontally scalable application servers are especially important because many users repeatedly request feed data and photos.

## 7. Why Photos Should Not Be Stored Inside the Database

The actual photo files should **not be stored directly inside the relational database** because large binary files would consume database storage, increase backup and replication costs, and make database operations and scaling more difficult.

Instead, the original photos and thumbnails should be stored in **object storage**, while the database stores metadata such as the photo ID, user ID, caption, upload time, object-storage key/URL, and other information needed to retrieve the photo.

Object storage is designed to store large amounts of files efficiently and can scale to very large storage requirements.

## 8. Architecture Diagram

```text
                         ┌───────────────┐
                         │     Users     │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │      CDN      │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ Load Balancer │
                         └───────┬───────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
                  ▼              ▼              ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │App Server│   │App Server│   │App Server│
            │    1     │   │    2     │   │    N     │
            └────┬─────┘   └────┬─────┘   └────┬─────┘
                 │              │              │
                 └──────────────┼──────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
              ┌───────────┐          ┌──────────────┐
              │   Cache   │          │    Queue     │
              └─────┬─────┘          └──────┬───────┘
                    │                       │
                    │                       ▼
                    │                ┌──────────────┐
                    │                │    Worker    │
                    │                │  Thumbnail   │
                    │                │    Creator   │
                    │                └──────┬───────┘
                    │                       │
                    │                       ▼
                    │                ┌──────────────┐
                    │                │Object Storage│
                    │                │Photos +      │
                    │                │Thumbnails    │
                    │                └──────────────┘
                    │
                    ▼
              ┌──────────────┐
              │   Database   │
              │   Primary    │
              └──────┬───────┘
                     │
                     │ Replication
                     ▼
              ┌──────────────┐
              │ Read Replica │
              └──────────────┘
```

## 9. Component Responsibilities

- **CDN:** Caches and serves frequently requested photos and thumbnails from locations close to users, reducing latency and load on the application servers.
- **Load Balancer:** Distributes incoming requests across multiple application servers so that no single server becomes a bottleneck or single point of failure.
- **App Servers:** Handle application logic such as authentication, uploading metadata, creating feeds, and communicating with the cache and database.
- **Cache:** Stores frequently requested feed data and other commonly accessed information in fast memory so repeated reads do not always hit the database.
- **Database:** Stores structured application data such as users, follows, photo metadata, captions, and relationships.
- **Read Replica:** Handles database read traffic separately from the primary database, allowing feed queries to scale without putting all read load on the primary.
- **Object Storage:** Stores the large original photo files and generated thumbnails separately from the relational database.
- **Queue:** Temporarily stores thumbnail-generation jobs so uploads do not have to wait for image processing to finish.
- **Worker:** Takes jobs from the queue, generates thumbnails from uploaded photos, and saves the resulting thumbnails in object storage.

## 10. Photo Upload Flow

1. A user selects a photo and sends an upload request to SnapShare.
2. The request reaches the **load balancer**, which routes it to an available application server.
3. The application server authenticates the user and validates the upload.
4. The original photo is uploaded to **object storage** rather than being stored inside the database.
5. The application server creates a database record containing information such as the photo ID, user ID, object-storage location, upload time, and other metadata.
6. The application server places a **thumbnail-generation job** containing the photo information onto the queue.
7. The upload request can now return to the user without waiting for thumbnail processing to complete.
8. A **worker** takes the thumbnail job from the queue.
9. The worker retrieves the original photo from object storage and creates the 50 KB thumbnail.
10. The worker stores the generated thumbnail in object storage.
11. The thumbnail location or processing status can be recorded in the database.
12. When users view the photo in their feed, the application retrieves the necessary metadata and the CDN serves the photo or thumbnail efficiently.

## 11. Trade-Offs

### Trade-Off 1: Cache vs. Database Simplicity

Adding a cache makes feed reads much faster and reduces database load, but it introduces cache invalidation and consistency problems. The system becomes more complex because cached information can temporarily become outdated.

### Trade-Off 2: Read Replica vs. Strong Consistency

A read replica allows SnapShare to handle many more read requests, but replication can introduce a small delay between the primary database and the replica. A user might therefore briefly see slightly outdated information after an update.

### Trade-Off 3: Asynchronous Thumbnails vs. Immediate Availability

Using a queue and background worker makes uploads faster because users do not have to wait for thumbnail generation. However, the thumbnail is not guaranteed to exist immediately after the upload because the background job must be processed first.

### Trade-Off 4: Object Storage vs. Database Storage

Object storage is much better suited to large photo files and allows the system to scale its storage independently from the database. However, it introduces another service that must be managed and can make transactions involving metadata and files more complicated.

## 12. Summary

SnapShare has approximately **1 million daily active users**, producing about **1 million photo uploads per day** and **50 million feed views per day**.

The average traffic is approximately:

- **11.6 uploads/second**
- **579 feed views/second**

At 5× peak traffic:

- **58 uploads/second**
- **2,894 feed views/second**

The system is therefore **read-heavy**, so the architecture prioritizes efficient reads through a CDN, cache, horizontally scalable application servers, and a database read replica.

Original photos and thumbnails are stored in **object storage**, while the relational database stores metadata. A **queue and background worker** handle thumbnail generation asynchronously so photo uploads remain fast and reliable.
