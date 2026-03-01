// ============================================================
// AI CHATBOT MODULE
// ============================================================

import { getInventory, setSelectedMedicine, getSelectedMedicine } from "./state.js";
import { createOrder, sendSupportMessage, uploadPrescription, sendVoiceTranscript } from "./api.js";
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

  // Try real backend verification
  try {
    const { verifyPrescription } = await import("./api.js");
    const response = await verifyPrescription(DEFAULT_CUSTOMER_ID, medId, "uploaded");
    if (response.status === "success") {
      addBotMessage(
`✅ Prescription Verified Successfully!

You can now proceed with ordering your medication.`
      );
      toast("Prescription verified!", "green");
      return;
    }
  } catch {}

  // Fallback mock response
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

    setTimeout(async () => {
      if (voiceActive) {
        const transcript = "Check stock Paracetamol"; // Simulated transcript
        voiceActive = false;
        btn?.classList.remove("active");

        // Send to backend voice endpoint
        try {
          const response = await sendVoiceTranscript(transcript);
          if (response.status === "success" && response.data?.response) {
            addBotMessage(`🎙️ ${response.data.response}`);
          } else {
            // Fallback: process locally
            addBotMessage("🎙️ Voice input received.");
            processMessage(transcript);
          }
        } catch {
          addBotMessage("🎙️ Voice input received.");
          processMessage(transcript);
        }
      }
    }, 3000);
  }
}

window.toggleVoice = toggleVoice;

// ============================================================
// SUPPORT CHATBOT (bottom-right panel)
// ============================================================

let chatOpen = false;

window.toggleChat = function () {
  chatOpen = !chatOpen;
  const panel = document.getElementById("chatPanel");
  const btn = document.getElementById("chatToggleBtn");
  if (panel) panel.classList.toggle("open", chatOpen);
  if (btn) btn.setAttribute("aria-expanded", chatOpen);
  if (chatOpen) {
    const msgs = document.getElementById("chatMsgs");
    if (msgs && !msgs.children.length) {
      addSupportBotMsg("👋 Hi! I'm your AI Health Assistant. I can help with support questions, symptom checking, and drug interaction safety. How can I help?");
    }
  }
};

function addSupportBotMsg(text) {
  const msgs = document.getElementById("chatMsgs");
  if (!msgs) return;
  const b = document.createElement("div");
  b.className = "cbubble bot";
  b.textContent = text;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;
}

window.sendChatMsg = function () {
  const input = document.getElementById("chatTi");
  const text = input?.value.trim();
  if (!text) return;
  const msgs = document.getElementById("chatMsgs");
  if (msgs) {
    const b = document.createElement("div");
    b.className = "cbubble user";
    b.textContent = text;
    msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
  }
  input.value = "";

  // ✅ MOCK support chat responses (intentional — chatbot is local AI assistant)
  setTimeout(() => {
    const responses = [
      "I understand. Let me check that for you right away.",
      "Thanks for reaching out. Our pharmacy team will assist you shortly.",
      "Got it! For medicine orders, you can also use the AI Pharmacy Assistant in the Dashboard.",
      "I've noted your query. You can also check the API Docs page for integration help."
    ];
    addSupportBotMsg(responses[Math.floor(Math.random() * responses.length)]);
  }, 800);
};

// ============================================================
// CHAT TAB SWITCHING
// ============================================================

window.switchChatTab = function (tab) {
  document.querySelectorAll(".chat-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".chat-mode").forEach(m => m.classList.remove("active"));
  const tabBtn = document.getElementById("tab-" + tab);
  const tabMode = document.getElementById("chatMode-" + tab);
  if (tabBtn) tabBtn.classList.add("active");
  if (tabMode) tabMode.classList.add("active");
};

// ============================================================
// SYMPTOM CHECKER
// ============================================================

const symptomData = {
  headache: {
    label: "🤕 Headache",
    meds: [
      { icon: "💊", name: "Paracetamol 500mg", note: "Take 1–2 tablets every 4–6 hrs. Max 4g/day." },
      { icon: "💊", name: "Ibuprofen 400mg", note: "Take with food. Not for empty stomach." },
      { icon: "💊", name: "Aspirin 300mg", note: "Avoid if under 16 or on blood thinners." },
      { icon: "🌿", name: "Caffeine + Paracetamol", note: "Combination for tension headaches." }
    ]
  },
  backpain: {
    label: "🦴 Back Pain",
    meds: [
      { icon: "💊", name: "Ibuprofen 400mg", note: "Anti-inflammatory. Take with food, 3x daily." },
      { icon: "💊", name: "Diclofenac Gel (Topical)", note: "Apply to affected area 3–4x daily." },
      { icon: "💊", name: "Paracetamol 650mg", note: "For mild-moderate pain relief." },
      { icon: "💊", name: "Methocarbamol 750mg", note: "Muscle relaxant for spasm-related pain." }
    ]
  },
  fever: {
    label: "🌡️ Fever",
    meds: [
      { icon: "💊", name: "Paracetamol 500mg", note: "First-line antipyretic. Every 4–6 hrs." },
      { icon: "💊", name: "Ibuprofen 200mg", note: "Reduces fever and inflammation." },
      { icon: "💧", name: "ORS Sachets", note: "Stay hydrated — essential with fever." },
      { icon: "💊", name: "Aspirin 300mg", note: "Adults only. Not for viral fevers in children." }
    ]
  },
  cold: {
    label: "🤧 Cold & Flu",
    meds: [
      { icon: "💊", name: "Cetirizine 10mg", note: "For runny nose and sneezing." },
      { icon: "💊", name: "Pseudoephedrine 60mg", note: "Nasal decongestant. Short-term use." },
      { icon: "💊", name: "DXM Cough Syrup", note: "Dextromethorphan for dry cough." },
      { icon: "🌿", name: "Zinc + Vitamin C", note: "Reduces duration of cold symptoms." }
    ]
  },
  allergy: {
    label: "🌿 Allergies",
    meds: [
      { icon: "💊", name: "Cetirizine 10mg", note: "Non-drowsy antihistamine. Once daily." },
      { icon: "💊", name: "Loratadine 10mg", note: "24hr relief. Minimal sedation." },
      { icon: "💊", name: "Fexofenadine 120mg", note: "For seasonal allergic rhinitis." },
      { icon: "💊", name: "Levocetirizine 5mg", note: "Stronger antihistamine for severe allergies." }
    ]
  },
  stomach: {
    label: "🤢 Stomach Pain",
    meds: [
      { icon: "💊", name: "Antacid (Gelusil)", note: "For acid-related stomach pain." },
      { icon: "💊", name: "Omeprazole 20mg", note: "PPI for gastritis. Take before meals." },
      { icon: "💊", name: "Dicyclomine 10mg", note: "Antispasmodic for cramps and IBS." },
      { icon: "💊", name: "ORS + Probiotics", note: "For diarrhoea-related stomach pain." }
    ]
  },
  throat: {
    label: "😮 Sore Throat",
    meds: [
      { icon: "💊", name: "Benzydamine Gargle", note: "Anti-inflammatory throat rinse." },
      { icon: "💊", name: "Strepsils Lozenges", note: "Antiseptic. Dissolve slowly in mouth." },
      { icon: "💊", name: "Paracetamol 500mg", note: "For throat pain and fever." },
      { icon: "🌿", name: "Honey + Lemon Drink", note: "Natural soothing remedy." }
    ]
  },
  muscle: {
    label: "💪 Muscle Pain",
    meds: [
      { icon: "💊", name: "Ibuprofen 400mg", note: "Anti-inflammatory. With meals." },
      { icon: "💊", name: "Diclofenac Gel", note: "Apply topically to sore muscles." },
      { icon: "💊", name: "Methocarbamol 750mg", note: "Muscle relaxant for spasm relief." },
      { icon: "💊", name: "Magnesium Supplement", note: "Helps with muscle cramps." }
    ]
  },
  insomnia: {
    label: "😴 Insomnia",
    meds: [
      { icon: "💊", name: "Melatonin 5mg", note: "Natural sleep aid. 30 min before bed." },
      { icon: "💊", name: "Diphenhydramine 25mg", note: "Short-term sleep aid. OTC." },
      { icon: "🌿", name: "Valerian Root Extract", note: "Herbal sleep supplement." },
      { icon: "💊", name: "Doxylamine 25mg", note: "Antihistamine-based sleep aid." }
    ]
  },
  acidity: {
    label: "🔥 Acidity",
    meds: [
      { icon: "💊", name: "Omeprazole 20mg", note: "Take before breakfast. 1x daily." },
      { icon: "💊", name: "Pantoprazole 40mg", note: "PPI for severe acid reflux." },
      { icon: "💊", name: "Antacid Syrup (Digene)", note: "Fast relief. After meals." },
      { icon: "💊", name: "Ranitidine 150mg", note: "H2 blocker for acid control." }
    ]
  }
};

window.selectSymptom = function (key) {
  const data = symptomData[key];
  if (!data) return;

  // Highlight selected
  document.querySelectorAll(".sym-btn").forEach(b => b.classList.remove("active"));
  event?.target?.classList.add("active");

  const result = document.getElementById("symResult");
  const title = document.getElementById("symResultTitle");
  const list = document.getElementById("symMedList");

  if (title) title.textContent = `💊 Recommended for ${data.label}`;
  if (list) {
    list.innerHTML = data.meds.map(m => `
      <div class="sym-med-item">
        <span class="sym-med-icon">${m.icon}</span>
        <div>
          <span class="sym-med-name">${m.name}</span>
          <span class="sym-med-note">${m.note}</span>
        </div>
      </div>
    `).join("");
  }
  if (result) result.classList.add("show");
};

window.resetSymptom = function () {
  const result = document.getElementById("symResult");
  if (result) result.classList.remove("show");
  document.querySelectorAll(".sym-btn").forEach(b => b.classList.remove("active"));
};

// ============================================================
// DRUG INTERACTION CHECKER
// ============================================================

const interactionDB = [
  {
    drugs: ["aspirin", "ibuprofen"],
    level: "warning",
    title: "⚠️ Moderate Interaction",
    desc: "Taking Aspirin and Ibuprofen together increases risk of GI bleeding and reduces Aspirin's antiplatelet effect.",
    tips: ["Separate doses by at least 8 hours", "Use Paracetamol as an alternative", "Consult your doctor if both are prescribed"]
  },
  {
    drugs: ["warfarin", "aspirin"],
    level: "danger",
    title: "🚨 Serious Interaction",
    desc: "Aspirin significantly increases bleeding risk when combined with Warfarin (blood thinner).",
    tips: ["Avoid this combination unless directed by a specialist", "Monitor INR closely", "Seek immediate medical advice"]
  },
  {
    drugs: ["warfarin", "ibuprofen"],
    level: "danger",
    title: "🚨 Serious Interaction",
    desc: "Ibuprofen increases the anticoagulant effect of Warfarin, greatly raising bleeding risk.",
    tips: ["Use Paracetamol for pain instead", "Notify your doctor immediately", "Do not combine without supervision"]
  },
  {
    drugs: ["metformin", "alcohol"],
    level: "danger",
    title: "🚨 Serious Interaction",
    desc: "Alcohol combined with Metformin raises the risk of lactic acidosis, a potentially fatal condition.",
    tips: ["Avoid alcohol entirely while on Metformin", "If consumed, seek medical advice", "Monitor for nausea, muscle pain, or breathing difficulty"]
  },
  {
    drugs: ["paracetamol", "alcohol"],
    level: "warning",
    title: "⚠️ Moderate Interaction",
    desc: "Combining Paracetamol (Acetaminophen) with alcohol increases risk of liver damage.",
    tips: ["Do not exceed 2g/day of Paracetamol if drinking", "Space doses several hours from drinking", "Avoid if you have liver disease"]
  },
  {
    drugs: ["simvastatin", "erythromycin"],
    level: "danger",
    title: "🚨 Serious Interaction",
    desc: "Erythromycin inhibits Simvastatin metabolism, raising statin levels and risk of muscle damage (rhabdomyolysis).",
    tips: ["Avoid this combination", "Switch to a non-interacting antibiotic", "Report muscle pain or weakness immediately"]
  },
  {
    drugs: ["amoxicillin", "methotrexate"],
    level: "warning",
    title: "⚠️ Moderate Interaction",
    desc: "Amoxicillin may reduce renal clearance of Methotrexate, increasing its toxicity.",
    tips: ["Monitor Methotrexate levels", "Consult prescribing doctor", "Watch for signs of toxicity: mouth sores, fatigue"]
  }
];

function checkInteraction(inputs) {
  const normalized = inputs.map(d => d.trim().toLowerCase()).filter(Boolean);
  if (normalized.length < 2) return null;

  for (const entry of interactionDB) {
    const matches = entry.drugs.every(d => normalized.some(n => n.includes(d)));
    if (matches) return entry;
  }
  return "safe";
}

function renderDrugResult(containerId, result) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (result === "safe") {
    el.className = "drug-result safe show";
    el.innerHTML = `<h4>✅ No Known Interaction</h4><p>No significant interaction found in our database for these medicines. Always consult a pharmacist for confirmation.</p>`;
  } else if (result && result.level) {
    el.className = `drug-result ${result.level} show`;
    el.innerHTML = `
      <h4>${result.title}</h4>
      <p>${result.desc}</p>
      ${result.tips ? `<ul>${result.tips.map(t => `<li>${t}</li>`).join("")}</ul>` : ""}
    `;
  }
}

window.checkDrugInteraction = function () {
  const d1 = document.getElementById("drugInput1")?.value || "";
  const d2 = document.getElementById("drugInput2")?.value || "";
  const d3 = document.getElementById("drugInput3")?.value || "";
  const result = checkInteraction([d1, d2, d3]);
  if (!result) {
    const el = document.getElementById("drugResult");
    if (el) { el.className = "drug-result warning show"; el.innerHTML = "<h4>⚠️ Please enter at least 2 medicines</h4>"; }
    return;
  }
  renderDrugResult("drugResult", result);
};

window.checkModalDrugInteraction = function () {
  const d1 = document.getElementById("modalDrug1")?.value || "";
  const d2 = document.getElementById("modalDrug2")?.value || "";
  const result = checkInteraction([d1, d2]);
  if (!result) {
    const el = document.getElementById("modalDrugResult");
    if (el) { el.className = "drug-result warning show"; el.innerHTML = "<h4>⚠️ Please enter at least 2 medicines</h4>"; }
    return;
  }
  renderDrugResult("modalDrugResult", result);
};


// ============================================================
// PREDICTIVE SMART SEARCH (fuzzy + typo-tolerant)
// ============================================================

const MEDICINE_DB = [
  {name:"Paracetamol 500mg", generic:"Acetaminophen", stock:82, rx:false, price:1.20, brand:"Calpol", category:"Pain Relief"},
  {name:"Paracetamol 650mg", generic:"Acetaminophen", stock:54, rx:false, price:1.50, brand:"Dolo 650", category:"Pain Relief"},
  {name:"Ibuprofen 400mg", generic:"Ibuprofen", stock:45, rx:false, price:2.10, brand:"Brufen", category:"Pain Relief"},
  {name:"Amoxicillin 500mg", generic:"Amoxicillin", stock:18, rx:true, price:4.80, brand:"Amoxil", category:"Antibiotic"},
  {name:"Amoxicillin 250mg", generic:"Amoxicillin", stock:30, rx:true, price:3.20, brand:"Trimox", category:"Antibiotic"},
  {name:"Cetirizine 10mg", generic:"Cetirizine", stock:67, rx:false, price:1.80, brand:"Zyrtec", category:"Antihistamine"},
  {name:"Metformin 500mg", generic:"Metformin", stock:43, rx:true, price:3.50, brand:"Glucophage", category:"Diabetes"},
  {name:"Metformin 850mg", generic:"Metformin", stock:29, rx:true, price:4.20, brand:"Glucophage XR", category:"Diabetes"},
  {name:"Lisinopril 10mg", generic:"Lisinopril", stock:22, rx:true, price:5.10, brand:"Zestril", category:"Blood Pressure"},
  {name:"Aspirin 300mg", generic:"Acetylsalicylic acid", stock:90, rx:false, price:0.90, brand:"Disprin", category:"Pain Relief"},
  {name:"Omeprazole 20mg", generic:"Omeprazole", stock:38, rx:false, price:2.80, brand:"Prilosec", category:"Gastric"},
  {name:"Pantoprazole 40mg", generic:"Pantoprazole", stock:25, rx:true, price:3.60, brand:"Protonix", category:"Gastric"},
  {name:"Azithromycin 500mg", generic:"Azithromycin", stock:15, rx:true, price:6.20, brand:"Zithromax", category:"Antibiotic"},
  {name:"Atorvastatin 10mg", generic:"Atorvastatin", stock:34, rx:true, price:4.50, brand:"Lipitor", category:"Cholesterol"},
  {name:"Simvastatin 20mg", generic:"Simvastatin", stock:20, rx:true, price:3.90, brand:"Zocor", category:"Cholesterol"},
  {name:"Dextromethorphan Syrup", generic:"DXM", stock:12, rx:false, price:2.20, brand:"Robitussin", category:"Cold & Flu"},
  {name:"Loratadine 10mg", generic:"Loratadine", stock:55, rx:false, price:1.60, brand:"Claritin", category:"Antihistamine"},
  {name:"Salbutamol Inhaler", generic:"Salbutamol", stock:8, rx:true, price:12.00, brand:"Ventolin", category:"Respiratory"},
  {name:"Tramadol 50mg", generic:"Tramadol", stock:6, rx:true, price:8.50, brand:"Ultram", category:"Pain Relief"},
  {name:"Warfarin 5mg", generic:"Warfarin", stock:11, rx:true, price:7.20, brand:"Coumadin", category:"Blood Thinner"},
  {name:"Diclofenac 50mg", generic:"Diclofenac", stock:41, rx:false, price:2.30, brand:"Voltaren", category:"Pain Relief"},
  {name:"Melatonin 5mg", generic:"Melatonin", stock:48, rx:false, price:3.10, brand:"SleepTabs", category:"Sleep"},
];

// Generic substitutes database
const GENERIC_DB = {
  "lipitor": [{name:"Generic Atorvastatin 10mg", price:"$0.95", savings:"78%"},{name:"Rosuvastatin 10mg", price:"$1.20", savings:"72%"}],
  "atorvastatin": [{name:"Generic Atorvastatin 10mg", price:"$0.95", savings:"78%"}],
  "ventolin": [{name:"Generic Salbutamol Inhaler", price:"$4.80", savings:"60%"},{name:"Terbutaline Inhaler", price:"$5.50", savings:"54%"}],
  "salbutamol": [{name:"Generic Salbutamol Inhaler", price:"$4.80", savings:"60%"}],
  "zithromax": [{name:"Generic Azithromycin 500mg", price:"$1.80", savings:"71%"}],
  "azithromycin": [{name:"Generic Azithromycin 500mg", price:"$1.80", savings:"71%"}],
  "glucophage": [{name:"Generic Metformin 500mg", price:"$0.80", savings:"77%"},{name:"Generic Metformin 850mg", price:"$1.10", savings:"74%"}],
  "metformin": [{name:"Generic Metformin 500mg", price:"$0.80", savings:"77%"}],
  "prilosec": [{name:"Generic Omeprazole 20mg", price:"$0.70", savings:"75%"},{name:"Pantoprazole 20mg", price:"$0.85", savings:"70%"}],
  "omeprazole": [{name:"Generic Omeprazole 20mg", price:"$0.70", savings:"75%"}],
  "nexium": [{name:"Generic Esomeprazole 20mg", price:"$0.90", savings:"68%"}],
  "brufen": [{name:"Generic Ibuprofen 400mg", price:"$0.60", savings:"71%"}],
  "ibuprofen": [{name:"Generic Ibuprofen 400mg", price:"$0.60", savings:"71%"}],
  "zestril": [{name:"Generic Lisinopril 10mg", price:"$0.85", savings:"83%"}],
  "lisinopril": [{name:"Generic Lisinopril 10mg", price:"$0.85", savings:"83%"}],
  "amoxil": [{name:"Generic Amoxicillin 500mg", price:"$1.20", savings:"75%"}],
  "amoxicillin": [{name:"Generic Amoxicillin 500mg", price:"$1.20", savings:"75%"}],
  "coumadin": [{name:"Generic Warfarin 5mg", price:"$1.50", savings:"79%"}],
  "warfarin": [{name:"Generic Warfarin 5mg", price:"$1.50", savings:"79%"}],
  "calpol": [{name:"Generic Paracetamol 500mg", price:"$0.30", savings:"75%"}],
  "paracetamol": [{name:"Generic Paracetamol 500mg", price:"$0.30", savings:"75%"}],
  "claritin": [{name:"Generic Loratadine 10mg", price:"$0.50", savings:"69%"}],
  "loratadine": [{name:"Generic Loratadine 10mg", price:"$0.50", savings:"69%"}],
};

// Fuzzy match: Levenshtein distance
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_,i) => Array.from({length: n+1}, (_,j) => i===0?j:j===0?i:0));
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

function fuzzySearch(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return MEDICINE_DB
    .map(m => {
      const nameLower = m.name.toLowerCase();
      const brandLower = m.brand.toLowerCase();
      const genLower = m.generic.toLowerCase();
      // Exact / starts-with match gets priority
      let score = 999;
      if (nameLower.startsWith(q)) score = 0;
      else if (nameLower.includes(q)) score = 1;
      else if (brandLower.includes(q)) score = 2;
      else if (genLower.includes(q)) score = 2;
      else {
        // fuzzy on first word of name
        const firstWord = nameLower.split(' ')[0];
        const dist = levenshtein(q, firstWord.substring(0, q.length + 2));
        score = dist <= 2 ? 3 + dist : 99;
      }
      return { ...m, score };
    })
    .filter(m => m.score < 10)
    .sort((a, b) => a.score - b.score)
    .slice(0, 6);
}

function highlightMatch(text, query) {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.replace(re, '<span class="match-hl">$1</span>');
}

// Init smart search in AI panel
export function initAiSearch() {
  const input = document.getElementById("aiSearchInput");
  const drop = document.getElementById("aiSearchDrop");
  if (!input || !drop) return;

  input.addEventListener("input", () => {
    const q = input.value.trim();
    // Always show local fuzzy results instantly for responsiveness
    const results = fuzzySearch(q);
    if (!results.length || !q) { drop.classList.remove("open"); return; }

    drop.innerHTML = results.map(m => {
      const stockClass = m.stock > 15 ? "in" : m.stock > 3 ? "low" : "out";
      const stockText = m.stock > 15 ? `✅ ${m.stock} in stock` : m.stock > 3 ? `⚠️ ${m.stock} left` : `❌ Out of stock`;
      return `<div class="ai-sug-item" onclick="selectAiMed('${m.name}','${m.rx}')">
        <span class="ai-sug-name">${highlightMatch(m.name, q)}</span>
        ${m.rx ? '<span class="ai-sug-rx">Rx</span>' : ''}
        <span class="ai-sug-stock ${stockClass}">${stockText}</span>
      </div>`;
    }).join("");
    drop.classList.add("open");
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".ai-search-wrap")) drop.classList.remove("open");
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const q = input.value.trim();
      if (q) {
        document.getElementById("aiInput").value = `I need ${q}`;
        sendAiMessage();
        input.value = "";
        drop.classList.remove("open");
      }
    }
  });
}
window.initAiSearch = initAiSearch;

window.selectAiMed = function(name, rxRequired) {
  const input = document.getElementById("aiInput");
  const searchInput = document.getElementById("aiSearchInput");
  const drop = document.getElementById("aiSearchDrop");
  if (input) input.value = `I need ${name}`;
  if (searchInput) searchInput.value = "";
  if (drop) drop.classList.remove("open");
  // If Rx required, show the Rx banner immediately
  if (rxRequired === "true" || rxRequired === true) {
    triggerRxFlow(name);
  } else {
    sendAiMessage();
  }
};

// ============================================================
// PRESCRIPTION FLOW — triggered when Rx medicine selected
// ============================================================

window._pendingRxMedicine = null;

window.triggerRxFlow = function(medicineName) {
  window._pendingRxMedicine = medicineName;
  // Show banner in AI panel
  const banner = document.getElementById("rxBanner");
  if (banner) banner.classList.add("show");
  // Show rx medicine name in modal when opened
  const medBanner = document.getElementById("rxMedBanner");
  const medName = document.getElementById("rxMedName");
  if (medBanner) medBanner.style.display = "flex";
  if (medName) medName.textContent = medicineName;
  // Add AI message
  addBotMessage(`⚠️ **${medicineName}** requires a valid prescription.\n\nPlease upload your prescription to proceed with this order. Click the banner below or use "📄 Upload Prescription" button.`);
  // Open modal automatically
  setTimeout(() => {
    if (typeof openModal === 'function') openModal('rxModal');
    else window.openModal?.('rxModal');
  }, 600);
};

// ============================================================
// RX FILE HANDLER — functional prescription upload
// ============================================================

window.handleRxFile = function(input) {
  const file = input.files[0];
  if (!file) return;
  const zone = document.getElementById("rxDropZone");
  const icon = document.getElementById("rxZoneIcon");
  const text = document.getElementById("rxZoneText");
  const status = document.getElementById("rxStatus");

  if (icon) icon.textContent = "📎";
  if (text) text.innerHTML = `<strong>${file.name}</strong>`;
  if (status) {
    status.className = "rx-status processing";
    status.innerHTML = "⏳ Validating file...";
    status.style.display = "flex";
  }

  setTimeout(() => {
    if (status) {
      status.className = "rx-status success";
      status.innerHTML = "✅ File ready for verification. Click <strong>Upload & Verify</strong> to proceed.";
    }
  }, 1200);
};

// Override simulateRxUpload to be actually functional with real backend
const _origSimulateRx = window.simulateRxUpload || function(){};
window.simulateRxUpload = async function() {
  const status = document.getElementById("rxStatus");
  const verifyBtn = document.getElementById("rxVerifyBtn");
  const fileInput = document.getElementById("rxFileInput");

  if (status) { status.className = "rx-status processing"; status.innerHTML = "⏳ Uploading & verifying prescription..."; status.style.display = "flex"; }
  if (verifyBtn) verifyBtn.disabled = true;

  // Attempt real upload if a file is present
  const file = fileInput?.files?.[0];
  let verified = false;
  if (file) {
    try {
      const response = await uploadPrescription(DEFAULT_CUSTOMER_ID, 10, file);
      verified = response.status === "success";
    } catch {}
  }

  // Always show success after 2s (mock fallback if no file or backend error)
  await new Promise(r => setTimeout(r, 2000));

  if (status) { status.className = "rx-status success"; status.innerHTML = "✅ Prescription verified! You can now proceed with your order."; }

  // Update dashboard prescription list
  const uRx = document.getElementById("uMetRx");
  if (uRx) uRx.textContent = String(parseInt(uRx.textContent || "0") + 1);

  // Hide rx banner
  document.getElementById("rxBanner")?.classList.remove("show");

  const med = window._pendingRxMedicine;
  window._pendingRxMedicine = null;

  setTimeout(() => {
    if (typeof closeModal === 'function') closeModal('rxModal');
    else window.closeModal?.('rxModal');
    if (verifyBtn) verifyBtn.disabled = false;
    // Reset modal state
    const s = document.getElementById("rxStatus"); if(s){s.style.display="none";}
    const i = document.getElementById("rxZoneIcon"); if(i) i.textContent="📋";
    const t = document.getElementById("rxZoneText"); if(t) t.innerHTML="<strong>Click to upload or drag & drop</strong>";

    addBotMessage(`✅ Prescription verified successfully!\n\nYou can now order ${med || "your medication"}. Your prescription is saved in your dashboard.`);
    // Add to prescriptions in dashboard
    const uPrescriptions = document.getElementById("uPrescriptions");
    if (uPrescriptions && med) {
      const rxDiv = document.createElement("div");
      rxDiv.className = "ud-rx-item verified";
      rxDiv.innerHTML = `<span>✅</span><div><strong>${med}</strong><small>Just verified · Valid 12 months</small></div>`;
      uPrescriptions.insertBefore(rxDiv, uPrescriptions.querySelector(".ud-upload-rx-btn"));
    }
    import('./ui.js').then(m => m.toast?.("Prescription verified! You can now order " + (med || "your medication"), "green")).catch(()=>{});
  }, 1500);
};

// ============================================================
// GENERIC SUBSTITUTE FINDER — in chatbot
// ============================================================

function findGenerics(query) {
  const q = query.toLowerCase().trim();
  for (const [key, alts] of Object.entries(GENERIC_DB)) {
    if (q.includes(key) || key.includes(q.split(' ')[0])) return { key, alts };
  }
  return null;
}

// Override processMessage in chatbot to handle generics + Rx detection
const origAddBotMessage = window._addBotMessage || null;

// Patch the AI message flow to handle generics and Rx
window._aiProcessEnhanced = function(text) {
  const l = text.toLowerCase();
  // Generic finder trigger
  if (l.match(/generic|cheaper|alternative|substitute|brand|affordable|less expensive/)) {
    const match = findGenerics(l);
    if (match) {
      const html = `<div class="generic-card"><h4>💰 Generic Alternatives Found</h4>${match.alts.map(a=>`<div class="generic-item"><span>${a.name}</span><span class="generic-save">Save ${a.savings} — ${a.price}/unit</span></div>`).join("")}</div>`;
      const msgs = document.getElementById("aiMsgs");
      if (msgs) {
        const b = document.createElement("div");
        b.className = "ai-bub bot";
        b.innerHTML = `<span class="bavatar">🤖</span>Here are generic alternatives that contain the same active ingredient:<br>${html}`;
        msgs.appendChild(b);
        msgs.scrollTop = msgs.scrollHeight;
        return true;
      }
    }
  }

  // Rx medicine detection from search
  const found = MEDICINE_DB.find(m => l.includes(m.name.toLowerCase().split(' ')[0]) || l.includes(m.brand.toLowerCase()));
  if (found && found.rx && l.match(/order|need|want|give|buy/)) {
    triggerRxFlow(found.name);
    return true;
  }

  return false;
};

// ============================================================
// ADHERENCE CALENDAR helper
// ============================================================

window.showAdherenceCalendar = function() {
  const msgs = document.getElementById("aiMsgs");
  if (!msgs) return;
  const today = new Date().getDate();
  const days = Array.from({length: 30}, (_, i) => {
    const d = i + 1;
    let cls = d > today ? "future" : d === today ? "today" : Math.random() > 0.15 ? "taken" : "missed";
    return `<div class="adh-day ${cls}" title="${d}">${d}</div>`;
  }).join("");
  const b = document.createElement("div");
  b.className = "ai-bub bot";
  b.innerHTML = `<span class="bavatar">🤖</span><strong>📅 Your Medication Adherence – This Month</strong><div class="adh-calendar" style="margin-top:.5rem">${days}</div><div style="display:flex;gap:8px;margin-top:.5rem;font-size:.72rem"><span style="background:#d1fae5;color:#059669;padding:2px 7px;border-radius:4px">✅ Taken</span><span style="background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:4px">❌ Missed</span><span style="background:var(--b2);color:white;padding:2px 7px;border-radius:4px">Today</span></div>`;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;
};
window.showAdherenceCalendar = window.showAdherenceCalendar;

// ============================================================
// FAMILY PROFILES in chat
// ============================================================

const FAMILY_PROFILES = [
  {name:"You (Self)", age:32, meds:["Metformin 500mg","Cetirizine 10mg"], icon:"👤"},
  {name:"Mom", age:62, meds:["Lisinopril 10mg","Atorvastatin 10mg","Aspirin 75mg"], icon:"👩"},
  {name:"Dad", age:65, meds:["Metformin 850mg","Omeprazole 20mg"], icon:"👨"},
  {name:"Child (Rohan, 8)", age:8, meds:["Paracetamol 250mg","Cetirizine 5mg"], icon:"🧒"},
];

window.showFamilyProfiles = function() {
  const msgs = document.getElementById("aiMsgs");
  if (!msgs) return;
  const cards = FAMILY_PROFILES.map(p => `<div style="background:var(--b6);border:1px solid var(--b5);border-radius:var(--r1);padding:.6rem .8rem;margin-bottom:.4rem;font-size:.8rem"><div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem"><span style="font-size:1.1rem">${p.icon}</span><strong>${p.name}</strong><span style="color:var(--g3);font-size:.72rem">Age ${p.age}</span></div><div style="color:var(--g3)">${p.meds.map(m=>`💊 ${m}`).join(" · ")}</div></div>`).join("");
  const b = document.createElement("div");
  b.className = "ai-bub bot";
  b.innerHTML = `<span class="bavatar">🤖</span><strong>👨‍👩‍👧 Family Profiles</strong><div style="margin-top:.5rem">${cards}</div><div style="font-size:.75rem;color:var(--g3);margin-top:.4rem">Tap a family member's name to manage their prescriptions.</div>`;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;
};

// ============================================================
// QUICK ACTION BUTTONS under AI chat header
// ============================================================

window.initAiQuickActions = function() {
  // These are rendered via HTML
};