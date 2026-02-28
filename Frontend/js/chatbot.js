// ============================================================
// AI CHATBOT MODULE
// ============================================================

import { getInventory, setSelectedMedicine, getSelectedMedicine } from "./state.js";
import { createOrder } from "./api.js";
import { toast } from "./ui.js";
import { DEFAULT_CUSTOMER_ID } from "./config.js";


// ============================================================
// CHAT INITIALIZATION
// ============================================================

export function initChat() {
  const msgs = document.getElementById("aiMsgs");
  if (!msgs) return;

  if (!msgs.children.length) {
    addBotMessage(
`Hello! I'm your AI Pharmacy Assistant.

💊 I can help you:
• Order medications
• Check stock availability
• Process prescription verification
• Answer drug questions

What can I help you with today?`
    );
  }
}


// ============================================================
// MESSAGE HELPERS
// ============================================================

function addBotMessage(text) {
  const msgs = document.getElementById("aiMsgs");
  const b = document.createElement("div");
  b.className = "ai-bub bot";
  b.innerHTML = `<span class="bavatar">🤖</span>${format(text)}`;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
  const msgs = document.getElementById("aiMsgs");
  const b = document.createElement("div");
  b.className = "ai-bub user";
  b.textContent = text;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;
}

function format(text) {
  return text.replace(/\n/g, "<br>");
}


// ============================================================
// TYPING EFFECT
// ============================================================

function showTyping() {
  const msgs = document.getElementById("aiMsgs");
  const t = document.createElement("div");
  t.className = "ai-typing";
  t.id = "aiTyping";
  t.innerHTML = "<span></span><span></span><span></span>";
  msgs.appendChild(t);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  document.getElementById("aiTyping")?.remove();
}


// ============================================================
// MAIN SEND FUNCTION
// ============================================================

export async function sendAiMessage() {

  const input = document.getElementById("aiInput");
  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  input.value = "";

  showTyping();
  await new Promise(r => setTimeout(r, 900));
  removeTyping();

  processMessage(text);
}

window.sendAiMessage = sendAiMessage;


// ============================================================
// MESSAGE PROCESSOR
// ============================================================

async function processMessage(text) {

  const l = text.toLowerCase();
  const inventory = getInventory();

  const found = inventory.find(m =>
    l.includes(m.name.split(" ")[0].toLowerCase())
  );

  // ---------------- ORDER FLOW
  if (l.match(/order|need|want|give me/)) {

    if (!found) {
      addBotMessage("Which medicine would you like to order?");
      return;
    }

    setSelectedMedicine(found.id);

    if (found.prescription_required === "Yes") {
      addBotMessage(
`⚠️ ${found.name} requires a valid prescription.

Please upload your prescription to proceed.`
      );
      document.getElementById("rxBanner")?.classList.add("show");
      return;
    }

    const qty = (l.match(/\d+/) || ["1"])[0];

    const response = await createOrder(
      DEFAULT_CUSTOMER_ID,
      found.id,
      parseInt(qty)
    );

    if (response.status === "success") {
      addBotMessage(
`✅ Order Confirmed!

• Medicine: ${found.name}
• Quantity: ${qty}
• Order ID: ${response.data?.order_id || "Generated"}

Your pharmacy has been notified.`
      );
      toast("Order placed successfully!", "green");
    } else {
      addBotMessage(response.message || "Order failed.");
      toast(response.message, "red");
    }

    return;
  }

  // ---------------- STOCK CHECK
  if (l.match(/stock|available|have|check/)) {

    if (!found) {
      addBotMessage("Which medicine would you like me to check?");
      return;
    }

    const status =
      found.stock > 10 ? "🟢 In Stock" :
      found.stock > 3 ? "🟡 Low Stock" :
      "🔴 Critical";

    addBotMessage(
`📦 ${found.name} Stock Info:

• Available: ${found.stock} units
• Status: ${status}
• Prescription Required: ${found.prescription_required}`
    );

    return;
  }

  // ---------------- GREETING
  if (l.match(/hello|hi|hey/)) {
    addBotMessage("Hello! 👋 How can I assist you today?");
    return;
  }

  // ---------------- DEFAULT
  addBotMessage(
"I understand your request. Could you specify the medicine name or whether you'd like to order or check stock?"
  );
}


// ============================================================
// PRESCRIPTION UPLOAD SIMULATION
// ============================================================

export async function simulateRxUpload() {

  document.getElementById("rxBanner")?.classList.remove("show");

  showTyping();
  await new Promise(r => setTimeout(r, 2000));
  removeTyping();

  const medId = getSelectedMedicine();

  if (!medId) {
    addBotMessage("No medicine selected.");
    return;
  }

  addBotMessage(
`✅ Prescription Verified Successfully!

You can now proceed with ordering your medication.`
  );

  toast("Prescription verified!", "green");
}


// ============================================================
// VOICE SIMULATION
// ============================================================

let voiceActive = false;

export function toggleVoice() {

  voiceActive = !voiceActive;

  const btn = document.getElementById("micBtn");
  btn?.classList.toggle("active", voiceActive);

  if (voiceActive) {
    toast("Voice listening...", "blue");

    setTimeout(() => {
      if (voiceActive) {
        addBotMessage("🎙️ Voice input received.");
        voiceActive = false;
        btn?.classList.remove("active");
      }
    }, 3000);
  }
}

window.toggleVoice = toggleVoice;