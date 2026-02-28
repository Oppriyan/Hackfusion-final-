// ============================================================
// UI CONTROLLER
// Navigation, Toasts, Modals, Notifications, Search
// ============================================================

import { getInventory, getNotifications } from "./state.js";
import { loadDashboardData } from "./dashboard.js";
import { loadAdminData } from "./admin.js";


// ============================================================
// PAGE NAVIGATION
// ============================================================

export function goTo(page) {

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

  const target = document.getElementById("page-" + page);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.remove("active");
    a.removeAttribute("aria-current");
  });

  const navEl = document.getElementById("nav-" + page);
  if (navEl) {
    navEl.classList.add("active");
    navEl.setAttribute("aria-current", "page");
  }

  window.scrollTo(0, 0);

  if (page === "dashboard") loadDashboardData();
  if (page === "admin") loadAdminData();
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

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".overlay.show").forEach(o => {
      o.classList.remove("show");
      document.body.style.overflow = "";
    });
  }
});


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

export function toggleNotif() {
  const d = document.getElementById("notifDrop");
  if (!d) return;
  d.classList.toggle("show");
}

window.toggleNotif = toggleNotif;


// ============================================================
// HERO SEARCH (LIVE FROM INVENTORY)
// ============================================================

export function initSearch() {

  const input = document.getElementById("heroSearch");
  const drop = document.getElementById("searchDrop");

  if (!input || !drop) return;

  input.addEventListener("input", function () {

    const q = this.value.trim().toLowerCase();

    if (q.length < 2) {
      drop.classList.remove("show");
      return;
    }

    const results = getInventory().filter(m =>
      m.name.toLowerCase().includes(q)
    );

    drop.innerHTML = results.length
      ? results.slice(0, 6).map(m => `
        <div class="sug-item"
          onclick="window.selectMedicine('${m.id}','${m.name}','${m.stock}')">
          💊 <span style="flex:1">${m.name}</span>
          <span class="badge">${m.stock} left</span>
        </div>
      `).join("")
      : `<div class="sug-item">No results</div>`;

    drop.classList.add("show");
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-hero")) {
      drop.classList.remove("show");
    }
  });
}


// ============================================================
// MEDICINE SELECT
// ============================================================

window.selectMedicine = function (id, name, stock) {
  document.getElementById("heroSearch").value = name;
  document.getElementById("searchDrop").classList.remove("show");
  toast(`${name} — ${stock} in stock`, stock > 10 ? "green" : "orange");
};


// ============================================================
// INIT UI
// ============================================================

export function initUI() {
  initNotifications();
  initSearch();
}