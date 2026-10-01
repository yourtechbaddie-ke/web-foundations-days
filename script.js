const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const categoryInput = document.querySelector("#note-category");
const list = document.querySelector("#notes-list");
const count = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");

const STORAGE_KEY = "quicknotes";
let notes = loadNotes();

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);

  try {
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function render(notesToRender = notes) {
  list.textContent = "";

  if (notesToRender.length === 0 && searchInput.value.trim() !== "") {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes match your search.";
    list.appendChild(emptyMessage);
  } else {
    notesToRender.forEach((note) => {
      const li = document.createElement("li");
      li.classList.add("note", `category-${note.category.toLowerCase()}`);

      const content = document.createElement("div");
      content.classList.add("note-content");

      const details = document.createElement("div");

      const category = document.createElement("span");
      category.classList.add("note-category");
      category.textContent = note.category;

      const text = document.createElement("p");
      text.classList.add("note-text");
      text.textContent = note.text;

      const date = document.createElement("p");
      date.classList.add("note-meta");
      date.textContent = note.createdAt;

      details.appendChild(category);
      details.appendChild(text);
      details.appendChild(date);

      const del = document.createElement("button");
      del.type = "button";
      del.classList.add("delete-btn");
      del.textContent = "Delete";
      del.addEventListener("click", () => deleteNote(note.id));

      content.appendChild(details);
      content.appendChild(del);
      li.appendChild(content);
      list.appendChild(li);
    });
  }

  count.textContent =
    notes.length === 0
      ? "You have no notes yet."
      : notes.length === 1
        ? "You have 1 note."
        : `You have ${notes.length} notes.`;
}

function addNote(text, category) {
  const newNote = {
    id: Date.now(),
    text,
    category,
    createdAt: new Date().toLocaleString(),
  };

  notes.push(newNote);
  saveNotes();
  render(getFilteredNotes());
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render(getFilteredNotes());
}

function getFilteredNotes() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    return notes;
  }

  return notes.filter((note) => note.text.toLowerCase().includes(query));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  errorMessage.textContent = "";
  addNote(text, categoryInput.value);

  input.value = "";
  input.focus();
});

searchInput.addEventListener("input", () => {
  render(getFilteredNotes());
});

render();