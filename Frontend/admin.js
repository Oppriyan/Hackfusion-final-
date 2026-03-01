import { getAdminRevenue, getMedicines } from "./api.js";

export async function loadAdminData() {

  // -----------------------
  // Revenue
  // -----------------------
  const revenue = await getAdminRevenue();

  if (revenue.status === "success") {
    console.log("Admin Revenue:", revenue);
  }

  // -----------------------
  // Inventory
  // -----------------------
  const meds = await getMedicines();
  const invBody = document.getElementById("invBody");

  if (meds.status === "success") {

   const medicineList = Array.isArray(meds.medicines)
  ? meds.medicines
  : Array.isArray(meds.data)
  ? meds.data
  : [];

invBody.innerHTML = medicineList.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.category}</td>
        <td>${m.stock}</td>
        <td>${m.stock > 10 ? "In Stock" : "Low"}</td>
        <td>${m.price}</td>
        <td>${m.requires_rx ? "Yes" : "No"}</td>
        <td>-</td>
      </tr>
    `).join("");
  }
}