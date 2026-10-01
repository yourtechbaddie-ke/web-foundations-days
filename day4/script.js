const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const DRAFT_KEY = "quick-notes-draft";
const THEME_KEY = "quick-notes-theme";

function updateCounts() {
  const text = noteText.value;
  const characters = text.length;
  const trimmedText = text.trim();
  const words = trimmedText === "" ? 0 : trimmedText.split(/\s+/).length;

  charCount.textContent = `${characters} / 200 characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.toggle("warning", characters > 180 && characters <= 200);
  charCount.classList.toggle("over", characters > 200);
}

function clearNote() {
  noteText.value = "";
  updateCounts();
  localStorage.removeItem(DRAFT_KEY);
  noteText.focus();
}

function updateThemeButton() {
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "Light mode"
    : "Dark mode";
}

noteText.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem(DRAFT_KEY, noteText.value);
});

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  updateThemeButton();
});

const savedDraft = localStorage.getItem(DRAFT_KEY);
if (savedDraft !== null) {
  noteText.value = savedDraft;
}

if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
}

updateCounts();
updateThemeButton();
