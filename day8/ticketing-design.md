# TicketHub — Event Ticketing System Design

## 1. Requirements

### Functional
- Browse upcoming concerts and events.
- View event details, seat maps, and current availability.
- Temporarily hold available seats during checkout.
- Pay for a valid hold and receive tickets.
- View purchased tickets and order history.
- Automatically release expired holds.

### Non-functional
- **Speed:** normal browsing and seat availability should be low-latency; checkout should quickly report success or failure.
- **Correctness:** a seat can have at most one successful buyer/order.
- **Fairness:** a virtual waiting room and rate limiting prevent bots, excessive refreshes, or a small group of clients from overwhelming a major sale.
- **Availability:** browsing remains usable during spikes even when checkout is throttled.
- **Durability/security:** orders are durable and payment details are delegated to a PCI-compliant payment provider.
- **Scalability:** application servers scale horizontally.
- **Observability:** monitor latency, errors, queue depth, payment failures, and seat-hold conflicts.

## 2. Estimates

### Normal traffic
50,000 visitors/day × 10 pages = **500,000 page views/day**.

500,000 ÷ 86,400 = **5.8 requests/second average**.

Using a 5× peak factor gives about **29 requests/second peak**.

5,000 tickets/day ÷ 86,400 = **0.058 ticket sales/second average**.

### Popular concert
200,000 people try to buy 20,000 seats in 10 minutes.

200,000 ÷ 600 = **333 purchase attempts/second** if each person makes one initial attempt.

20,000 ÷ 600 = **33 seats/second** sold across the window.

Real users will refresh and make several API calls, so the sale path should be capable of **1,000+ requests/second**, while the waiting room and rate limiter control how much reaches the transactional system.

| Metric | Normal day | Popular sale |
|---|---:|---:|
| Users/visitors | 50,000/day | 200,000/10 min |
| Page views/initial attempts | 500,000/day | 200,000 initial attempts |
| Average critical rate | 5.8 req/s | 333 purchase attempts/s |
| Planning peak | 29 req/s | 1,000+ sale-path req/s |
| Tickets/seats | 5,000 sold/day | 20,000 seats |

The initial purchase-attempt rate during the sale is about **57×** the normal daily average page-view rate, before retries and refreshes.

## 3. API design

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| GET | /api/v1/events | Browse events with pagination/filtering | 200 |
| GET | /api/v1/events/{eventId} | View event details | 200 |
| GET | /api/v1/events/{eventId}/seats | View seat map and availability | 200 |
| POST | /api/v1/events/{eventId}/holds | Temporarily hold seats | 201 |
| POST | /api/v1/orders | Pay for a valid hold and create an order | 201 |
| GET | /api/v1/me/tickets | View the user's tickets | 200 |
| GET | /api/v1/orders/{orderId} | View order/payment status | 200 |
| DELETE | /api/v1/holds/{holdId} | Release a hold | 204 |

### Hold request

~~~json
{
  "seat_ids": [1201, 1202],
  "idempotency_key": "9b2d..."
}
~~~

### Hold response

~~~json
{
  "hold_id": "h_7821",
  "expires_at": "2026-10-08T19:05:00Z",
  "seat_ids": [1201, 1202],
  "status": "held"
}
~~~

A hold lasts 5–10 minutes. A seat already held or sold returns **409 Conflict**. Payment verifies the hold, uses an idempotency key, and atomically changes the seats/order to sold.

## 4. Data model

The design uses the required four tables plus order_items so one order can contain several seats.

### users
- id BIGINT PRIMARY KEY
- email VARCHAR(255) UNIQUE NOT NULL
- name VARCHAR(120) NOT NULL
- created_at TIMESTAMP NOT NULL

### events
- id BIGINT PRIMARY KEY
- name VARCHAR(200) NOT NULL
- venue VARCHAR(200) NOT NULL
- starts_at TIMESTAMP NOT NULL
- created_at TIMESTAMP NOT NULL

### seats
- id BIGINT PRIMARY KEY
- event_id BIGINT NOT NULL REFERENCES events(id)
- section VARCHAR(80) NOT NULL
- row_label VARCHAR(20) NOT NULL
- seat_number INT NOT NULL
- status VARCHAR(20) NOT NULL
- hold_id UUID NULL
- hold_expires_at TIMESTAMP NULL

Constraint/index design:
- UNIQUE(event_id, section, row_label, seat_number) prevents duplicate physical seats within an event.
- Index (event_id, status) makes availability queries fast.

### orders
- id BIGINT PRIMARY KEY
- user_id BIGINT NOT NULL REFERENCES users(id)
- event_id BIGINT NOT NULL REFERENCES events(id)
- status VARCHAR(30) NOT NULL
- payment_reference VARCHAR(255) UNIQUE NULL
- created_at TIMESTAMP NOT NULL

### order_items
- order_id BIGINT NOT NULL REFERENCES orders(id)
- seat_id BIGINT NOT NULL REFERENCES seats(id)
- price_cents BIGINT NOT NULL
- PRIMARY KEY(order_id, seat_id)

### Relationships
- One user has many orders.
- One event has many seats.
- One event has many orders.
- One order has many order_items.
- Each order_item references one seat.

### Preventing double-booking

1. Start a database transaction for a hold.
2. Lock requested seat rows using SELECT ... FOR UPDATE.
3. Re-check that every seat is available or its previous hold has expired.
4. If all are available, set them to HELD with one hold ID and expiration, then commit.
5. If any is unavailable, roll back and return 409 Conflict.
6. During payment, lock the held seats again, verify the hold belongs to the user and has not expired, create the order/order_items, mark the seats SOLD, and commit.
7. Use database constraints so the same seat cannot appear in two successful orders.

Application checks alone are unsafe because two app servers can see the same seat as available simultaneously. The database is the final source of truth.

Example payment transaction:

~~~sql
BEGIN;

SELECT id, status, hold_id, hold_expires_at
FROM seats
WHERE id IN (1201, 1202)
FOR UPDATE;

-- Verify the hold is valid.

INSERT INTO orders (user_id, event_id, status)
VALUES (42, 77, 'PAID')
RETURNING id;

INSERT INTO order_items (order_id, seat_id, price_cents)
VALUES
  (9001, 1201, 7500),
  (9001, 1202, 7500);

UPDATE seats
SET status = 'SOLD', hold_id = NULL, hold_expires_at = NULL
WHERE id IN (1201, 1202);

COMMIT;
~~~

If another buyer requests the same seats, row locking serializes the transactions. The second transaction sees SOLD after the first commits and cannot create another ticket.

## 5. Architecture

~~~text
                         Users / Browsers
                                |
                               DNS
                                |
                         CDN / Edge Cache
                                |
                         Load Balancer + WAF
                                |
                  Virtual Waiting Room / Rate Limit
                                |
                   +------------+------------+
                   |                         |
             App Server 1              App Server 2+
                   |                         |
              Redis Cache              Sale Queue
                   |                         |
                   |                    Sale Workers
                   |                         |
                   +-----------+-------------+
                               |
                     Primary Relational DB
                     users/seats/orders
                               |
                         Read Replica(s)

                    External Payment Provider
                              ^
                              |
                       Order Service
~~~

### Component explanations
- **DNS:** routes users to redundant service infrastructure.
- **CDN:** serves static assets and cacheable event content at the edge.
- **WAF/load balancer:** filters malicious traffic and distributes requests across healthy app servers.
- **Waiting room/rate limiter:** controls sale bursts and provides orderly admission.
- **App servers:** stateless business-logic instances that scale horizontally.
- **Redis:** caches frequently requested event/seat-map data; it is never the authority for seat ownership.
- **Sale queue:** buffers admitted purchase work so a sudden spike does not overwhelm the database.
- **Sale workers:** process queued work with bounded concurrency and safe retries.
- **Primary relational database:** authoritative source for seats, holds, orders, and transactions.
- **Read replicas:** handle read-heavy browsing and ticket-history queries.
- **Payment provider:** authorizes payment securely; TicketHub stores only a provider reference.

### GET seat-availability flow
1. Client requests a seat map.
2. CDN serves cacheable content where possible.
3. Otherwise the load balancer sends the request to an app server.
4. App checks Redis for short-lived availability data.
5. On a miss, it reads authoritative availability from a database/read replica.
6. Response is returned and may be cached briefly.
7. Holds and sales invalidate affected cache entries.

### Hold/payment flow
1. User enters through the waiting room during a major sale.
2. App receives seat IDs and an idempotency key.
3. Database transaction locks those seat rows.
4. Database verifies availability, writes the hold and expiration, and commits.
5. User pays while the hold is valid.
6. Order service validates the hold, locks the seats, confirms payment, creates order/items, marks seats SOLD, and commits.
7. Cache entries are invalidated and the ticket appears in the user's account.

### Surviving the big sale
The 200,000-user burst is controlled at the edge instead of allowing every client to hit the database. The waiting room/rate limiter controls admission, multiple app servers absorb admitted traffic, Redis handles repeated reads, and the queue smooths sale work. The primary database stays protected by bounded concurrency while row-level transactions preserve correctness.

## 6. Trade-offs

### Consistency vs performance
Caching seat availability reduces database load and latency, but cached maps can briefly be stale. Cache data is display-only; the transactional database decides whether a hold or purchase succeeds.

### Fairness vs throughput
A waiting room and rate limiter reduce immediate throughput for individual users, but stop aggressive refreshers/bots from monopolizing the system and make a high-demand sale more orderly.

### Synchronous correctness vs asynchronous scale
Queues improve burst handling, but the final seat/order transition must remain transactional and idempotent. Admission and other work can be queued while the authoritative state change stays in the database transaction.

### Read replicas vs immediate consistency
Read replicas increase browsing capacity, but replication lag can briefly show stale availability. Checkout never trusts a replica; it validates against the primary.

## Conclusion

TicketHub separates read scalability from transactional correctness. Edge controls, caching, horizontal app servers, and queues absorb the major-sale burst, while transactions, row locks, idempotency, and database constraints ensure two people cannot successfully buy the same seat.
