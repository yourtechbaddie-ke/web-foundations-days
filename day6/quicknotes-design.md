# QuickNotes Database Design

## Entities

### users
- `id` — INTEGER, primary key.
- `name` — TEXT, NOT NULL.
- `email` — TEXT, NOT NULL, UNIQUE.

### notes
- `id` — INTEGER, primary key.
- `user_id` — INTEGER, NOT NULL, foreign key to `users(id)`.
- `title` — TEXT, NOT NULL.
- `text` — TEXT, NOT NULL.
- `created_at` — TEXT, NOT NULL, stored as an ISO-style timestamp.

### tags
- `id` — INTEGER, primary key.
- `name` — TEXT, NOT NULL, UNIQUE.

### note_tags
- `note_id` — INTEGER, NOT NULL, foreign key to `notes(id)`.
- `tag_id` — INTEGER, NOT NULL, foreign key to `tags(id)`.
- Primary key: `(note_id, tag_id)`.

The composite primary key prevents the same tag from being attached to the same note twice.

## Relationships

**Users → Notes is one-to-many.** One user can have many notes, while each note belongs to one user. The `notes.user_id` foreign key represents this relationship.

**Notes ↔ Tags is many-to-many.** One note can have many tags, and one tag can be attached to many notes. The `note_tags` join table stores each note/tag pair and holds the two foreign keys.

## Useful queries

- Amina's notes use a JOIN from `users` to `notes` and order by `created_at DESC`.
- Urgent notes use two JOINs: `notes → note_tags → tags`.
- Notes per user use `LEFT JOIN` and `GROUP BY` so users with zero notes are still included.

## Indexes

I would index `notes(user_id, created_at DESC)` because the application frequently retrieves a user's notes and needs them newest first. I would also index `note_tags(tag_id)` because the composite primary key starts with `note_id`, while the urgent-tag query needs to find rows by `tag_id`. The UNIQUE constraints on `users.email` and `tags.name` already require SQLite to maintain indexes for those values.
