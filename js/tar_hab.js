// ================= TAR_HAB.JS =================

// Usa un nombre distinto para no chocar con finanzas.js
const HABITOS_SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU"; 
const HABITOS_SHEET_NAME = "Habitos";

let token = null; // el token lo recibimos de app.js
let habitosData = [];
let chartSimulaciones = null;

// ------------------------
// 0️⃣ Configuración Token
// ------------------------
function setToken(newToken) {
  token = newToken;
}

// ------------------------
// 1️⃣ Mostrar/Ocultar sección
// ------------------------
function showSection(sectionId) {
  const sections = ["tarHabContainer"];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? "block" : "none";
  });
}

// ------------------------
// 2️⃣ Cargar datos desde Google Sheets
// ------------------------
async function cargarHabitos() {
  if (!token) return;
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${HABITOS_SPREADSHEET_ID}/values/${HABITOS_SHEET_NAME}?majorDimension=ROWS`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.values || data.values.length < 2) {
      habitosData = [];
      renderHabitos();
      return;
    }
    const headers = data.values[0];
    const rows = data.values.slice(1);
    habitosData = rows.map(row => {
      const entry = {};
      headers.forEach((h, i) => {
        const key = h.replace(/\s/g, "");
        entry[key] = row[i] || "";
      });
      return entry;
    });
    renderHabitos();
  } catch (err) {
    console.error("Error cargando Habitos:", err);
  }
}

// ------------------------
// 3️⃣ Renderizar tareas, hábitos y calendario motivacional
// ------------------------
function renderHabitos() {
  const tareasEl = document.getElementById("tarHabTareas");
  const habitosEl = document.getElementById("tarHabHabitos");
  const calendarioEl = document.getElementById("tarHabCalendario");

  if (tareasEl) tareasEl.innerHTML = "<h3>Tareas:</h3>" + 
    habitosData.filter(d => d.Tipo === "Tarea").map(d => `<p>${d.Nombre}</p>`).join("");

  if (habitosEl) habitosEl.innerHTML = "<h3>Hábitos:</h3>" + 
    habitosData.filter(d => d.Tipo === "Habito").map(d => `<p>${d.Nombre}</p>`).join("");

  if (calendarioEl) calendarioEl.innerHTML = "<p>Calendario motivacional aquí 🔥</p>";
}

// ------------------------
// 4️⃣ Simulaciones rápidas (escenarios)
// ------------------------
function simularEscenario(escenario) {
  const ingreso = parseFloat(document.getElementById("simIngreso").value) || 0;
  const gasto = parseFloat(document.getElementById("simGasto").value) || 0;
  const ahorro = parseFloat(document.getElementById("simAhorro").value) || 0;

  let multiplicador = 1;
  if (escenario === "optimista") multiplicador = 1.2;
  if (escenario === "pesimista") multiplicador = 0.8;

  const ahorroMensual = (ingreso - gasto) * multiplicador + ahorro;
  const resultadosEl = document.getElementById("simulacionResultados");
  if (resultadosEl) resultadosEl.textContent = `Ahorro mensual estimado: $${ahorroMensual.toFixed(2)}`;

  // Graficar ahorro acumulado 12 meses
  const acumulado = [];
  let total = 0;
  for (let i = 0; i < 12; i++) {
    total += ahorroMensual;
    acumulado.push(total.toFixed(2));
  }

  const ctx = document.getElementById("graficoSimulaciones");
  if (ctx) {
    if (chartSimulaciones) chartSimulaciones.destroy();
    chartSimulaciones = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
        datasets: [{
          label: "Ahorro acumulado",
          data: acumulado,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76,175,80,0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, plugins: { legend: { position: "top" } } }
    });
  }
}

// ------------------------
// 5️⃣ Botones y eventos
// ------------------------
function initBotonesTarHab() {
  document.getElementById("btnExportTarHab")?.addEventListener("click", () => {
    alert("Función de exportar o captura aún por implementar 📸");
  });

  document.getElementById("btnSimularBase")?.addEventListener("click", () => simularEscenario("base"));
  document.getElementById("btnSimularOptimista")?.addEventListener("click", () => simularEscenario("optimista"));
  document.getElementById("btnSimularPesimista")?.addEventListener("click", () => simularEscenario("pesimista"));

  document.querySelectorAll(".btnVolverTarHab").forEach(btn => {
    btn.addEventListener("click", () => {
      showSection("mainMenu");
    });
  });
}

// ------------------------
// 6️⃣ Función principal para mostrar el módulo
// ------------------------
async function mostrarTarHab() {
  showSection("tarHabContainer");
  await cargarHabitos();
}

// ------------------------
// 7️⃣ Exportar funciones públicas
// ------------------------
const TarHab = {
  mostrarTarHab,
  setToken,
  initBotonesTarHab
};
