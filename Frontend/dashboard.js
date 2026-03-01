import { getCustomerHistory, getUserMetrics, getMedicines } from "./api.js";
import { getCustomerId } from "./config.js";

export async function loadDashboardData() {

  const customerId = getCustomerId();
  if (!customerId) return;

  // -----------------------
  // Load Orders
  // -----------------------
  const history = await getCustomerHistory(customerId);

  const tbody = document.getElementById("uOrdersBody");

  if (history.status === "success") {

    const orders = history.orders || history.data || [];

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.medicine_name}</td>
        <td>${o.quantity}</td>
        <td>${o.status}</td>
        <td>${o.created_at}</td>
      </tr>
    `).join("");

  } else {
    tbody.innerHTML = `<tr><td colspan="5">No orders found</td></tr>`;
  }

  // -----------------------
  // Load Metrics
  // -----------------------
  const metrics = await getUserMetrics(customerId);

  if (metrics.status === "success") {

    document.getElementById("uMetOrders").textContent =
      metrics.total_orders || 0;

    document.getElementById("uMetRx").textContent =
      metrics.total_prescriptions || 0;
  }

  // -----------------------
  // Load Medicines
  // -----------------------
  const meds = await getMedicines();
  const stockBody = document.getElementById("dStockBody");

  if (meds.status === "success") {

    stockBody.innerHTML = meds.medicines.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.stock}</td>
        <td>${m.stock > 10 ? "In Stock" : "Low Stock"}</td>
        <td>${m.category}</td>
        <td>${m.requires_rx ? "Yes" : "No"}</td>
      </tr>
    `).join("");
  }
}