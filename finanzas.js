// ================= FINANZAS.JS =================

const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU"; // tu ID real
const SHEET_NAME = "Finanzas";

let finanzasData = []; // todos los movimientos cargados
// ------------------------
// 0️⃣ Set token desde app.js
// ------------------------
function setToken(newToken) {
  token = newToken;
}

// ------------------------
// Utils: mostrar/ocultar secciones
// ------------------------
function showSection(sectionId) {
  const sections = [
    "finanzasMenu",
    "finanzasMovimientos",
    "finanzasAgregar",
    "finanzasReportes",
    "finanzasProyecciones",
    "finanzasSimulaciones"
  ];

  sections.forEach(id => {
    document.getElementById(id).style.display = id === sectionId ? "block" : "none";
  });
}

// ------------------------
// 1️⃣ Cargar datos de Finanzas desde Sheets
// ------------------------
async function cargarFinanzas() {
  if (!token) return;

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    const data = await res.json();

    console.log("Respuesta API:", data);

    if (!data.values || data.values.length < 2) {
      console.error("No hay datos en la hoja");
      finanzasData = [];
      renderTablaMovimientos();
      return;
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    // Normalizar nombres de columnas para JS
    finanzasData = rows.map(row => {
      const entry = {};
      headers.forEach((h, i) => {
        const key = h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
        entry[key] = row[i] || "";
      });
      return entry;
    });

    renderTablaMovimientos();
  } catch (err) {
    console.error("Error cargando Finanzas:", err);
  }
}

// ------------------------
// 2️⃣ Filtrar por mes y año
// ------------------------
function filtrarPorMes(data, mes, anio) {
  return data.filter(mov => {
    if (!mov.Fecha) return false;
    const [y, m] = mov.Fecha.split("-");
    return parseInt(m, 10) - 1 === mes && parseInt(y, 10) === anio;
  });
}

// ------------------------
// 3️⃣ Renderizar tabla de movimientos
// ------------------------
function renderTablaMovimientos() {
  const tableBody = document.getElementById("finanzas-table-body");
  tableBody.innerHTML = "";

  const selector = document.getElementById("selectorMes");
  if (!selector) return;
  const [anio, mesStr] = selector.value.split("-");
  const mes = parseInt(mesStr, 10) - 1;
  const anioInt = parseInt(anio, 10);

  const filteredData = finanzasData.filter(mov => {
    if (!mov.Fecha) return false;
    const [y, m] = mov.Fecha.split("-");
    return parseInt(y, 10) === anioInt && parseInt(m, 10) - 1 === mes;
  });

  filteredData.forEach(mov => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mov.Fecha}</td>
      <td>${mov.Tipo}</td>
      <td>${mov.Cantidad}</td>
      <td>${mov.Nombre}</td>
      <td>${mov.MetodoPago}</td>
    `;
    tr.style.color = "white";
    tableBody.appendChild(tr);
  });

  renderResumen(filteredData);
}

// ------------------------
// 4️⃣ Renderizar resumen
// ------------------------
function renderResumen(data) {
  let totalIngresos = 0;
  let totalGastos = 0;

  data.forEach(mov => {
    const cantidad = parseFloat(mov.Cantidad) || 0;
    if (mov.Tipo === "Ingreso") totalIngresos += cantidad;
    if (mov.Tipo === "Gasto") totalGastos += cantidad;
  });

  const saldo = totalIngresos - totalGastos;

  document.getElementById("total-ingresos").textContent = totalIngresos;
  document.getElementById("total-gastos").textContent = totalGastos;
  document.getElementById("saldo").textContent = saldo;
}

// ------------------------
// 5️⃣ Agregar movimiento
// ------------------------
async function agregarMovimiento(event) {
  event.preventDefault();
  if (!token) return;

  const payload = {
    values: [[
      Date.now().toString(),
      document.getElementById("grupo").value,
      document.getElementById("tipo").value,
      document.getElementById("fecha").value,
      document.getElementById("cantidad").value,
      document.getElementById("nombre").value,
      document.getElementById("metodoPago").value,
      "", "", "", "", "",
      document.getElementById("cantidad").value,
      "", "", "-"
    ]]
  };

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const result = await res.json();

    if (result.updates) {
      await cargarFinanzas();
      document.getElementById("form-finanza").reset();
    } else {
      console.error("Error agregando movimiento:", result);
    }
  } catch (err) {
    console.error("Error agregando movimiento:", err);
  }
}

// ------------------------
// 6️⃣ Mostrar sección Finanzas principal
// ------------------------
async function mostrarFinanzas() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "flex";

  // Mostrar solo el menú principal
  showSection("finanzasMenu");

  // Inicializar selector de mes
  const selector = document.getElementById("selectorMes");
  if (selector) {
    const hoy = new Date();
    selector.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    selector.addEventListener("change", renderTablaMovimientos);
  }

  await cargarFinanzas();
}

// ------------------------
// 7️⃣ Cascarones nuevas funciones
// ------------------------
function renderReportes() {
  console.log("Renderizando Reportes (vacío por ahora)");
}

function renderProyecciones() {
  console.log("Renderizando Proyecciones (vacío por ahora)");
}

function renderSimulaciones() {
  console.log("Renderizando Simulaciones (vacío por ahora)");
}

// ------------------------
// 8️⃣ Inicialización botones navegación
// ------------------------
function initBotonesSubmenus() {
  document.getElementById("btnMovimientos")?.addEventListener("click", () => showSection("finanzasMovimientos"));
  document.getElementById("btnAgregar")?.addEventListener("click", () => showSection("finanzasAgregar"));
  document.getElementById("btnReportes")?.addEventListener("click", () => {
    showSection("finanzasReportes");
    renderReportes();
  });
  document.getElementById("btnProyecciones")?.addEventListener("click", () => {
    showSection("finanzasProyecciones");
    renderProyecciones();
  });
  document.getElementById("btnSimulaciones")?.addEventListener("click", () => {
    showSection("finanzasSimulaciones");
    renderSimulaciones();
  });

  document.querySelectorAll(".btnVolverFinanzas").forEach(btn => {
    btn.addEventListener("click", () => showSection("finanzasMenu"));
  });

  const btnVolverMenuFinanzas = document.getElementById("btnVolverMenuFinanzas");
  if (btnVolverMenuFinanzas) btnVolverMenuFinanzas.addEventListener("click", mostrarMenuPrincipal);

  const formFinanza = document.getElementById("form-finanza");
  if (formFinanza) formFinanza.addEventListener("submit", agregarMovimiento);
}

// ------------------------
// 9️⃣ Inicialización al cargar DOM
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
  initBotonesSubmenus();
});

// ------------------------
// 🔟 Exportar funciones públicas
// ------------------------
const Finanzas = {
  mostrarFinanzas,
  cargarFinanzas,
  setToken,
  renderReportes,
  renderProyecciones,
  renderSimulaciones,
  initBotonesSubmenus
};
