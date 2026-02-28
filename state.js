// ============================================================
// GLOBAL STATE STORE
// Replaces all mock frontend data
// ============================================================

export const state = {

  // -------------------------
  // Inventory Data
  // -------------------------
  inventory: [],

  // -------------------------
  // Orders
  // -------------------------
  orders: [],

  // -------------------------
  // Customers
  // -------------------------
  customers: [],

  // -------------------------
  // Analytics
  // -------------------------
  analytics: {
    revenue: [],
    ordersTrend: [],
    stockSummary: [],
    topProducts: []
  },

  // -------------------------
  // Notifications
  // -------------------------
  notifications: [],

  // -------------------------
  // Selected Medicine (Chatbot)
  // -------------------------
  selectedMedicine: null
};


// ============================================================
// SETTERS (Controlled Updates)
// ============================================================

export function setInventory(data) {
  state.inventory = data || [];
}

export function setOrders(data) {
  state.orders = data || [];
}

export function setCustomers(data) {
  state.customers = data || [];
}

export function setAnalytics(data) {
  state.analytics = data || state.analytics;
}

export function setNotifications(data) {
  state.notifications = data || [];
}

export function setSelectedMedicine(name) {
  state.selectedMedicine = name;
}


// ============================================================
// GETTERS
// ============================================================

export function getInventory() {
  return state.inventory;
}

export function getOrders() {
  return state.orders;
}

export function getCustomers() {
  return state.customers;
}

export function getAnalytics() {
  return state.analytics;
}

export function getNotifications() {
  return state.notifications;
}

export function getSelectedMedicine() {
  return state.selectedMedicine;
}