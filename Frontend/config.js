// ============================================================
// ENVIRONMENT CONFIGURATION
// ============================================================

// Change this to switch environments
const ENV = "local"; 
// Options: "local", "ngrok", "render"

// ============================================================
// BASE URL CONFIG
// ============================================================

const BASE_URLS = {
    local: "http://127.0.0.1:5000",
    ngrok: "https://YOUR-NGROK-URL.ngrok-free.app", 
    render: "https://hackfusion-final.onrender.com"
};

export const API_BASE = BASE_URLS[ENV];

// ============================================================
// APPLICATION CONSTANTS
// ============================================================

// This will later be replaced dynamically after login
export const DEFAULT_CUSTOMER_ID = "PAT999";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserRole() {
  return localStorage.getItem("role");
}

export function setAuth(token, role) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}
export function getUserName() {
  return localStorage.getItem("username");
}

export function setUserName(name) {
  localStorage.setItem("username", name);
}

export function clearUserName() {
  localStorage.removeItem("username");
}
export function getCustomerId() {
  return localStorage.getItem("customer_id");
}