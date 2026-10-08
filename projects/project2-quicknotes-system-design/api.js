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
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

function renderEmptyState(message = "No notes found.") {
  notesList.replaceChildren();
  const empty = document.createElement("li");
  empty.className = "empty-state";
  empty.textContent = message;
  notesList.appendChild(empty);
}

function renderNote(note, prepend = false) {
  const item = document.createElement("li");
  item.className = "note";

  const title = document.createElement("h3");
  title.textContent = note.title || "Untitled note";

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

    notesList.replaceChildren();

    if (!Array.isArray(notes) || notes.length === 0) {
      renderEmptyState();
      setStatus("No notes were returned by the server.", "success");
      return;
    }

    notes.forEach((note) => renderNote(note));
    setStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    console.error(error);
    renderEmptyState("Unable to load notes.");
    setStatus("Sorry, we could not load the notes. Please try again.", "error");
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
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    const note = await response.json();

    const emptyState = notesList.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    renderNote(note, true);
    setStatus(`Note created successfully (201 Created, id ${note.id}).`, "success");
    form.reset();
  } catch (error) {
    console.error(error);
    setStatus("Sorry, we could not create the note. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
}

async function deleteNote(id, item, button) {
  button.disabled = true;
  setStatus("Deleting note...", "loading");

  try {
    const response = await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (response.ok) {
      item.remove();
      if (!notesList.querySelector(".note")) renderEmptyState();
      setStatus(`Note ${id} deleted successfully (204 No Content).`, "success");
    }
  } catch (error) {
    console.error(error);
    setStatus("Sorry, we could not delete the note. Please try again.", "error");
  } finally {
    button.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);
form.addEventListener("submit", createNote);
