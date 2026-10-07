PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for common reads.
CREATE INDEX idx_notes_user_created_at
    ON notes(user_id, created_at DESC);

CREATE INDEX idx_note_tags_tag_id
    ON note_tags(tag_id);

-- Sample data.
INSERT INTO users (id, name, email) VALUES
    (1, 'Amina', 'amina@example.com'),
    (2, 'Brian', 'brian@example.com'),
    (3, 'Chloe', 'chloe@example.com');

INSERT INTO notes (id, user_id, title, text, created_at) VALUES
    (1, 1, 'Exam revision', 'Revise SQL joins tonight.', '2026-10-06T19:00:00'),
    (2, 1, 'Shopping list', 'Buy notebooks and pens.', '2026-10-05T15:30:00'),
    (3, 2, 'Project idea', 'Build a small study planner.', '2026-10-04T10:00:00'),
    (4, 3, 'Meeting', 'Prepare the project update.', '2026-10-03T09:00:00');

INSERT INTO tags (id, name) VALUES
    (1, 'urgent'),
    (2, 'study'),
    (3, 'work');

INSERT INTO note_tags (note_id, tag_id) VALUES
    (1, 1),
    (1, 2),
    (2, 2),
    (3, 3),
    (4, 1);

-- All of Amina's notes, newest first.
SELECT notes.title, notes.text, notes.created_at
FROM users
JOIN notes ON notes.user_id = users.id
WHERE users.name = 'Amina'
ORDER BY notes.created_at DESC;

-- All notes tagged "urgent".
SELECT notes.title, notes.text
FROM notes
JOIN note_tags ON note_tags.note_id = notes.id
JOIN tags ON tags.id = note_tags.tag_id
WHERE tags.name = 'urgent'
ORDER BY notes.created_at DESC;

-- How many notes each user has.
SELECT users.name,
       COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON notes.user_id = users.id
GROUP BY users.id, users.name
ORDER BY users.name;
