# QuickNotes

QuickNotes is a small browser-based note-taking app built with HTML, CSS, and vanilla JavaScript. It lets users create categorized notes, validate note length, delete notes, search note text, and keep notes saved in the browser with localStorage.

## Features

- Add notes with Personal, Work, or Study categories
- Validate empty notes and notes longer than 200 characters
- Display notes as styled cards with category labels and timestamps
- Delete individual notes
- Search notes by text without case sensitivity
- Persist notes with localStorage
- Show accurate note counts for zero, one, and multiple notes
- Responsive layout for small screens

## How to run locally

1. Clone or download this repository.
2. Open the repository folder in your code editor.
3. Open `index.html` in a web browser, or use a local development server such as VS Code Live Server.
4. Add, search, and delete notes to test the app. Refresh the page to verify that saved notes persist.

## What I learned

- How to structure a small web application with semantic HTML and accessible form labels.
- How to use Flexbox, responsive media queries, and category-specific CSS classes to create a usable interface.
- How to manage application state with JavaScript arrays and rebuild the DOM with `createElement` and `textContent`.
- How to validate user input and handle form and button events.
- How to persist structured data with `localStorage`, `JSON.stringify`, and `JSON.parse`.
- How to implement case-insensitive search and maintain a meaningful Git commit history while building features incrementally.
