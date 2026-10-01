// 1. Our data: an array of note objects
let notes = [
  { id: 1, text: "Revise HTML forms", category: "study" },
  { id: 2, text: "Buy groceries", category: "personal" },
  { id: 3, text: "Prepare project update", category: "work" },
  { id: 4, text: "Practise JavaScript arrays", category: "study" },
  { id: 5, text: "Call Mum", category: "personal" },
];

// 2. Search notes by text, ignoring upper and lower case
function searchNotes(word) {
  const searchTerm = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

// 3. Find the note with the most characters
function longestNote() {
  if (notes.length === 0) return null;

  return notes.reduce((longest, note) =>
    note.text.length > longest.text.length ? note : longest
  );
}

// 4. Count notes by category
function countByCategory() {
  const counts = {};

  for (const note of notes) {
    if (!counts[note.category]) {
      counts[note.category] = 0;
    }
    counts[note.category]++;
  }

  return counts;
}

// 5. Create a friendly summary
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";

  return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

// 6. Check for duplicate text, ignoring case and extra spaces
function isDuplicate(text) {
  const cleanedText = text.trim().toLowerCase();

  return notes.some((note) => note.text.trim().toLowerCase() === cleanedText);
}

// 7. Add a valid, non-duplicate note
function addNote(text, category) {
  const cleanedText = text.trim();
  const validCategories = ["personal", "work", "study"];

  if (cleanedText.length < 1 || cleanedText.length > 200) {
    console.log("❌ Note rejected: text must be 1-200 characters.");
    return false;
  }

  if (isDuplicate(cleanedText)) {
    console.log("❌ Note rejected: duplicate note.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("❌ Note rejected: category must be personal, work, or study.");
    return false;
  }

  notes.push({
    id: Date.now(),
    text: cleanedText,
    category,
  });

  console.log(`✅ Note added: "${cleanedText}"`);
  return true;
}

// --- Tests: normal case and edge case for every function ---

console.log(searchNotes("HTML"));
// Expected: [{ id: 1, text: "Revise HTML forms", category: "study" }]
console.log(searchNotes("Python"));
// Expected: []

console.log(longestNote());
// Expected: { id: 4, text: "Practise JavaScript arrays", category: "study" }
const savedNotes = notes;
notes = [];
console.log(longestNote());
// Expected: null
notes = savedNotes;

console.log(countByCategory());
// Expected: { study: 2, personal: 2, work: 1 }
notes = [{ id: 6, text: "Only personal note", category: "personal" }];
console.log(countByCategory());
// Expected: { personal: 1 }

notes = [
  { id: 1, text: "Revise HTML forms", category: "study" },
  { id: 2, text: "Buy groceries", category: "personal" },
  { id: 3, text: "Prepare project update", category: "work" },
  { id: 4, text: "Practise JavaScript arrays", category: "study" },
  { id: 5, text: "Call Mum", category: "personal" },
];

console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."
notes = [];
console.log(getSummary());
// Expected: "0 notes: 0 personal, 0 work, 0 study."

notes = [
  { id: 1, text: "Revise HTML forms", category: "study" },
  { id: 2, text: "Buy groceries", category: "personal" },
  { id: 3, text: "Prepare project update", category: "work" },
  { id: 4, text: "Practise JavaScript arrays", category: "study" },
  { id: 5, text: "Call Mum", category: "personal" },
];

console.log(isDuplicate("  revise html forms  "));
// Expected: true
console.log(isDuplicate("Learn CSS Grid"));
// Expected: false

console.log(addNote("Learn CSS Grid", "study"));
// Expected: true
console.log(addNote("  revise html forms  ", "study"));
// Expected: false
console.log(addNote("A", "other"));
// Expected: false
console.log(addNote("   ", "personal"));
// Expected: false
