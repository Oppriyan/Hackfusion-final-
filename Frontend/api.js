// ============================================================
// API LAYER — FULLY ALIGNED TO FLASK ROUTES
// ============================================================

import { API_BASE, getToken } from "./config.js";


// ------------------------------------------------------------
// CORE REQUEST HELPER
// ------------------------------------------------------------

async function request(endpoint, options = {}) {

  const token = getToken();

  try {

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        status: "error",
        message: data.message || "Server error"
      };
    }

    return data;

  } catch (err) {
    console.error("API Error:", err);
    return {
      status: "error",
      message: "Network error"
    };
  }
}


// ------------------------------------------------------------
// AUTH
// ------------------------------------------------------------

export async function loginUser(email, password) {
  return request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}


// ------------------------------------------------------------
// INVENTORY
// ------------------------------------------------------------

export const getMedicines = () =>
  request("/inventory/medicines");

export const searchMedicines = (query) =>
  request(`/search?query=${encodeURIComponent(query)}`);

export const updateStock = (medicine, delta) =>
  request("/update-stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medicine, delta })
  });


// ------------------------------------------------------------
// ORDERS
// ------------------------------------------------------------

export const createOrder = (customer_id, medicine_id, quantity) =>
  request("/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id, medicine_id, quantity })
  });

export const getCustomerHistory = (customer_id) =>
  request(`/customer-history/${customer_id}`);

export const cancelOrder = (order_id) =>
  request("/cancel-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id })
  });

export const getOrderStatus = (order_id) =>
  request(`/order-status/${order_id}`);


// ------------------------------------------------------------
// PRESCRIPTIONS
// ------------------------------------------------------------

export async function uploadPrescription(customer_id, medicine_id, file) {

  const token = getToken();
  const formData = new FormData();

  formData.append("customer_id", customer_id);

  // medicine_id optional
  if (medicine_id !== null && medicine_id !== undefined) {
    formData.append("medicine_id", medicine_id);
  }

  formData.append("file", file);

  try {

    const response = await fetch(`${API_BASE}/upload-prescription`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    return await response.json();

  } catch (err) {
    console.error("Upload Error:", err);
    return {
      status: "error",
      message: "Upload failed"
    };
  }
}

export const getPrescriptionStatus = (customer_id, medicine_id) =>
  request("/prescription-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id, medicine_id })
  });


// ------------------------------------------------------------
// ANALYTICS
// ------------------------------------------------------------

export const getUserMetrics = (customer_id) =>
  request(`/user-metrics/${customer_id}`);

export const getAdminRevenue = () =>
  request("/admin/revenue");


// ------------------------------------------------------------
// CHAT SUPPORT
// ------------------------------------------------------------

export const sendSupportMessage = (message, customer_id) =>
  request("/chat-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, customer_id })
  });


// ------------------------------------------------------------
// VOICE (VAPI WEBHOOK)
// ------------------------------------------------------------

export const sendVoiceTranscript = (payload) =>
  request("/vapi-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });