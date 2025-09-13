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

    if (!data.values || data.values.length < 2) {
      console.error("No hay datos en la hoja");
      finanzasData = [];
      renderTablaMovimientos();
      renderReportes();
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
    renderReportes(); // ⚡ actualizar reportes después de cargar datos
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
  
  showSection("finanzasMenu");
  await cargarFinanzas();
  // ⚡ Selector de Movimientos
  const selector = document.getElementById("selectorMes");
  if (selector) {
    const hoy = new Date();
    selector.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    selector.addEventListener("change", renderTablaMovimientos);
  }

  // ⚡ Selector de Reportes
  const selectorReportes = document.getElementById("selectorMesReportes");
  if (selectorReportes) {
    const hoy = new Date();
    selectorReportes.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    selectorReportes.addEventListener("change", () => {
      renderReportes(); // actualiza solo reportes
    });
  }


}

// ------------------------
// 7️⃣ Reportes
// ------------------------
function obtenerDatosReportes() {
  const selector = document.getElementById("selectorMesReportes"); // ⚡ usar selector de reportes
  if (!selector) return {};

  const [anio, mesStr] = selector.value.split("-");
  const mes = parseInt(mesStr, 10) - 1;
  const anioInt = parseInt(anio, 10);

  const datosMes = finanzasData.filter(mov => {
    if (!mov.Fecha) return false;
    const [y, m] = mov.Fecha.split("-");
    return parseInt(y, 10) === anioInt && parseInt(m, 10) - 1 === mes;
  });

  let totalIngresosNetos = 0;
  let totalGastos = 0;
  const gruposMap = {};
  const metodosPagoMap = {};
  let horasTrabajadas = 0;
  let salarioPorHoraSum = 0;
  let ingresosLaborales = 0;

  datosMes.forEach(mov => {
    const cantidad = parseFloat(mov.Cantidad) || 0;

    if (mov.Tipo === "Ingreso") {
      const horas = parseFloat(mov.HorasTrabajadas) || 0;
      const salario = parseFloat(mov.SalarioPorHora) || 0;
      const propinas = parseFloat(mov.Propinas) || 0;
      const bonos = parseFloat(mov.BonosAguinaldo) || 0;
      const deducciones = parseFloat(mov.Deducciones) || 0;

      const neto = horas * salario + propinas + bonos - deducciones;
      totalIngresosNetos += neto;

      horasTrabajadas += horas;
      salarioPorHoraSum += salario;
      ingresosLaborales += 1;
    }

    if (mov.Tipo === "Gasto") totalGastos += cantidad;

    if (mov.Grupo) gruposMap[mov.Grupo] = (gruposMap[mov.Grupo] || 0) + cantidad;
    if (mov.MetodoPago) metodosPagoMap[mov.MetodoPago] = (metodosPagoMap[mov.MetodoPago] || 0) + cantidad;
  });

  return {
    totalIngresosNetos,
    totalGastos,
    saldo: totalIngresosNetos - totalGastos,
    grupos: Object.keys(gruposMap),
    distribucionGrupo: Object.values(gruposMap),
    metodosPago: Object.keys(metodosPagoMap),
    usoMetodosPago: Object.values(metodosPagoMap),
    horasTrabajadas,
    salarioPromedio: ingresosLaborales ? salarioPorHoraSum / ingresosLaborales : 0
  };
}

let chartIngresosGastos, chartDistribucionGrupo, chartSaldoMensual, chartMetodosPago, chartHorasSalario;

function renderReportes() {
  const datos = obtenerDatosReportes();

  if (chartIngresosGastos) chartIngresosGastos.destroy();
  chartIngresosGastos = new Chart(document.getElementById("graficoIngresosGastos"), {
    type: "bar",
    data: {
      labels: ["Mes seleccionado"],
      datasets: [
        { label: "Ingresos Netos", data: [datos.totalIngresosNetos], backgroundColor: "#4caf50" },
        { label: "Gastos", data: [datos.totalGastos], backgroundColor: "#f44336" }
      ]
    }
  });

  if (chartDistribucionGrupo) chartDistribucionGrupo.destroy();
  chartDistribucionGrupo = new Chart(document.getElementById("graficoDistribucionGrupo"), {
    type: "pie",
    data: {
      labels: datos.grupos,
      datasets: [{ data: datos.distribucionGrupo, backgroundColor: ["#4caf50","#f44336","#2196f3","#ff9800","#9c27b0"] }]
    }
  });

  if (chartSaldoMensual) chartSaldoMensual.destroy();
  chartSaldoMensual = new Chart(document.getElementById("graficoSaldoMensual"), {
    type: "line",
    data: { labels: ["Mes seleccionado"], datasets: [{ label: "Saldo", data: [datos.saldo], borderColor: "#ffeb3b", fill: false }] }
  });

  if (chartMetodosPago) chartMetodosPago.destroy();
  chartMetodosPago = new Chart(document.getElementById("graficoMetodosPago"), {
    type: "bar",
    data: {
      labels: datos.metodosPago,
      datasets: [{ label: "Uso", data: datos.usoMetodosPago, backgroundColor: "#2196f3" }]
    },
    options: { indexAxis: 'y' }
  });

  if (chartHorasSalario) chartHorasSalario.destroy();
  chartHorasSalario = new Chart(document.getElementById("graficoHorasSalario"), {
    type: "bar",
    data: {
      labels: ["Mes seleccionado"],
      datasets: [
        { label: "Horas Trabajadas", data: [datos.horasTrabajadas], backgroundColor: "#ff9800" },
        { label: "Salario Promedio", data: [datos.salarioPromedio], backgroundColor: "#9c27b0" }
      ]
    }
  });
}

//------------------------------------------------
//------------------------------------------------

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
