# QuickNotes

QuickNotes is a simple, fast note-taking web app built with plain HTML,
CSS and JavaScript. Users can add notes with a category, search them,
delete them, and their notes are saved in the browser so they are still
there after a refresh.

## Features

- Add notes with a category (Personal, Work, Study)
- Colour-coded note cards showing category and date
- Validation for empty and over-long notes (max 200 characters)
- Delete single notes or clear all notes (with confirmation)
- Live search that filters notes as you type
- Notes saved with localStorage
- Responsive layout for phones and laptops

## How to Run Locally

1. Clone the repository:
   `git clone https://github.com/your-username/quicknotes-app.git`
2. Open the folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.

## What I Learned

- How to structure a page with semantic HTML and accessible forms
- How the CSS box model, Flexbox and media queries work together
- How to store app data as an array of objects and render it to the DOM
- Why `textContent` is safer than `innerHTML` for user input
- How to save and load data with localStorage and JSON
