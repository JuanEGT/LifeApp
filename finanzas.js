// ================= FINANZAS.JS =================

// ------------------------
// 🔹 Constantes y variables globales
// ------------------------
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
const SHEET_NAME = "Finanzas";
let finanzasData = [];
let charts = {};

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
    "finanzasMenu", "finanzasMovimientos", "finanzasAgregar",
    "finanzasReportes", "finanzasProyecciones", "finanzasSimulaciones"
  ];
  sections.forEach(id => document.getElementById(id).style.display = id === sectionId ? "block" : "none");
}

function parseFecha(fechaStr) {
  const [y, m] = fechaStr.split("-").map(v => parseInt(v, 10));
  return { anio: y, mes: m - 1 };
}

function filtrarPorMes(data, anio, mes) {
  return data.filter(mov => mov.Fecha && parseFecha(mov.Fecha).anio === anio && parseFecha(mov.Fecha).mes === mes);
}

function sumarPorTipo(data, tipo) {
  return data.reduce((acc, mov) => acc + ((mov.Tipo === tipo) ? parseFloat(mov.Cantidad || 0) : 0), 0);
}

function acumularPorClave(data, clave) {
  return data.reduce((acc, mov) => {
    if (mov[clave]) acc[mov[clave]] = (acc[mov[clave]] || 0) + (parseFloat(mov.Cantidad) || 0);
    return acc;
  }, {});
}

function calcularIngresosNetos(data) {
  let total = 0, horas = 0, salarioSum = 0, ingresosLaborales = 0;
  data.forEach(mov => {
    if (mov.Tipo === "Ingreso") {
      const h = parseFloat(mov.HorasTrabajadas) || 0;
      const s = parseFloat(mov.SalarioPorHora) || 0;
      const prop = parseFloat(mov.Propinas) || 0;
      const bonos = parseFloat(mov.BonosAguinaldo) || 0;
      const ded = parseFloat(mov.Deducciones) || 0;
      total += h * s + prop + bonos - ded;
      horas += h;
      salarioSum += s;
      ingresosLaborales++;
    }
  });
  return { total, horas, salarioPromedio: ingresosLaborales ? salarioSum / ingresosLaborales : 0 };
}

function renderChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (charts[canvasId]) charts[canvasId].destroy();
  charts[canvasId] = new Chart(canvas, config);
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
// 2️⃣ Cargar datos
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
      finanzasData = [];
      renderTablaMovimientos();
      renderReportes();
      return;
    }
    const headers = data.values[0];
    const rows = data.values.slice(1);
    finanzasData = rows.map(row => parseRow(headers, row));
    renderTablaMovimientos();
    renderReportes();
  } catch (err) {
    console.error("Error cargando Finanzas:", err);
  }
}

// ------------------------
// 3️⃣ Tabla y resumen
// ------------------------
function renderTablaMovimientos() {
  const tableBody = document.getElementById("finanzas-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  const selector = document.getElementById("selectorMes");
  if (!selector) return;
  const [anio, mesStr] = selector.value.split("-");
  const mes = parseInt(mesStr, 10) - 1;
  const anioInt = parseInt(anio, 10);
  const filteredData = filtrarPorMes(finanzasData, anioInt, mes);
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

function renderResumen(data) {
  const totalIngresos = sumarPorTipo(data, "Ingreso");
  const totalGastos = sumarPorTipo(data, "Gasto");
  const saldo = totalIngresos - totalGastos;
  document.getElementById("total-ingresos").textContent = totalIngresos;
  document.getElementById("total-gastos").textContent = totalGastos;
  document.getElementById("saldo").textContent = saldo;
}

// ------------------------
// 4️⃣ Agregar movimiento
// ------------------------
function crearPayloadFormulario() {
  return {
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
}

async function agregarMovimiento(event) {
  event.preventDefault();
  if (!token) return;
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`,
      { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(crearPayloadFormulario()) }
    );
    const result = await res.json();
    if (result.updates) {
      await cargarFinanzas();
      document.getElementById("form-finanza").reset();
    } else console.error("Error agregando movimiento:", result);
  } catch (err) {
    console.error("Error agregando movimiento:", err);
  }
}

// ------------------------
// 5️⃣ Reportes
// ------------------------
function obtenerDatosReportes() {
  const selectorMes = document.getElementById("mesReporte");
  const selectorAnio = document.getElementById("anioReporte");
  if (!selectorMes || !selectorAnio) return {};
  const [anioStr, mesStr] = selectorMes.value.split("-");
  const mes = parseInt(mesStr, 10) - 1;
  const anioInt = parseInt(selectorAnio.value, 10);
  const datosMes = filtrarPorMes(finanzasData, anioInt, mes);
  const ingresosNetos = calcularIngresosNetos(datosMes);
  const totalGastos = sumarPorTipo(datosMes, "Gasto");
  const gruposMap = acumularPorClave(datosMes, "Grupo");
  const metodosPagoMap = acumularPorClave(datosMes, "MetodoPago");
  return {
    totalIngresosNetos: ingresosNetos.total,
    totalGastos,
    saldo: ingresosNetos.total - totalGastos,
    grupos: Object.keys(gruposMap),
    distribucionGrupo: Object.values(gruposMap),
    metodosPago: Object.keys(metodosPagoMap),
    usoMetodosPago: Object.values(metodosPagoMap),
    horasTrabajadas: ingresosNetos.horas,
    salarioPromedio: ingresosNetos.salarioPromedio
  };
}

// ------------------------ 
// 6️⃣ Proyecciones
// ------------------------
let chartProyeccionInversion, chartProyeccionDeuda;

function calcularProyecciones() {
  const anioInicio = parseInt(document.getElementById("anioInicioProyecciones").value, 10);
  const horizonte = Math.min(parseInt(document.getElementById("horizonteProyecciones").value, 10), 5);
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1; // 1-12
  const meses = [];
  const fechas = [];
  for (let i = 0; i < horizonte * 12; i++) {
    let mes = (mesActual + i - 1) % 12 + 1;
    let anio = anioInicio + Math.floor((mesActual + i - 1) / 12);
    meses.push(`${anio}-${String(mes).padStart(2, "0")}`);
    fechas.push(`${String(mes).padStart(2, "0")}/${anio}`);
  }

  const inversionesData = finanzasData.filter(d => d.Tipo === "Inversión");
  const deudasData = finanzasData.filter(d => d.Tipo === "Deuda");

  const proyectar = (datos, meses) => {
    const saldoMensual = [];
    let saldoActual = 0;

    meses.forEach(mesStr => {
      const registrosMes = datos.filter(d => d.Fecha <= mesStr);
      let incrementoMes = 0;

      registrosMes.forEach(d => {
        const cantidad = parseFloat(d.Cantidad) || 0;
        const interes = parseFloat(d.Interes) || 0;
        const periodicidad = d.Periodicidad || "Mensual";

        if (periodicidad === "Mensual") {
          incrementoMes += saldoActual * (interes / 100) + cantidad;
        } else if (periodicidad === "Anual") {
          incrementoMes += saldoActual * (interes / 100 / 12) + cantidad;
        }
      });

      saldoActual += incrementoMes;
      saldoMensual.push(parseFloat(saldoActual.toFixed(2)));
    });

    return saldoMensual;
  };

  const saldoInversion = proyectar(inversionesData, meses);
  const saldoDeuda = proyectar(deudasData, meses);

  if (chartProyeccionInversion) chartProyeccionInversion.destroy();
  if (document.getElementById("graficoProyeccionesInversion")) {
    chartProyeccionInversion = new Chart(document.getElementById("graficoProyeccionesInversion"), {
      type: "line",
      data: {
        labels: fechas,
        datasets: [{
          label: "Inversiones proyectadas",
          data: saldoInversion,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76,175,80,0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, plugins: { legend: { position: "top" } } }
    });
  }

  if (chartProyeccionDeuda) chartProyeccionDeuda.destroy();
  if (document.getElementById("graficoProyeccionesDeuda")) {
    chartProyeccionDeuda = new Chart(document.getElementById("graficoProyeccionesDeuda"), {
      type: "line",
      data: {
        labels: fechas,
        datasets: [{
          label: "Deudas proyectadas",
          data: saldoDeuda,
          borderColor: "#f44336",
          backgroundColor: "rgba(244,67,54,0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, plugins: { legend: { position: "top" } } }
    });
  }
}

// Inicializar botón
document.getElementById("btnCalcularProyecciones")?.addEventListener("click", calcularProyecciones);

// Función pública para el módulo
function renderProyecciones() {
  calcularProyecciones();
}

// 
function renderSimulaciones() { console.log("Renderizando Simulaciones (vacío)"); }

// ------------------------
// 7️⃣ Mostrar sección principal
// ------------------------
async function mostrarFinanzas() {
  ["loginContainer","mainMenu","agendaContainer"].forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById("finanzasContainer").style.display = "flex";
  showSection("finanzasMenu");
  await cargarFinanzas();

  const selector = document.getElementById("selectorMes");
  if (selector) {
    const hoy = new Date();
    selector.value = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}`;
    selector.addEventListener("change", renderTablaMovimientos);
  }

  const selectorMes = document.getElementById("mesReporte");
  const selectorAnio = document.getElementById("anioReporte");
  if (selectorMes && selectorAnio) {
    const hoy = new Date();
    selectorMes.value = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}`;
    selectorAnio.value = hoy.getFullYear();
    renderReportes();
    selectorMes.addEventListener("change", renderReportes);
    selectorAnio.addEventListener("change", renderReportes);
  }
}

// ------------------------
// 8️⃣ Botones y formularios
// ------------------------
function initBotonesSubmenus() {
  const botones = [
    { id: "btnMovimientos", fn: () => showSection("finanzasMovimientos") },
    { id: "btnAgregar", fn: () => showSection("finanzasAgregar") },
    { id: "btnReportes", fn: () => { showSection("finanzasReportes"); renderReportes(); } },
    { id: "btnProyecciones", fn: () => { showSection("finanzasProyecciones"); renderProyecciones(); } },
    { id: "btnSimulaciones", fn: () => { showSection("finanzasSimulaciones"); renderSimulaciones(); } }
  ];
  botones.forEach(b => document.getElementById(b.id)?.addEventListener("click", b.fn));

  document.querySelectorAll(".btnVolverFinanzas").forEach(btn => btn.addEventListener("click", () => showSection("finanzasMenu")));

  document.getElementById("btnVolverMenuFinanzas")?.addEventListener("click", mostrarMenuPrincipal);
  document.getElementById("form-finanza")?.addEventListener("submit", agregarMovimiento);
}

// ------------------------
// 9️⃣ Inicialización DOM
// ------------------------
document.addEventListener("DOMContentLoaded", () => initBotonesSubmenus());

// 🔟 Exportar funciones públicas
const Finanzas = {
  mostrarFinanzas,
  cargarFinanzas,
  setToken,
  renderReportes,
  renderProyecciones,
  renderSimulaciones,
  initBotonesSubmenus
};