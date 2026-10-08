# Web Foundations Days

Coursework repository for the Web Foundations course, organized by day and project. The repository contains the practical assignments, exercises, and larger QuickNotes projects completed throughout the course.

## Repository Structure

- `day1/` — Day 1 HTML foundations
- `day2/` — Day 2 CSS and responsive layout
- `day3/` — Day 3 JavaScript Notes Toolkit
- `day4/` — Day 4 Note Draft with localStorage and theme persistence
- `day5/` — Day 5 User Directory and Library API design
- `day6/` — Day 6 data and storage work, including database design and SQL
- `day7/` — Day 7 system design and scaling work
- `day8/` — Day 8 capstone design and presentation work, when completed
- `projects/` — Larger projects built from the course lessons

## Projects

### Project 1 — QuickNotes

Located in `projects/project1-quicknotes/`.

QuickNotes is a browser-based notes application built with HTML, CSS, and vanilla JavaScript. It supports:

- Creating notes with categories
- Input validation
- Deleting notes
- Searching notes
- Note counts and empty-search states
- localStorage persistence
- Responsive layout for smaller screens
- A Clear All option

The project demonstrates DOM manipulation, form handling, validation, localStorage, filtering, and responsive CSS.

### Project 2 — QuickNotes System Design

Located in `projects/project2-quicknotes-system-design/`.

This project extends QuickNotes into a system-design exercise and includes:

- A JavaScript API client using the Fetch API
- GET, POST, and DELETE requests against JSONPlaceholder
- Loading, success, error, and empty states
- Request validation and disabled controls during requests
- REST API design documentation
- Relational data model and SQL design
- Architecture and scaling plan for 1 million users
- Capacity estimates, trade-offs, caching, queues, load balancing, and database scaling considerations

Supporting documentation is stored in the project's `docs/` directory.

## Technologies

- HTML5
- CSS3
- JavaScript
- DOM APIs
- localStorage
- Fetch API
- JSON
- SQL
- REST API concepts
- System design and scalability concepts

## How to Use This Repository

Individual day assignments can be opened directly from their respective `dayN/` folders.

For the browser-based projects, open the project's `index.html` file in a browser or use a local development server.

Project 2's API client uses JSONPlaceholder as its practice API. Because JSONPlaceholder is a fake REST API, POST and DELETE operations are simulated and are not permanently stored on the service.

## Learning Focus

This repository tracks my progression from foundational web development into JavaScript, browser storage, API integration, database design, and system design.

The main learning areas include:

1. Building semantic HTML pages and forms.
2. Creating responsive layouts with CSS.
3. Writing JavaScript that interacts with the DOM.
4. Validating and handling user input.
5. Persisting browser data with localStorage.
6. Working with REST APIs and asynchronous JavaScript.
7. Designing relational databases with keys and relationships.
8. Thinking about application architecture, scaling, reliability, and trade-offs.
