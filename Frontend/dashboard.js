import { 
  getCustomerHistory, 
  getUserMetrics, 
  getMedicines,
  uploadPrescription 
} from "./api.js";

import { getCustomerId } from "./config.js";


// ===================================================
// LOAD DASHBOARD DATA
// ===================================================

export async function loadDashboardData() {

  const customerId = getCustomerId();
  if (!customerId) return;

  // -----------------------
  // Load Orders
  // -----------------------
  const history = await getCustomerHistory(customerId);
  const tbody = document.getElementById("ordersTable");

  if (tbody) {
    if (history.status === "success") {

      const orders = history.orders || history.data || [];

      if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No orders found</td></tr>`;
      } else {
        tbody.innerHTML = orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>${o.medicine_name}</td>
            <td>${o.quantity}</td>
            <td>${o.status}</td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
          </tr>
        `).join("");
      }

    } else {
      tbody.innerHTML = `<tr><td colspan="5">No orders found</td></tr>`;
    }
  }

  // -----------------------
  // Load Metrics
  // -----------------------
  const metrics = await getUserMetrics(customerId);

  if (metrics.status === "success") {

    const ordersEl = document.getElementById("uMetOrders");
    const rxEl = document.getElementById("uMetRx");

    if (ordersEl)
      ordersEl.textContent = metrics.total_orders || 0;

    if (rxEl)
      rxEl.textContent = metrics.total_prescriptions || 0;
  }

  // -----------------------
  // Load Medicines (Admin View)
  // -----------------------
  const meds = await getMedicines();
  const stockBody = document.getElementById("dStockBody");

  if (stockBody && meds.status === "success") {

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


// ===================================================
// UPLOAD PRESCRIPTION FEATURE
// ===================================================

async function handleUploadPrescription() {

  const fileInput = document.getElementById("rxFileInput");
  const file = fileInput?.files[0];

  if (!file) {
    alert("Please select a prescription file.");
    return;
  }

  const customerId = getCustomerId();

  try {

    const response = await uploadPrescription(customerId, null, file);

    if (response.status === "success") {
      alert("Prescription uploaded successfully!");

      fileInput.value = "";
      document.getElementById("rxFileName").textContent = "No file selected";

      // Refresh metrics
      await loadDashboardData();

    } else {
      alert(response.message || "Upload failed.");
    }

  } catch (err) {
    console.error("Upload error:", err);
    alert("Something went wrong during upload.");
  }
}


// ===================================================
// DOM INITIALIZATION
// ===================================================

document.addEventListener("DOMContentLoaded", () => {

  // Load dashboard when page loads
  loadDashboardData();

  // File name preview
  const fileInput = document.getElementById("rxFileInput");
  const fileNameSpan = document.getElementById("rxFileName");

  if (fileInput && fileNameSpan) {
    fileInput.addEventListener("change", () => {
      fileNameSpan.textContent =
        fileInput.files[0]?.name || "No file selected";
    });
  }

  // Upload button
  const uploadBtn = document.getElementById("rxUploadBtn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", handleUploadPrescription);
  }

});