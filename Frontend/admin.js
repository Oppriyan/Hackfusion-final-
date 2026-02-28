// ============================================================
// ADMIN PANEL MODULE
// ============================================================

import { getInventory, setInventory } from "./state.js";
import { getInventory as fetchInventory, updateStock } from "./api.js";
import { toast } from "./ui.js";

let analyticsInitialized = false;


// ============================================================
// LOAD ADMIN DATA
// ============================================================

export async function loadAdminData() {

  const response = await fetchInventory();

  if (!response || response.status !== "success") {
    toast("Failed to load admin data", "red");
    return;
  }

  setInventory(response.data);

  renderInventory();
  renderAdminOverview();

  if (!analyticsInitialized) {
    analyticsInitialized = true;
    initAnalyticsCharts();
  }
}


// ============================================================
// INVENTORY TABLE
// ============================================================

function renderInventory() {

  const table = document.getElementById("invBody");
  if (!table) return;

  const inventory = getInventory();

  table.innerHTML = inventory.map((m) => {

    const status =
      m.stock > 10 ? "🟢 In Stock" :
      m.stock > 3 ? "🟡 Low" :
      "🔴 Critical";

    return `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td>${m.category || "-"}</td>
        <td><strong>${m.stock}</strong></td>
        <td>${status}</td>
        <td>$${m.price}</td>
        <td>${m.prescription_required}</td>
        <td>
          <button onclick="window.adminUpdateStock('${m.id}')">✏️</button>
        </td>
      </tr>
    `;
  }).join("");
}


// ============================================================
// UPDATE STOCK (ADMIN ONLY)
// ============================================================

window.adminUpdateStock = async function (medicine_id) {

  const delta = prompt("Enter stock change (+5 or -3)");
  if (!delta) return;

  const response = await updateStock(medicine_id, parseInt(delta));

  if (response.status === "success") {
    toast("Stock updated successfully", "green");
    loadAdminData();
  } else {
    toast(response.message || "Stock update failed", "red");
  }
};


// ============================================================
// ADMIN OVERVIEW CARDS
// ============================================================

function renderAdminOverview() {

  const inventory = getInventory();

  const totalMedicines = inventory.length;
  const totalStock = inventory.reduce((sum, m) => sum + m.stock, 0);
  const critical = inventory.filter(m => m.stock <= 3).length;

  const medEl = document.getElementById("ovTotalMed");
  const stockEl = document.getElementById("ovTotalStock");
  const critEl = document.getElementById("ovCritical");

  if (medEl) medEl.textContent = totalMedicines;
  if (stockEl) stockEl.textContent = totalStock.toLocaleString();
  if (critEl) critEl.textContent = critical;
}


// ============================================================
// ANALYTICS CHARTS
// ============================================================

function initAnalyticsCharts() {

  const inventory = getInventory();

  const revenueCtx = document.getElementById("anRevChart")?.getContext("2d");
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: "line",
      data: {
        labels: ["Week 1","Week 2","Week 3","Week 4"],
        datasets: [{
          data: [28000,35000,42000,48200],
          borderColor: "#1a6fd4",
          backgroundColor: "rgba(26,111,212,0.2)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  const catCtx = document.getElementById("anCatChart")?.getContext("2d");
  if (catCtx) {

    const categoryCount = {};

    inventory.forEach(m => {
      const cat = m.category || "Other";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    new Chart(catCtx, {
      type: "pie",
      data: {
        labels: Object.keys(categoryCount),
        datasets: [{
          data: Object.values(categoryCount),
          backgroundColor: [
            "#1a6fd4",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
            "#64748b"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}