// =======================
//  -API URL
// =======================
const API_URL = "http://localhost:3000";

// =======================
//  -REGISTRO
// =======================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = await fetch(`${API_URL}/users`).then(res => res.json());

    const exists = users.find(
      (u) => u.email === email || u.username === username
    );
    if (exists) {
      alert("User or email already registered");
      return;
    }

    const newUser = { fullName, email, username, password };
    await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    alert("User registered successfully");
    window.location.href = "login.html";
  });
}

// =======================
//  -LOGIN
// =======================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const users = await fetch(`${API_URL}/users`).then(res => res.json());

    const user = users.find(
      (u) =>
        (u.email === identifier || u.username === identifier) &&
        u.password === password
    );

    if (!user) {
      alert("Invalid credentials");
      return;
    }

    sessionStorage.setItem("sessionUser", JSON.stringify(user));
    window.location.href = "/assets/home.html";
  });
}

// =======================
//  -MIDDLEWARE DE SESSION
// =======================
function checkSession() {
  const user = sessionStorage.getItem("sessionUser");
  if (!user) {
    window.location.href = "/assets/login.html";
  }
}

// =======================
//  -LOGOUT
// =======================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "/assets/login.html";
  });
}
