// ===================== tar_hab.js =====================

// ------------------------
// 🔹 Constantes
// ------------------------
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
const SHEET_NAME = "Habitos";

let habitosData = []; // Array de objetos {Fecha, Habito, Completado, Tarea}

// ------------------------
// 0️⃣ Token
// ------------------------
function setToken(newToken) {
  token = newToken;
}

// ------------------------
// 1️⃣ Utilidades
// ------------------------
function showSection(sectionId) {
  const sections = [
    "mainMenu",
    "agendaContainer",
    "finanzasContainer",
    "tarHabContainer"
  ];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? "flex" : "none";
  });
}

function parseRow(headers, row) {
  const entry = {};
  headers.forEach((h, i) => {
    const key = h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
    entry[key] = row[i] || "";
  });
  return entry;
}

function acumularPorDia(data) {
  const dias = {};
  data.forEach(d => {
    if (!dias[d.Fecha]) dias[d.Fecha] = { completados: 0, totales: 0 };
    if (d.Completado.toLowerCase() === "sí") dias[d.Fecha].completados++;
    dias[d.Fecha].totales++;
  });
  return dias;
}

// ------------------------
// 2️⃣ Cargar datos desde Google Sheets
// ------------------------
async function cargarHabitos() {
  if (!token) return;
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.values || data.values.length < 2) {
      habitosData = [];
      renderCalendario();
      renderListas();
      return;
    }
    const headers = data.values[0];
    const rows = data.values.slice(1);
    habitosData = rows.map(row => parseRow(headers, row));
    renderCalendario();
    renderListas();
  } catch (err) {
    console.error("Error cargando Hábitos:", err);
  }
}

// ------------------------
// 3️⃣ Guardar nuevo hábito/tarea
// ------------------------
async function agregarHabito(habitoObj) {
  if (!token) return;
  const payload = { values: [[
    Date.now().toString(), // ID
    habitoObj.Fecha || "",
    habitoObj.Habito || "",
    habitoObj.Tarea || "",
    habitoObj.Completado || "No"
  ]]};

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`,
      { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const result = await res.json();
    if (result.updates) await cargarHabitos();
  } catch (err) {
    console.error("Error agregando hábito:", err);
  }
}

// ------------------------
// 4️⃣ Renderizar calendario motivacional
// ------------------------
function renderCalendario() {
  const container = document.getElementById("tarHabCalendario");
  if (!container) return;
  container.innerHTML = "";

  const diasMap = acumularPorDia(habitosData);
  const fechas = Object.keys(diasMap).sort();

  fechas.forEach(fecha => {
    const dia = document.createElement("div");
    dia.textContent = fecha;
    const ratio = diasMap[fecha].completados / diasMap[fecha].totales;
    if (ratio === 1) dia.style.backgroundColor = "#4caf50"; // Todos completados
    else if (ratio > 0) dia.style.backgroundColor = "#ffeb3b"; // Parcial
    else dia.style.backgroundColor = "#f44336"; // Ninguno
    dia.style.color = "black";
    dia.style.margin = "2px";
    dia.style.padding = "5px";
    dia.style.display = "inline-block";
    dia.style.borderRadius = "4px";
    container.appendChild(dia);
  });
}

// ------------------------
// 5️⃣ Renderizar listas de tareas y hábitos
// ------------------------
function renderListas() {
  const tareasEl = document.getElementById("tarHabTareas");
  const habitosEl = document.getElementById("tarHabHabitos");
  if (!tareasEl || !habitosEl) return;

  tareasEl.innerHTML = "<h3>Tareas</h3>";
  habitosEl.innerHTML = "<h3>Hábitos</h3>";

  habitosData.forEach(h => {
    const div = document.createElement("div");
    div.textContent = `${h.Fecha}: ${h.Habito || h.Tarea} - ${h.Completado}`;
    if (h.Habito) habitosEl.appendChild(div);
    if (h.Tarea) tareasEl.appendChild(div.cloneNode(true));
  });
}

// ------------------------
// 6️⃣ Export / Captura
// ------------------------
function exportTarHab() {
  const container = document.getElementById("tarHabContainer");
  if (!container) return;
  html2canvas(container).then(canvas => {
    const link = document.createElement("a");
    link.download = `Tareas_Habitos_${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}

// ------------------------
// 7️⃣ Mostrar módulo Tareas & Hábitos
// ------------------------
async function mostrarTarHab() {
  showSection("tarHabContainer");
  await cargarHabitos();

  // Botón volver
  document.querySelectorAll(".btnVolverTarHab").forEach(btn => {
    btn.addEventListener("click", () => showSection("mainMenu"));
  });

  // Exportar/captura
  const btnExport = document.getElementById("btnExportTarHab");
  if (btnExport) btnExport.addEventListener("click", exportTarHab);
}

// ------------------------
// 8️⃣ Exportar funciones públicas
// ------------------------
const TarHab = {
  mostrarTarHab,
  setToken,
  agregarHabito,
  cargarHabitos
};
