# QuickNotes System Design — Project 2

QuickNotes is a browser API client plus a production-oriented system design for a note-taking service intended to scale to **1 million users**.

## Project structure

```text
projects/project2-quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Part 1 — API client

The browser client uses the JSONPlaceholder practice API:

`https://jsonplaceholder.typicode.com/posts`

It demonstrates the required HTTP operations:

- **GET** `/posts?_limit=10` — loads 10 notes.
- **POST** `/posts` — creates a note using `title`, `body` and `userId: 1`.
- **DELETE** `/posts/{id}` — deletes the selected note.

JSONPlaceholder is a practice API, so POST and DELETE mutations are simulated rather than permanently stored.

### Client behavior

- A reusable asynchronous `request()` helper uses `fetch()` and checks `response.ok`.
- Network and HTTP errors are handled with `try/catch`.
- `finally` re-enables controls after requests finish.
- Loading, success, error and empty states are displayed.
- The Load and Create buttons are disabled while their requests are running.
- Delete buttons are disabled during deletion.
- Titles are required and limited to **100 characters**.
- User-provided note text is rendered with `textContent`, not `innerHTML`.
- The UI never treats the practice API as a permanent local database.

## How to run

No backend installation is required for the practice client.

1. Open this project in a browser-based editor or local development server.
2. Open `index.html`.
3. Click **Load notes**.
4. Create a note with a title and optional body.
5. Delete a displayed note and verify the success/error state.

For the best browser experience, serve the repository through a local HTTP server, for example:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000/projects/project2-quicknotes-system-design/`

## Part 2 — Production design

The documentation covers the three required system-design areas:

- [API Design](docs/api-design.md) — REST endpoints, methods, status codes, JSON examples, authentication and errors.
- [Data Model](docs/data-model.md) — users, notes, tags, the `note_tags` many-to-many join table, SQL schema, indexes and queries.
- [Architecture](docs/architecture.md) — 1-million-user load estimate, scalable architecture, request flows, failure handling and trade-offs.

## Design summary

### Data

Use a relational database such as PostgreSQL.

- `users` → one-to-many → `notes`
- `users` → one-to-many → `tags`
- `notes` ↔ many-to-many ↔ `tags` through `note_tags`

### Scaling

The workload is read-heavy, so the design uses:

- horizontally scalable stateless application servers;
- a load balancer;
- Redis-style caching for hot note lists;
- database read replicas;
- a primary database for authoritative writes;
- a durable queue and workers for asynchronous jobs;
- CDN/WAF for cacheable static assets and edge protection;
- monitoring, health checks, backups and failure recovery.

## What I learned

1. API clients need predictable request handling and clear user-facing states.
2. HTTP methods and status codes should communicate the operation clearly.
3. Authentication identifies a user, while authorization enforces ownership.
4. Many-to-many relationships require a join table in a normalized relational model.
5. Read-heavy systems benefit from caching and read replicas.
6. Queues keep slow background work outside the user-facing request path.
7. Every scaling decision introduces trade-offs such as stale caches, replica lag and operational complexity.
