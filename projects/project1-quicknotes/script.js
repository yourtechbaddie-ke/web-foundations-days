const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const category = document.querySelector("#note-category");
const list = document.querySelector("#notes-list");
const count = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");

const STORAGE_KEY = "quicknotes-project1";

let notes = loadNotes();

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function render(notesToRender = notes) {
  list.replaceChildren();

  if (notesToRender.length === 0 && searchInput.value.trim() !== "") {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes match your search.";
    list.appendChild(emptyMessage);
  }

  notesToRender.forEach((note) => {
    const li = document.createElement("li");
    li.classList.add("note-card", `category-${note.category.toLowerCase()}`);

    const content = document.createElement("div");
    content.classList.add("note-content");

    const text = document.createElement("span");
    text.textContent = note.text;

    const categoryLabel = document.createElement("small");
    categoryLabel.classList.add("note-category");
    categoryLabel.textContent = note.category;

    const date = document.createElement("small");
    date.classList.add("note-date");
    date.textContent = note.createdAt;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(note.id));

    content.append(text, categoryLabel, date);
    li.append(content, deleteButton);
    list.appendChild(li);
  });

  count.textContent =
    notes.length === 0
      ? "You have 0 notes."
      : notes.length === 1
        ? "You have 1 note."
        : `You have ${notes.length} notes.`;
}

function addNote(text, selectedCategory) {
  const trimmedText = text.trim();

  if (trimmedText === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (trimmedText.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  errorMessage.textContent = "";

  const note = {
    id: Date.now(),
    text: trimmedText,
    category: selectedCategory,
    createdAt: new Date().toLocaleString(),
  };

  notes.push(note);
  saveNotes();
  render();
  input.value = "";
  input.focus();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

function searchNotes(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(normalizedQuery)
  );

  render(filteredNotes);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addNote(input.value, category.value);
});

searchInput.addEventListener("input", (event) => {
  searchNotes(event.target.value);
});

render();
