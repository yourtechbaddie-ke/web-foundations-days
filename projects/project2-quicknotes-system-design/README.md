# QuickNotes System Design — Project 2

QuickNotes is a browser API client and production-oriented system design for a note-taking service intended to scale to **1 million users**.

This project has two halves:

1. A small HTML/CSS/JavaScript client that demonstrates GET, POST and DELETE requests against the JSONPlaceholder practice API.
2. Backend design documents covering the production REST API, relational data model and scalable architecture.

## Project structure

    projects/project2-quicknotes-system-design/
    ├── index.html
    ├── api.js
    ├── style.css
    ├── README.md
    └── docs/
        ├── api-design.md
        ├── data-model.md
        └── architecture.md

## How to run the API client

No backend installation is required for the practice client.

1. Open the project folder in a browser-based editor or local development server.
2. Open `index.html`.
3. Click **Load notes** to fetch 10 notes from JSONPlaceholder.
4. Use the form to create a note.
5. Use a note's **Delete** button to send a DELETE request.

For the best browser experience, serve the project directory through a simple local HTTP server, for example:

    python -m http.server 8000

Then open:

    http://localhost:8000/projects/project2-quicknotes-system-design/

The client uses:

    https://jsonplaceholder.typicode.com/posts

JSONPlaceholder is a practice API, so POST and DELETE mutations are simulated rather than permanently stored.

## Design documents

- [API Design](docs/api-design.md) — production REST endpoints, JSON examples and error handling.
- [Data Model](docs/data-model.md) — users, notes, tags, note_tags, SQL schema, queries and indexes.
- [Architecture](docs/architecture.md) — requirements, load estimates, scalable architecture, request flows and trade-offs.

## API client features

- GET loads 10 notes.
- POST validates the title and creates a note.
- DELETE removes a note from the current page after a successful request.
- Loading, success, error and empty states are displayed.
- Request buttons are disabled while their requests are running.
- User-provided text is rendered with `textContent`, not `innerHTML`.
- The title is required and limited to 100 characters.

## What I learned

1. **API clients need predictable request handling.** A reusable async `request()` function keeps fetch error handling consistent and makes GET, POST and DELETE easier to maintain.
2. **Frontend behavior should reflect API state.** Loading, success, error and empty states make asynchronous operations understandable to users, while disabling controls prevents duplicate requests.
3. **Relational data modeling depends on relationships.** Users-to-notes and users-to-tags are one-to-many relationships, while notes-to-tags needs a `note_tags` join table for the many-to-many relationship.
4. **Read-heavy systems need read optimization.** Caching, a CDN and a read replica reduce pressure on the primary database when reads greatly outnumber writes.
5. **Asynchronous work improves request latency.** A durable queue and worker let background tasks happen outside the user-facing request path.
6. **Scaling requires trade-offs.** Caching can introduce stale data, read replicas can lag, and queues introduce eventual consistency, so each scaling decision must be balanced against correctness and complexity.

## Git history

The project was built in meaningful increments covering the API client, API design, data model, architecture and README so each major part can be reviewed independently.
