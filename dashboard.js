// ============================================================
// DASHBOARD MODULE
// ============================================================

import { getInventory, setInventory } from "./state.js";
import { getInventory as fetchInventory } from "./api.js";
import { toast } from "./ui.js";

let chartsInitialized = false;


// ============================================================
// LOAD DASHBOARD DATA FROM BACKEND
// ============================================================

export async function loadDashboardData() {

  const response = await fetchInventory();

  if (!response || response.status !== "success") {
    toast("Failed to load inventory", "red");
    return;
  }

  setInventory(response.data);

  renderInventoryTable();
  renderMetrics();

  if (!chartsInitialized) {
    chartsInitialized = true;
    initCharts();
  }
}


// ============================================================
// RENDER INVENTORY TABLE
// ============================================================

function renderInventoryTable() {

  const table = document.getElementById("dStockBody");
  if (!table) return;

  const inventory = getInventory();

  table.innerHTML = inventory.map(m => {

    const statusColor =
      m.stock > 10 ? "green" :
      m.stock > 3 ? "orange" :
      "red";

    const statusText =
      m.stock > 10 ? "🟢 In Stock" :
      m.stock > 3 ? "🟡 Low Stock" :
      "🔴 Critical";

    return `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td><strong>${m.stock}</strong></td>
        <td><span class="badge badge-${statusColor}">${statusText}</span></td>
        <td>${m.category || "-"}</td>
        <td>${m.reorder_level || "-"}</td>
      </tr>
    `;
  }).join("");
}


// ============================================================
// USER DASHBOARD METRICS
// ============================================================

function renderMetrics() {

  const inventory = getInventory();

  // User-facing metrics (mock data for demo)
  const uOrders = document.getElementById("uMetOrders");
  const uRx = document.getElementById("uMetRx");
  const uRefills = document.getElementById("uMetRefills");
  const uAlerts = document.getElementById("uMetAlerts");

  if (uOrders) uOrders.textContent = "7";
  if (uRx) uRx.textContent = "2";
  if (uRefills) uRefills.textContent = "2";
  if (uAlerts) uAlerts.textContent = "1";

  // Order count badge
  const badge = document.getElementById("uOrderCount");
  if (badge) badge.textContent = "7 total";

  // Keep legacy stock for the medicines table
  const lowEl = document.getElementById("dMetLow");
  if (lowEl) lowEl.textContent = inventory.filter(m => m.stock <= 3).length;
}


// ============================================================
// CHARTS
// ============================================================

function initCharts() {

  const inventory = getInventory();

  // ---------------- Revenue Chart (Mock trend based on real count)
  const revCtx = document.getElementById("dRevChart")?.getContext("2d");
  if (revCtx) {
    new Chart(revCtx, {
      type: "bar",
      data: {
        labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        datasets: [{
          data: [5200,7800,6500,9200,8100,11200,7600],
          backgroundColor: "rgba(26,111,212,0.8)",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  // ---------------- Orders Trend
  const ordCtx = document.getElementById("dOrdChart")?.getContext("2d");
  if (ordCtx) {
    new Chart(ordCtx, {
      type: "line",
      data: {
        labels: ["9am","10am","11am","12pm","1pm","2pm","3pm"],
        datasets: [{
          data: [12,28,45,89,120,98,134],
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

  // ---------------- Stock Distribution Donut
  const stockCtx = document.getElementById("dStockChart")?.getContext("2d");
  if (stockCtx) {

    const inStock = inventory.filter(m => m.stock > 10).length;
    const lowStock = inventory.filter(m => m.stock > 3 && m.stock <= 10).length;
    const critical = inventory.filter(m => m.stock <= 3).length;

    new Chart(stockCtx, {
      type: "doughnut",
      data: {
        labels: ["In Stock","Low Stock","Critical"],
        datasets: [{
          data: [inStock, lowStock, critical],
          backgroundColor: ["#10b981","#f59e0b","#ef4444"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%"
      }
    });
  }
}