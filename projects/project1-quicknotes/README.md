# Project 1: Build QuickNotes

QuickNotes is a browser-based note-taking app built with HTML, CSS, and vanilla JavaScript. Users can create categorized notes, validate note length, delete notes, search note text, and keep their notes saved in the browser with localStorage.

## Features

- Add notes with Personal, Work, or Study categories
- Validate empty notes and notes longer than 200 characters
- Display note cards with category labels and timestamps
- Delete individual notes
- Search notes by text, case-insensitively
- Persist notes with localStorage
- Show accurate zero, one, and many note counts
- Responsive layout for small screens

## Run locally

1. Open the `projects/project1-quicknotes/` folder in your code editor.
2. Open `index.html` directly in a browser, or use a local development server such as VS Code Live Server.
3. Add notes, search them, delete them, and refresh the page to verify persistence.

## What I learned

- How to structure a small application with semantic HTML and accessible form controls.
- How to use Flexbox, responsive CSS, and category-specific classes to style a responsive interface.
- How to manage application state with JavaScript arrays and rebuild the DOM using `createElement` and `textContent`.
- How to validate input and handle form, delete, and search events.
- How to persist structured data with `localStorage`, `JSON.stringify`, and `JSON.parse`.
