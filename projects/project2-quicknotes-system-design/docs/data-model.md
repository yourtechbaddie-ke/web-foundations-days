# QuickNotes Data Model

QuickNotes uses a relational SQL model because notes, users and tags have clear relationships and the application needs reliable transactions and referential integrity.

## Entities

### users

| Column | Type | Key |
|---|---|---|
| id | BIGINT | Primary key |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### notes

| Column | Type | Key |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key → users.id |
| title | VARCHAR(100) | |
| body | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### tags

| Column | Type | Key |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key → users.id |
| name | VARCHAR(50) | |
| created_at | TIMESTAMP | |

### note_tags

| Column | Type | Key |
|---|---|---|
| note_id | BIGINT | Foreign key → notes.id, composite primary key |
| tag_id | BIGINT | Foreign key → tags.id, composite primary key |

## Relationships

- **One-to-many:** one user can own many notes; each note belongs to one user.
- **One-to-many:** one user can create many tags; each tag belongs to a user.
- **Many-to-many:** a note can have many tags and a tag can belong to many notes. The `note_tags` join table stores each note/tag pair.

## CREATE TABLE statements

    CREATE TABLE users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE notes (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(100) NOT NULL,
      body TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE tags (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, name)
    );

    CREATE TABLE note_tags (
      note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (note_id, tag_id)
    );

## Indexes

    CREATE INDEX idx_notes_user_created_at
    ON notes(user_id, created_at DESC);

    CREATE INDEX idx_note_tags_tag_id
    ON note_tags(tag_id);

The first index speeds up the most common query: retrieving a user's notes in newest-first order. The second makes finding all notes associated with a tag efficient.

## Example queries

### 1. Get a user's newest notes

    SELECT id, title, body, created_at
    FROM notes
    WHERE user_id = 7
    ORDER BY created_at DESC
    LIMIT 20;

### 2. Find notes matching a tag

    SELECT n.id, n.title, n.body
    FROM notes AS n
    JOIN note_tags AS nt ON nt.note_id = n.id
    JOIN tags AS t ON t.id = nt.tag_id
    WHERE n.user_id = 7
      AND t.name = 'work'
    ORDER BY n.created_at DESC;

### 3. Count notes per user

    SELECT user_id, COUNT(*) AS note_count
    FROM notes
    GROUP BY user_id
    ORDER BY note_count DESC;

## SQL vs NoSQL

I would choose **SQL**, such as PostgreSQL, for QuickNotes. The data has strong relationships and constraints: every note belongs to a user, tags belong to users, and the many-to-many relationship needs a join table. SQL provides transactions, foreign keys, unique constraints and mature indexing. A NoSQL database could scale horizontally, but its flexible schema and denormalized relationships are less useful for this application's core access patterns.
