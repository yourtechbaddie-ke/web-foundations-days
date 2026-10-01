const API_URL = "https://jsonplaceholder.typicode.com/users";

const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];

function renderUsers(list) {
  usersList.replaceChildren();

  if (list.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No users match your filter.";
    usersList.appendChild(emptyMessage);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");

    const name = document.createElement("strong");
    name.textContent = user.name;

    const email = document.createElement("span");
    email.textContent = ` — ${user.email}`;

    const city = document.createElement("span");
    city.textContent = ` — ${user.address.city}`;

    const company = document.createElement("span");
    company.textContent = ` — ${user.company.name}`;

    li.append(name, email, city, company);
    usersList.appendChild(li);
  });
}

async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadButton.disabled = true;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    users = await response.json();
    renderUsers(users);
    statusText.textContent = `Loaded ${users.length} users.`;
  } catch (error) {
    users = [];
    usersList.replaceChildren();
    statusText.textContent = "Could not load users. Please try again.";
    console.error(error);
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(query)
  );

  renderUsers(filteredUsers);
});
