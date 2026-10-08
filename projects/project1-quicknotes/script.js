// QuickNotes - Project 1

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
const VALID_CATEGORIES = new Set(["personal", "work", "study"]);

let notes = loadNotes();

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((note) =>
      note &&
      (typeof note.id === "number" || typeof note.id === "string") &&
      typeof note.text === "string" &&
      typeof note.createdAt === "string" &&
      VALID_CATEGORIES.has(note.category)
    );
  } catch {
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch {
    showError("Your note was changed, but it could not be saved on this device.");
    return false;
  }
}

function validate(text, category) {
  if (!text) return "Please type a note first.";
  if (text.length > MAX_LENGTH) return "Notes must be 200 characters or fewer.";
  if (!VALID_CATEGORIES.has(category)) return "Please choose a valid category.";
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
  return total === 1 ? "You have 1 note." : `You have ${total} notes.`;
}

function noteTime(note) {
  const time = Date.parse(note.createdAt);
  return Number.isNaN(time) ? 0 : time;
}

function displayDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function createNoteElement(note) {
  const li = document.createElement("li");
  li.classList.add("note", `category-${note.category}`);

  const body = document.createElement("div");
  body.className = "note-body";

  const text = document.createElement("p");
  text.className = "note-text";
  text.textContent = note.text;

  const meta = document.createElement("div");
  meta.className = "note-meta";

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = capitalise(note.category);

  const date = document.createElement("span");
  date.textContent = displayDate(note.createdAt);

  meta.append(badge, date);
  body.append(text, meta);

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete-btn";
  del.textContent = "Delete";
  del.setAttribute("aria-label", `Delete note: ${note.text.slice(0, 40)}`);
  del.addEventListener("click", () => deleteNote(note.id));

  li.append(body, del);
  return li;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();

  const visibleNotes = [...notes]
    .sort((a, b) => noteTime(b) - noteTime(a))
    .filter((note) => note.text.toLowerCase().includes(query));

  list.replaceChildren();

  if (visibleNotes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = notes.length
      ? "No notes match your search."
      : "You have no notes yet.";
    list.appendChild(empty);
  } else {
    visibleNotes.forEach((note) => list.appendChild(createNoteElement(note)));
  }

  count.textContent = countMessage(notes.length);
  clearAllBtn.hidden = notes.length === 0;
}

function addNote(text, category) {
  const note = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    category,
    createdAt: new Date().toISOString(),
  };

  notes.push(note);
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

function clearAll() {
  if (!notes.length) return;
  if (!window.confirm("Delete all notes?")) return;

  notes = [];
  saveNotes();
  showError("");
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  const category = categorySelect.value;
  const error = validate(text, category);

  if (error) {
    showError(error);
    input.focus();
    return;
  }

  showError("");
  addNote(text, category);
  input.value = "";
  input.focus();
});

searchInput.addEventListener("input", render);
clearAllBtn.addEventListener("click", clearAll);

render();
