# QuickNotes — Project 1

QuickNotes is a small note-taking web app built with semantic HTML, CSS and vanilla JavaScript.

## Required project files

- `index.html` — semantic page structure and accessible form controls.
- `style.css` — responsive layout and category styling.
- `script.js` — validation, CRUD interactions, search and localStorage persistence.
- `README.md` — project documentation.

## Features

- Add notes with **Personal**, **Work**, or **Study** categories.
- Reject empty notes.
- Enforce a maximum note length of **200 characters**.
- Show clear validation messages.
- Search notes as the user types.
- Display notes newest first.
- Delete individual notes.
- Clear all notes with confirmation.
- Persist notes in `localStorage`.
- Restore saved notes after refreshing the page.
- Show an empty state when there are no notes or no search matches.
- Display a live note count.
- Render user-entered text with `textContent` rather than unsafe HTML injection.
- Responsive layout for small screens.

## How to run

1. Clone the repository.
2. Open `projects/project1-quicknotes/index.html` with a local development server such as VS Code Live Server.
3. Add a note, select its category, search, delete notes, and test the clear-all confirmation.
4. Refresh the page to verify localStorage persistence.

## Validation

A valid note must:

- contain non-whitespace text;
- be no longer than 200 characters;
- use one of the supported categories.

## Data stored in localStorage

The app stores notes under the key `quicknotes`. Each note contains:

```json
{
  "id": "unique-id",
  "text": "Example note",
  "category": "study",
  "createdAt": "2026-10-08T12:00:00.000Z"
}
```

The application validates the saved JSON before rendering it so malformed localStorage data does not crash the page.

## What I learned

- Semantic HTML gives the application a clear, accessible structure.
- CSS media queries make the interface usable on smaller screens.
- JavaScript event handlers can update the DOM without reloading the page.
- localStorage and JSON can persist client-side application state.
- `textContent` is safer than inserting untrusted user input with `innerHTML`.
- Separating validation, persistence, rendering and event handling makes the code easier to maintain.
