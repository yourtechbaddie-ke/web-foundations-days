let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const VALID_CATEGORIES = ["personal", "work", "study"];

function searchNotes(term) {
  const query = term.trim().toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(query));
}

function longestNote() {
  if (notes.length === 0) return null;
  let result = notes[0];

  for (let index = 1; index < notes.length; index++) {
    if (notes[index].text.length > result.text.length) {
      result = notes[index];
    }
  }

  return result;
}

function countByCategory() {
  const totals = { personal: 0, work: 0, study: 0 };

  for (const note of notes) {
    if (Object.prototype.hasOwnProperty.call(totals, note.category)) {\n      totals[note.category] += 1;\n    }
  }

  return totals;
}

function getSummary() {
  const totals = countByCategory();
  const label = notes.length === 1 ? "note" : "notes";

  return notes.length + " " + label + ": " +
    totals.personal + " personal, " +
    totals.work + " work, " +
    totals.study + " study.";
}

function isDuplicate(text) {
  const target = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === target);
}

function addNote(text, category) {
  const value = text.trim();

  if (value.length === 0 || value.length > 200) {
    console.log("Rejected: a note must be 1-200 characters.");
    return false;
  }

  if (isDuplicate(value)) {
    console.log('Rejected: "' + value + '" already exists.');
    return false;
  }

  if (!VALID_CATEGORIES.includes(category)) {
    console.log('Rejected: "' + category + '" is not a valid category.');
    return false;
  }

  notes.push({
    id: Date.now(),
    text: value,
    category: category,
  });

  console.log('Added: "' + value + '" (' + category + ")");
  return true;
}

// ---------- Tests ----------
console.log(searchNotes("revise"));
console.log(searchNotes("BREAD"));
console.log(searchNotes("holiday"));

console.log(longestNote().text);

console.log(countByCategory());
console.log(getSummary());

console.log(isDuplicate("  call MUM "));
console.log(isDuplicate("Call dad"));

console.log(addNote("Read chapter 4", "study"));
console.log(addNote("call mum", "personal"));
console.log(addNote("   ", "work"));
console.log(addNote("Plan trip", "holiday"));
console.log(getSummary());
