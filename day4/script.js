// ---------- 1. Find the page controls ----------
const draftField = document.querySelector("#note-text");
const characterDisplay = document.querySelector("#char-count");
const wordDisplay = document.querySelector("#word-count");
const clearButton = document.querySelector("#clear-btn");
const themeButton = document.querySelector("#theme-toggle");

const MAX_CHARS = 200;
const WARNING_LIMIT = 180;
const DRAFT_STORAGE = "note-draft";
const THEME_STORAGE = "theme";

// ---------- 2. Count words and refresh the counters ----------
function getWordCount(value) {
  const cleaned = value.trim();
  return cleaned === "" ? 0 : cleaned.split(/\s+/).length;
}

function refreshCounters() {
  const value = draftField.value;
  const characters = value.length;
  const words = getWordCount(value);

  characterDisplay.textContent = `${characters} / ${MAX_CHARS} characters`;
  wordDisplay.textContent = words === 1 ? "1 word" : `${words} words`;

  characterDisplay.classList.remove("warning", "over");

  if (characters > MAX_CHARS) {
    characterDisplay.classList.add("over");
  } else if (characters > WARNING_LIMIT) {
    characterDisplay.classList.add("warning");
  }
}

// ---------- 3. Save and clear the draft ----------
function storeDraft() {
  localStorage.setItem(DRAFT_STORAGE, draftField.value);
}

function clearDraft() {
  draftField.value = "";
  localStorage.removeItem(DRAFT_STORAGE);
  refreshCounters();
  draftField.focus();
}

// ---------- 4. Apply and switch the theme ----------
function setTheme(theme) {
  const darkMode = theme === "dark";
  document.body.classList.toggle("dark", darkMode);
  themeButton.textContent = darkMode ? "Light mode" : "Dark mode";
}

function switchTheme() {
  const nextTheme = document.body.classList.contains("dark")
    ? "light"
    : "dark";

  setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE, nextTheme);
}

// ---------- 5. Respond to user actions ----------
draftField.addEventListener("input", () => {
  refreshCounters();
  storeDraft();
});

draftField.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearDraft();
  }
});

clearButton.addEventListener("click", clearDraft);
themeButton.addEventListener("click", switchTheme);

// ---------- 6. Restore saved draft and theme ----------
draftField.value = localStorage.getItem(DRAFT_STORAGE) || "";
setTheme(localStorage.getItem(THEME_STORAGE) || "light");
refreshCounters();
