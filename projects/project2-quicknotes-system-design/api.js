const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const form = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitBtn = document.querySelector("#submit-btn");
const notesList = document.querySelector("#notes-list");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

function renderEmptyState() {
  notesList.textContent = "";
  const empty = document.createElement("li");
  empty.textContent = "No notes found.";
  empty.className = "empty-state";
  notesList.appendChild(empty);
}

function renderNote(note, prepend = false) {
  const item = document.createElement("li");
  item.className = "note";

  const title = document.createElement("h3");
  title.textContent = note.title;

  const body = document.createElement("p");
  body.textContent = note.body || "No body provided.";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteNote(note.id, item, deleteBtn));

  item.append(title, body, deleteBtn);

  if (prepend) {
    notesList.prepend(item);
  } else {
    notesList.appendChild(item);
  }
}

async function loadNotes() {
  loadBtn.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const response = await request(`${API_URL}?_limit=10`);
    const notes = await response.json();

    notesList.textContent = "";

    if (notes.length === 0) {
      renderEmptyState();
    } else {
      notes.forEach((note) => renderNote(note));
    }

    setStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    setStatus("Sorry, we could not load the notes. Please try again.", "error");
    notesList.textContent = "";
    renderEmptyState();
  } finally {
    loadBtn.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("A title is required.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("Title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitBtn.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const response = await request(API_URL, {
      method: "POST",
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    const note = await response.json();
    renderNote(note, true);
    setStatus(`Note created (status ${response.status}, id ${note.id}).`, "success");
    form.reset();
  } catch (error) {
    setStatus("Sorry, we could not create the note. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
}

async function deleteNote(id, item, button) {
  button.disabled = true;
  setStatus("Deleting note...", "loading");

  try {
    // JSONPlaceholder accepts DELETE requests but does not permanently store mutations.
    await request(`${API_URL}/${id}`, { method: "DELETE" });
    item.remove();
    if (!notesList.querySelector(".note")) {
      renderEmptyState();
    }
    setStatus(`Note ${id} deleted successfully.`, "success");
  } catch (error) {
    button.disabled = false;
    setStatus("Sorry, we could not delete the note. Please try again.", "error");
  } finally {
    button.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);
form.addEventListener("submit", createNote);
