
// ============================================================
// MAIN ENTRY POINT
// ============================================================

import { initUI, goTo } from "./ui.js";
import { loadAdminData } from "./admin.js";
import { simulateRxUpload } from "./chatbot.js";
import { getMedicines } from "./api.js";
import { setInventory } from "./state.js";


// ============================================================
// EXPOSE GLOBALS
// ============================================================

window.goTo = goTo;
window.simulateRxUpload = simulateRxUpload;
window.loadAdminData = loadAdminData;


// ============================================================
// PRELOAD INVENTORY
// ============================================================

async function preloadInventory() {
  try {
    const response = await getMedicines();

    if (response.status === "success") {
      const medicines = response.medicines || response.data || [];
      setInventory(medicines);
      console.log("✅ Inventory loaded:", medicines.length);
    } else {
      console.warn("Inventory load failed:", response);
    }

  } catch (err) {
    console.error("❌ Inventory fetch error:", err);
  }
}


// ============================================================
// CONNECT AI PANEL (REAL BACKEND CHAT)
// ============================================================

function connectAiPanel() {

  const aiInput = document.getElementById("aiInput");
  const aiMsgs = document.getElementById("aiMsgs");

  if (!aiInput || !aiMsgs) {
    console.warn("AI panel elements not found.");
    return;
  }

  function addMessage(text, type = "bot") {
    const msg = document.createElement("div");
    msg.className = type === "user" ? "msg user" : "msg bot";
    msg.innerText = text;
    aiMsgs.appendChild(msg);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  // 🔥 MAIN CHAT FUNCTION
  window.sendAiMessage = async function (overrideMessage = null) {

    const userMessage = overrideMessage || aiInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, "user");
    aiInput.value = "";

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      addMessage(data.message || "No response.", "bot");

    } catch (error) {
      console.error("Chat error:", error);
      addMessage("Server error.", "bot");
    }
  };

  // Prevent Enter refresh
  aiInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      window.sendAiMessage();
    }
  });

  // Prevent any accidental form submit
  document.addEventListener("submit", function (e) {
    e.preventDefault();
  });
}




// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

  initUI();
  await preloadInventory();
  connectAiPanel();

  console.log("🚀 App initialized");

});


// ============================================================
// PLACEHOLDER
// ============================================================

window.showAdminSec = function() {
  console.warn("showAdminSec not implemented yet.");
};