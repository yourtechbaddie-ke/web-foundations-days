const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const categoryInput = document.querySelector("#note-category");
const list = document.querySelector("#notes-list");
const count = document.querySelector("#note-count");

let notes = [];

function render() {
  list.textContent = "";

  notes.forEach((note) => {
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

    content.appendChild(details);
    content.appendChild(del);
    li.appendChild(content);
    list.appendChild(li);
  });

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
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  addNote(text, categoryInput.value);

  input.value = "";
  input.focus();
});

render();