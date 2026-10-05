// =====================================================
// QuickNotes - Project 1 Solution
// =====================================================

const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const categorySelect = document.querySelector("#note-category");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");
const list = document.querySelector("#notes-list");
const count = document.querySelector("#note-count");
const clearAllBtn = document.querySelector("#clear-all");

const STORAGE_KEY = "quicknotes";
const MAX_LENGTH = 200;

let notes = loadNotes();

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Saved notes were damaged. Starting fresh.", error);
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function validate(text) {
  if (text === "") return "Please type a note first.";
  if (text.length > MAX_LENGTH) return "Notes must be 200 characters or fewer.";
  return "";
}

function showError(message) {
  errorMessage.textContent = message;
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function countMessage(total) {
  if (total === 0) return "You have no notes yet.";
  if (total === 1) return "You have 1 note.";
  return `You have ${total} notes.`;
}

function createNoteElement(note) {
  const li = document.createElement("li");
  li.classList.add("note", `category-${note.category}`);

  const body = document.createElement("div");
  body.classList.add("note-body");

  const text = document.createElement("p");
  text.classList.add("note-text");
  text.textContent = note.text;

  const meta = document.createElement("div");
  meta.classList.add("note-meta");

  const badge = document.createElement("span");
  badge.classList.add("badge");
  badge.textContent = capitalise(note.category);

  const date = document.createElement("span");
  date.textContent = note.createdAt;

  meta.append(badge, date);
  body.append(text, meta);

  const del = document.createElement("button");
  del.type = "button";
  del.classList.add("delete-btn");
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteNote(note.id));

  li.append(body, del);
  return li;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();

  const visibleNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(query)
  );

  list.replaceChildren();

  if (notes.length > 0 && visibleNotes.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty-message");
    empty.textContent = "No notes match your search.";
    list.appendChild(empty);
  }

  visibleNotes.forEach((note) => {
    list.appendChild(createNoteElement(note));
  });

  count.textContent = countMessage(notes.length);
  clearAllBtn.hidden = notes.length === 0;
}

function addNote(text, category) {
  const note = {
    id: Date.now(),
    text: text,
    category: category,
    createdAt: new Date().toLocaleString(),
  };
  notes.unshift(note);
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

function clearAll() {
  if (!confirm("Delete all notes?")) return;
  notes = [];
  saveNotes();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  const error = validate(text);

  if (error) {
    showError(error);
    input.focus();
    return;
  }

  showError("");
  addNote(text, categorySelect.value);
  input.value = "";
  input.focus();
});

searchInput.addEventListener("input", render);
clearAllBtn.addEventListener("click", clearAll);

render();
