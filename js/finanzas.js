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
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? "block" : "none";
  });
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
  const totalIngresosEl = document.getElementById("total-ingresos");
  const totalGastosEl = document.getElementById("total-gastos");
  const saldoEl = document.getElementById("saldo");
  if (totalIngresosEl) totalIngresosEl.textContent = totalIngresos;
  if (totalGastosEl) totalGastosEl.textContent = totalGastos;
  if (saldoEl) saldoEl.textContent = saldo;
}

// ------------------------
// 4️⃣ Agregar movimiento
// ------------------------
function crearPayloadFormulario() {
  const grupoEl = document.getElementById("grupo");
  const tipoEl = document.getElementById("tipo");
  const fechaEl = document.getElementById("fecha");
  const cantidadEl = document.getElementById("cantidad");
  const nombreEl = document.getElementById("nombre");
  const metodoPagoEl = document.getElementById("metodoPago");
  return {
    values: [[
      Date.now().toString(),
      grupoEl?.value || "",
      tipoEl?.value || "",
      fechaEl?.value || "",
      cantidadEl?.value || "",
      nombreEl?.value || "",
      metodoPagoEl?.value || "",
      "", "", "", "", "",
      cantidadEl?.value || "",
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
      document.getElementById("form-finanza")?.reset();
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

function renderReportes() {
  const datos = obtenerDatosReportes();
  if (!datos) return;

  // Ingresos vs Gastos
  renderChart("graficoIngresosGastos", {
    type: "bar",
    data: { 
      labels: ["Mes seleccionado"], 
      datasets: [
        { label: "Ingresos Netos", data: [datos.totalIngresosNetos], backgroundColor: "#4caf50" }, 
        { label: "Gastos", data: [datos.totalGastos], backgroundColor: "#f44336" }
      ] 
    }
  });

  // Distribución por grupo
  renderChart("graficoDistribucionGrupo", { 
    type: "pie", 
    data: { labels: datos.grupos, datasets: [{ data: datos.distribucionGrupo, backgroundColor: ["#4caf50","#f44336","#2196f3","#ff9800","#9c27b0"] }] } 
  });

  // Saldo anual (verificación de función calcularSaldosMensuales)
  const anio = parseInt(document.getElementById("anioReporte")?.value, 10) || new Date().getFullYear();
  if (typeof calcularSaldosMensuales === "function") {
    renderChart("graficoSaldoMensual", { 
      type: "line", 
      data: { 
        labels: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"], 
        datasets: [{
          label: `Saldo ${anio}`, 
          data: calcularSaldosMensuales(anio), 
          borderColor: "#ffeb3b", 
          backgroundColor: "rgba(255,235,59,0.3)", 
          fill: true, 
          tension: 0.3 
        }] 
      }, 
      options: { responsive: true, plugins: { legend: { position: "top" } } } 
    });
  }

  // Métodos de pago
  renderChart("graficoMetodosPago", { 
    type: "bar", 
    data: { labels: datos.metodosPago, datasets: [{ label: "Uso", data: datos.usoMetodosPago, backgroundColor: "#2196f3" }] }, 
    options: { indexAxis: 'y' } 
  });

  // Horas y salario promedio
  renderChart("graficoHorasSalario", { 
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

// ------------------------ 
// 6️⃣ Proyecciones
// ------------------------
let chartProyeccionInversion, chartProyeccionDeuda;

function calcularProyecciones() {
  const anioInicio = parseInt(document.getElementById("anioInicioProyecciones")?.value, 10) || new Date().getFullYear();
  const horizonte = Math.min(parseInt(document.getElementById("horizonteProyecciones")?.value, 10), 5);
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1; // 1-12

  // Generar arrays de meses y etiquetas
  const meses = [];
  const fechas = [];
  for (let i = 0; i < horizonte * 12; i++) {
    let mes = (mesActual + i - 1) % 12 + 1;
    let anio = anioInicio + Math.floor((mesActual + i - 1) / 12);
    meses.push(`${anio}-${String(mes).padStart(2, "0")}`);
    fechas.push(`${String(mes).padStart(2, "0")}/${anio}`);
  }

  // Filtrar datos históricos
  const inversionesData = finanzasData.filter(d => d.Tipo === "Inversión");
  const deudasData = finanzasData.filter(d => d.Tipo === "Deuda");

  // Calcular iniciales
  const inversionInicial = inversionesData.reduce((acc, d) => acc + (parseFloat(d.Cantidad) || 0), 0);
  const deudaInicial = deudasData.reduce((acc, d) => acc + (parseFloat(d.Cantidad) || 0), 0);

  // Función general de proyección
  const proyectar = (datos, meses, tipo) => {
    const saldoMensual = Array(meses.length).fill(0);

    datos.forEach(d => {
      const cantidad = parseFloat(d.Cantidad) || 0;
      const tasa = tipo === "Inversión" ? parseFloat(d.TasaCrecimiento) || 0 : parseFloat(d.TasaInteres) || 0;
      const periodicidad = d.Periodicidad || "Mensual";
      const tasaMensual = periodicidad === "Anual" ? Math.pow(1 + tasa, 1 / 12) - 1 : tasa;

      // Encontrar índice del mes de inicio
      const inicio = meses.findIndex(m => m >= d.Fecha);
      if (inicio === -1) return;

      let saldo = 0;
      for (let i = inicio; i < meses.length; i++) {
        saldo = (i === inicio ? cantidad : saldo) * (1 + tasaMensual);
        saldoMensual[i] += parseFloat(saldo.toFixed(2));
      }
    });

    return saldoMensual;
  };

  // Proyecciones
  const saldoInversion = proyectar(inversionesData, meses, "Inversión");
  const saldoDeuda = proyectar(deudasData, meses, "Deuda");

  // Mostrar textos inicial/final
  const divInversion = document.getElementById("resumenInversion");
  if (divInversion) {
    divInversion.innerHTML = `
      Inversión inicial: <span style="color:white;">$${inversionInicial.toFixed(2)}</span><br>
      Inversión final: <span style="color:green;">$${saldoInversion[saldoInversion.length - 1].toFixed(2)}</span>
    `;
  }

  const divDeuda = document.getElementById("resumenDeuda");
  if (divDeuda) {
    divDeuda.innerHTML = `
      Deuda inicial: <span style="color:white;">$${deudaInicial.toFixed(2)}</span><br>
      Deuda final: <span style="color:red;">$${saldoDeuda[saldoDeuda.length - 1].toFixed(2)}</span>
    `;
  }

  // Graficar Inversiones
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

  // Graficar Deudas
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

function renderSimulaciones() {
  console.log("Renderizando Simulaciones (vacío)");
}
// ------------------------
// 7️⃣ Mostrar sección principal
// ------------------------
async function mostrarFinanzas() {
  ["loginContainer", "mainMenu", "agendaContainer"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const finanzasContainer = document.getElementById("finanzasContainer");
  if (finanzasContainer) finanzasContainer.style.display = "flex";

  showSection("finanzasMenu");
  await cargarFinanzas();

  const selector = document.getElementById("selectorMes");
  if (selector) {
    const hoy = new Date();
    selector.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    selector.addEventListener("change", renderTablaMovimientos);
  }

  const selectorMes = document.getElementById("mesReporte");
  const selectorAnio = document.getElementById("anioReporte");
  if (selectorMes && selectorAnio) {
    const hoy = new Date();
    selectorMes.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
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

  botones.forEach(b => {
    const el = document.getElementById(b.id);
    if (el) el.addEventListener("click", b.fn);
  });

  document.querySelectorAll(".btnVolverFinanzas").forEach(btn => {
    btn.addEventListener("click", () => showSection("finanzasMenu"));
  });

  const btnVolverMenu = document.getElementById("btnVolverMenuFinanzas");
  if (btnVolverMenu) btnVolverMenu.addEventListener("click", mostrarMenuPrincipal);

  const formFinanza = document.getElementById("form-finanza");
  if (formFinanza) formFinanza.addEventListener("submit", agregarMovimiento);
}

// ------------------------
// 9️⃣ Inicialización DOM
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
  initBotonesSubmenus();
});

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
