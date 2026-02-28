// ============================================================
// API LAYER (PHARMLY - UNIFIED REAL ENDPOINTS ONLY)
// ============================================================

import { API_BASE } from "./config.js";

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Server error");
    }

    return { status: "success", data };
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

export const getInventory = () => request("/inventory");

export const updateStock = (medicine_id, delta) =>
  request("/update-stock", {
    method: "POST",
    body: JSON.stringify({ medicine_id, delta })
  });

// ============================================================
// ORDERS
// ============================================================

export const createOrder = (customer_id, medicine_id, quantity) =>
  request("/create-order", {
    method: "POST",
    body: JSON.stringify({ customer_id, medicine_id, quantity })
  });

export const getOrderHistory = (customer_id) =>
  request(`/history/${customer_id}`);

export const getUserMetrics = (customer_id) =>
  request(`/user-metrics/${customer_id}`);

export const getRefills = (customer_id) =>
  request(`/refills/${customer_id}`);

// ============================================================
// PRESCRIPTIONS
// ============================================================

export const verifyPrescription = (customer_id, medicine_id, fileUrl) =>
  request("/verify-prescription", {
    method: "POST",
    body: JSON.stringify({ customer_id, medicine_id, fileUrl })
  });

export const getPrescriptionStatus = (customer_id) =>
  request(`/prescription-status/${customer_id}`);

// ============================================================
// SUPPORT CHAT
// ============================================================

export const sendSupportMessage = (message, customer_id) =>
  request("/support-chat", {
    method: "POST",
    body: JSON.stringify({ message, customer_id })
  });

// ============================================================
// ANALYTICS (ADMIN)
// ============================================================

export const getAnalyticsOverview = () =>
  request("/admin/analytics-overview");

export const getRevenueChart = () =>
  request("/admin/revenue-chart");

export const getTopProducts = () =>
  request("/admin/top-products");

export const getAdminMetrics = () =>
  request("/admin/metrics");
