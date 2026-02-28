// ============================================================
// API LAYER
// All backend communication happens here
// ============================================================

import { API_BASE } from "./config.js";

// --------------------------------------
// Safe Request Wrapper
// --------------------------------------

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Server error");
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error.message);
    return {
      status: "error",
      message: error.message
    };
  }
}


// ============================================================
// INVENTORY
// ============================================================

export async function getInventory() {
  return await request("/inventory");
}


// ============================================================
// CREATE ORDER
// ============================================================

export async function createOrder(customer_id, medicine_id, quantity) {
  return await request("/create-order", {
    method: "POST",
    body: JSON.stringify({
      customer_id,
      medicine_id,
      quantity
    })
  });
}


// ============================================================
// ORDER HISTORY
// ============================================================

export async function getOrderHistory(customer_id) {
  return await request(`/history/${customer_id}`);
}


// ============================================================
// UPDATE STOCK (ADMIN)
// ============================================================

export async function updateStock(medicine_id, delta) {
  return await request("/update-stock", {
    method: "POST",
    body: JSON.stringify({
      medicine_id,
      delta
    })
  });
}


// ============================================================
// ANALYTICS (Optional — only if backend supports)
// ============================================================

export async function getAnalyticsOverview() {
  return await request("/admin/analytics-overview");
}

export async function getTopProducts() {
  return await request("/admin/top-products");
}

export async function getRevenueChart() {
  return await request("/admin/revenue-chart");
}