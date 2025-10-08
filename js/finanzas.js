// ===================== finanzas.js =====================

// --------------------- Configuración ---------------------
const SHEET_NAME_1 = "Finanzas";

// --------------------- Función para cargar movimientos financieros ---------------------
async function cargarFinanzas() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_1}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    return Array.isArray(data.values) ? data.values : [];
  } catch (err) {
    console.error("Error al cargar movimientos financieros:", err);
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = "Error al cargar movimientos financieros";
    return [];
  }
}

// --------------------- Función para mostrar movimientos financieros ---------------------
async function mostrarFinanzas() {
  const msg = document.getElementById("msg");
  if (msg) msg.innerText = "Cargando movimientos financieros...";

  const movimientos = await cargarFinanzas();
  console.log("Movimientos financieros cargados:", movimientos);

  if (msg) msg.innerText = "";
}

// --------------------- Inicialización del módulo ---------------------
async function initFinanzas() {
  console.log("[Finanzas] Inicializando módulo");

  await mostrarFinanzas();

  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.addEventListener("click", () => window.volverHome());
}

// --------------------- Exponer función al scope global ---------------------
window.initFinanzas = initFinanzas;
