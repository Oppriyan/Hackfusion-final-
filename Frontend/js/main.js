// ============================================================
// MAIN ENTRY POINT
// ============================================================

import { initUI, goTo } from "./ui.js";
import { loadDashboardData } from "./dashboard.js";
import { loadAdminData } from "./admin.js";
import { initChat, sendAiMessage, simulateRxUpload, toggleVoice } from "./chatbot.js";

// 🔥 CRITICAL: Expose functions BEFORE DOMContentLoaded
window.goTo = goTo;
window.sendAiMessage = sendAiMessage;
window.simulateRxUpload = simulateRxUpload;
window.toggleVoice = toggleVoice;
window.loadAdminData = loadAdminData;

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

  initUI();
  initChat();

  await loadDashboardData();

  console.log("Frontend initialized successfully");
});