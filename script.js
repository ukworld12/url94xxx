// ===============================
// SHORT URL MANAGER
// ===============================

// Change this password before publishing.
const APP_PASSWORD = "123456";

// Storage keys
const URLS_KEY = "short_url_manager_urls";
const LOGIN_KEY = "short_url_manager_logged_in";


// ===============================
// DOM ELEMENTS
// ===============================

const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");

const logoutBtn = document.getElementById("logoutBtn");

const createForm = document.getElementById("createForm");
const longUrlInput = document.getElementById("longUrl");
const customCodeInput = document.getElementById("customCode");
const createMessage = document.getElementById("createMessage");

const urlList = document.getElementById("urlList");
const emptyState = document.getElementById("emptyState");

const totalUrls = document.getElementById("totalUrls");
const activeUrls = document.getElementById("activeUrls");

const clearAllBtn = document.getElementById("clearAllBtn");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editId = document.getElementById("editId");
const editLongUrl = document.getElementById("editLongUrl");
const editCode = document.getElementById("editCode");
const closeModalBtn = document.getElementById("closeModalBtn");


// ===============================
// STORAGE
// ===============================

function getUrls() {
  try {
    return JSON.parse(localStorage.getItem(URLS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUrls(urls) {
  localStorage.setItem(URLS_KEY, JSON.stringify(urls));
}


// ===============================
// LOGIN
// ===============================

function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");

  renderUrls();
}

function showLogin() {
  dashboardScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");

  passwordInput.value = "";
  passwordInput.focus();
}

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const password = passwordInput.value;

  if (password === APP_PASSWORD) {
    sessionStorage.setItem(LOGIN_KEY, "true");

    loginError.textContent = "";

    showDashboard();
  } else {
    loginError.textContent = "Incorrect password.";
    passwordInput.value = "";
    passwordInput.focus();
  }
});


logoutBtn.addEventListener("click", function () {
  sessionStorage.removeItem(LOGIN_KEY);
  showLogin();
});


// ===============================
// INITIAL LOGIN CHECK
// ===============================

if (sessionStorage.getItem(LOGIN_KEY) === "true") {
  showDashboard();
} else {
  showLogin();
}


// ===============================
// CREATE SHORT URL
// ===============================

createForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const longUrl = longUrlInput.value.trim();
  let code = customCodeInput.value.trim();

  if (!isValidUrl(longUrl)) {
    showMessage("Please enter a valid URL.", "error");
    return;
  }

  // Generate random code if empty
  if (!code) {
    code = generateCode();
  }

  code = cleanCode(code);

  if (!code) {
    showMessage("Please enter a valid short code.", "error");
    return;
  }

  const urls = getUrls();

  // Check duplicate code
  const exists = urls.some(
    item => item.code.toLowerCase() === code.toLowerCase()
  );

  if (exists) {
    showMessage("This short code already exists.", "error");
    return;
  }

  const newUrl = {
    id: Date.now().toString(),
    code: code,
    longUrl: longUrl,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  urls.unshift(newUrl);

  saveUrls(urls);

  createForm.reset();

  showMessage("Short URL created successfully.", "success");

  renderUrls();
});


// ===============================
// URL VALIDATION
// ===============================

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}


// ===============================
// CLEAN SHORT CODE
// ===============================

function cleanCode(code) {
  return code
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .substring(0, 30);
}


// ===============================
// RANDOM SHORT CODE
// ===============================

function generateCode(length = 6) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return result;
}


// ===============================
// SHORT URL
// ===============================

function getShortUrl(code) {
  return window.location.origin +
    window.location.pathname.replace(/\/[^/]*$/, "/") +
    "?s=" +
    encodeURIComponent(code);
}


// ===============================
// DISPLAY URLS
// ===============================

function renderUrls() {
  const urls = getUrls();

  urlList.innerHTML = "";

  totalUrls.textContent = urls.length;

  activeUrls.textContent = urls.length;

  if (urls.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  urls.forEach(item => {
    const element = createUrlElement(item);
    urlList.appendChild(element);
  });
}


// ===============================
// CREATE URL CARD
// ===============================

function createUrlElement(item) {
  const wrapper = document.createElement("div");

  wrapper.className = "url-item";

  const shortUrl = getShortUrl(item.code);

  const top = document.createElement("div");
  top.className = "url-top";

  const short = document.createElement("div");
  short.className = "short-url";
  short.textContent = shortUrl;

  top.appendChild(short);


  const original = document.createElement("div");
  original.className = "original-url";

  original.textContent =
    "Original: " + item.longUrl;


  const date = document.createElement("div");
  date.className = "url-date";

  date.textContent =
    "Created: " + formatDate(item.createdAt);


  const actions = document.createElement("div");
  actions.className = "url-actions";


  // Open
  const openBtn = document.createElement("button");

  openBtn.className = "open-btn";
  openBtn.textContent = "Open";

  openBtn.addEventListener("click", function () {
    window.open(shortUrl, "_blank");
  });


  // Copy
  const copyBtn = document.createElement("button");

  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";

  copyBtn.addEventListener("click", function () {
    copyToClipboard(shortUrl, copyBtn);
  });


  // Edit
  const editBtn = document.createElement("button");

  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";

  editBtn.addEventListener("click", function () {
    openEditModal(item.id);
  });


  // Delete
  const deleteBtn = document.createElement("button");

  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", function () {
    deleteUrl(item.id);
  });


  actions.appendChild(openBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);


  wrapper.appendChild(top);
  wrapper.appendChild(original);
  wrapper.appendChild(date);
  wrapper.appendChild(actions);

  return wrapper;
}


// ===============================
// COPY
// ===============================

async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);

    const oldText = button.textContent;

    button.textContent = "Copied!";

    setTimeout(() => {
      button.textContent = oldText;
    }, 1500);

  } catch {
    alert("Unable to copy the URL.");
  }
}


// ===============================
// EDIT URL
// ===============================

function openEditModal(id) {
  const urls = getUrls();

  const item = urls.find(url => url.id === id);

  if (!item) {
    return;
  }

  editId.value = item.id;
  editLongUrl.value = item.longUrl;
  editCode.value = item.code;

  editModal.classList.remove("hidden");
}


closeModalBtn.addEventListener("click", function () {
  closeEditModal();
});


editModal.addEventListener("click", function (event) {
  if (event.target === editModal) {
    closeEditModal();
  }
});


function closeEditModal() {
  editModal.classList.add("hidden");
}


// ===============================
// SAVE EDIT
// ===============================

editForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = editId.value;
  const newLongUrl = editLongUrl.value.trim();
  const newCode = cleanCode(editCode.value.trim());

  if (!isValidUrl(newLongUrl)) {
    alert("Please enter a valid URL.");
    return;
  }

  if (!newCode) {
    alert("Please enter a valid short code.");
    return;
  }

  const urls = getUrls();

  const duplicate = urls.some(
    item =>
      item.id !== id &&
      item.code.toLowerCase() === newCode.toLowerCase()
  );

  if (duplicate) {
    alert("This short code is already being used.");
    return;
  }

  const index = urls.findIndex(item => item.id === id);

  if (index === -1) {
    return;
  }

  urls[index].longUrl = newLongUrl;
  urls[index].code = newCode;

  saveUrls(urls);

  closeEditModal();

  renderUrls();

  showMessage("Short URL updated successfully.", "success");
});


// ===============================
// DELETE URL
// ===============================

function deleteUrl(id) {
  const urls = getUrls();

  const item = urls.find(url => url.id === id);

  if (!item) {
    return;
  }

  const confirmed = confirm(
    "Delete this short URL?"
  );

  if (!confirmed) {
    return;
  }

  const updatedUrls = urls.filter(
    url => url.id !== id
  );

  saveUrls(updatedUrls);

  renderUrls();
}


// ===============================
// DELETE ALL
// ===============================

clearAllBtn.addEventListener("click", function () {
  const urls = getUrls();

  if (urls.length === 0) {
    return;
  }

  const confirmed = confirm(
    "Delete ALL short URLs? This cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(URLS_KEY);

  renderUrls();

  showMessage(
    "All short URLs have been deleted.",
    "success"
  );
});


// ===============================
// MESSAGE
// ===============================

function showMessage(text, type) {
  createMessage.textContent = text;

  createMessage.className =
    "message " + type;

  setTimeout(() => {
    createMessage.textContent = "";
    createMessage.className = "message";
  }, 3000);
}


// ===============================
// DATE
// ===============================

function formatDate(date) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "";
  }
}


// ===============================
// HANDLE SHORT URL
// ===============================

function handleShortUrl() {
  const params = new URLSearchParams(
    window.location.search
  );

  const code = params.get("s");

  if (!code) {
    return;
  }

  const urls = getUrls();

  const item = urls.find(
    url =>
      url.code.toLowerCase() ===
      code.toLowerCase()
  );

  if (!item) {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        font-family:Arial;
        text-align:center;
      ">
        <div>
          <h1>404</h1>
          <p>Short URL not found.</p>
        </div>
      </div>
    `;

    return;
  }

  // Count click
  item.clicks = (item.clicks || 0) + 1;

  saveUrls(urls);

  // Redirect
  window.location.replace(item.longUrl);
}


// Run redirect check
handleShortUrl();
