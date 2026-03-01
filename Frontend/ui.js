// ============================================================
// UI CONTROLLER
// Navigation, Toasts, Modals, Notifications, Search, Auth
// ============================================================

import { getInventory, getNotifications } from "./state.js";
import {
  API_BASE,
  getToken,
  getUserRole,
  setAuth,
  clearAuth,
  getUserName,
  setUserName,
  clearUserName
} from "./config.js";


// ============================================================
// PAGE NAVIGATION (PROTECTED)
// ============================================================

export function goTo(page) {

  const protectedPages = ["dashboard", "admin"];

  if (protectedPages.includes(page)) {

    if (!getToken()) {
      openModal("loginModal");
      return;
    }

    if (page === "admin" && getUserRole() !== "admin") {
      toast("Admin access only", "red");
      return;
    }
  }

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

  const target = document.getElementById("page-" + page);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.remove("active");
    a.removeAttribute("aria-current");
  });

  const navEl = document.getElementById("nav-" + page) || document.getElementById("nav-safety");
  if (navEl) {
    navEl.classList.add("active");
    navEl.setAttribute("aria-current", "page");
  }

  window.scrollTo(0, 0);

  if (page === "dashboard") import("./dashboard.js").then(m => m.loadDashboardData());
  if (page === "admin") import("./admin.js").then(m => m.loadAdminData());
}

window.goTo = goTo;


// ============================================================
// TOAST SYSTEM
// ============================================================

export function toast(msg, type = "blue") {

  const container = document.getElementById("toastWrap");
  if (!container) return;

  const icons = {
    green: "✅",
    orange: "⚠️",
    red: "❌",
    blue: "ℹ️"
  };

  const t = document.createElement("div");
  t.className = "toast " + type;
  t.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;

  container.appendChild(t);

  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(100%)";
    setTimeout(() => t.remove(), 300);
  }, 3500);
}


// ============================================================
// MODALS
// ============================================================

export function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("show");
  document.body.style.overflow = "hidden";
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("show");
  document.body.style.overflow = "";
}

window.openModal = openModal;
window.closeModal = closeModal;

export function overlayClose(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}
window.overlayClose = overlayClose;

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".overlay.show").forEach(o => {
      o.classList.remove("show");
      document.body.style.overflow = "";
    });
  }
});


// ============================================================
// AUTH - LOGIN
// ============================================================

export async function handleLogin() {

  const email = document.getElementById("liEmail")?.value;
  const pass = document.getElementById("liPass")?.value;

  if (!email || !pass) {
    toast("Please fill in all fields", "orange");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    // Store token + role
    setAuth(data.token, data.role);

    // 🔥 Store user name
    setUserName(data.name || email.split("@")[0]);

    closeModal("loginModal");
    toast("Login successful!", "green");

    updateAuthUI();

    if (data.role === "admin") {
      goTo("admin");
    } else {
      goTo("dashboard");
    }

  } catch (err) {
    toast(err.message, "red");
  }
}

window.handleLogin = handleLogin;


// ============================================================
// LOGOUT
// ============================================================

export function logout() {
  clearAuth();
  clearUserName();
  updateAuthUI();
  toast("Logged out successfully", "blue");
  goTo("home");
}

window.logout = logout;


// ============================================================
// AUTH UI STATE
// ============================================================

function updateAuthUI() {

  const authBtn = document.getElementById("authBtn");
  const adminNav = document.getElementById("nav-admin");
  const greet = document.getElementById("userGreeting");
  const dashName = document.getElementById("dashUserName");

  if (!authBtn) return;

  if (getToken()) {

    const name = getUserName() || "User";

    // Navbar greeting
    if (greet) greet.textContent = `Hi, ${name}`;

    // Dashboard greeting
    if (dashName) dashName.textContent = name;

    authBtn.textContent = "Logout";
    authBtn.onclick = logout;

    if (getUserRole() !== "admin" && adminNav) {
      adminNav.style.display = "none";
    }

  } else {

    if (greet) greet.textContent = "";
    if (dashName) dashName.textContent = "User";

    authBtn.textContent = "Login";
    authBtn.onclick = () => openModal("loginModal");

    if (adminNav) {
      adminNav.style.display = "";
    }
  }
}


// ============================================================
// NOTIFICATIONS
// ============================================================

export function initNotifications() {

  const list = document.getElementById("notifList");
  if (!list) return;

  const notifs = getNotifications();

  list.innerHTML = notifs.length
    ? notifs.map(n => `
      <div class="notif-item">
        <span class="notif-icon">${n.icon}</span>
        <div class="notif-text">
          <strong>${n.title}</strong>
          <small>${n.time}</small>
        </div>
      </div>
    `).join("")
    : `<div style="padding:1rem;text-align:center;color:#94a3b8">No new notifications</div>`;
}


// ============================================================
// INIT UI
// ============================================================

export function initUI() {
  initNotifications();
  updateAuthUI(); // 🔥 restore username + role after refresh
}