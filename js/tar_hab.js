// ===================== tarhab.js =====================

// ------------------------
// 🔹 Variables internas
// ------------------------
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
const SHEET_NAME = "Habitos";
let habitosData = [];
let chartHabitos = null;

// ------------------------
// 0️⃣ Token
// ------------------------
function setToken(newToken) {
  TarHab.token = newToken;
}

// ------------------------
// 1️⃣ Utilidades
// ------------------------
function showSection(sectionId) {
  const sections = ["tarHabContainer"];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? "block" : "none";
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

// ------------------------
// 2️⃣ Cargar datos de Habitos
// ------------------------
async function cargarHabitos() {
  if (!TarHab.token) return;
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`,
      { headers: { "Authorization": `Bearer ${TarHab.token}` } }
    );
    const data = await res.json();
    if (!data.values || data.values.length < 2) {
      habitosData = [];
      renderHabitos();
      return;
    }
    const headers = data.values[0];
    const rows = data.values.slice(1);
    habitosData = rows.map(row => parseRow(headers, row));
    renderHabitos();
  } catch (err) {
    console.error("Error cargando Habitos:", err);
  }
}

// ------------------------
// 3️⃣ Renderizar Habitos y Calendario
// ------------------------
function renderHabitos() {
  const contTareas = document.getElementById("tarHabTareas");
  const contHabitos = document.getElementById("tarHabHabitos");
  const contCalendario = document.getElementById("tarHabCalendario");

  if (!contTareas || !contHabitos || !contCalendario) return;

  contTareas.innerHTML = "";
  contHabitos.innerHTML = "";
  contCalendario.innerHTML = "";

  const hoy = new Date().toISOString().slice(0, 10);

  habitosData.forEach((habito, idx) => {
    const div = document.createElement("div");
    div.style.marginBottom = "5px";

    const fechaCumplido = habito.Fecha || "";
    const cumplido = habito.Cumplido === "TRUE";

    div.innerHTML = `
      <strong>${habito.Habito || habito.Tarea || "Sin nombre"}</strong> - ${fechaCumplido} 
      <span style="color:${cumplido ? "green" : "red"}">${cumplido ? "✔" : "✖"}</span>
    `;

    if (habito.Tipo === "Tarea") contTareas.appendChild(div);
    else contHabitos.appendChild(div);
  });

  // Crear gráfico simple de hábitos cumplidos
  const labels = habitosData.map(h => h.Habito || h.Tarea || "");
  const data = habitosData.map(h => h.Cumplido === "TRUE" ? 1 : 0);

  if (chartHabitos) chartHabitos.destroy();
  const canvas = document.createElement("canvas");
  canvas.id = "graficoHabitos";
  canvas.width = 400;
  canvas.height = 200;
  contCalendario.appendChild(canvas);

  chartHabitos = new Chart(canvas, {
    type: "bar",
    data: { labels, datasets: [{ label: "Días Cumplidos", data, backgroundColor: "#4caf50" }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

// ------------------------
// 4️⃣ Funciones públicas
// ------------------------
function mostrarTarHab() {
  showSection("tarHabContainer");
  cargarHabitos();
}

// ------------------------
// 5️⃣ Botones
// ------------------------
function initBotonesTarHab() {
  const btnVolver = document.querySelectorAll(".btnVolverTarHab");
  btnVolver.forEach(btn => btn.addEventListener("click", () => {
    showSection("mainMenu");
  }));

  const btnExport = document.getElementById("btnExportTarHab");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      alert("Aquí podrías generar una captura de pantalla o exportar PDF.");
    });
  }
}

// ------------------------
// 6️⃣ Exportar objeto TarHab
// ------------------------
const TarHab = {
  mostrarTarHab,
  setToken,
  initBotonesTarHab
};
