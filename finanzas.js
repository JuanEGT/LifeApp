// finanzas.js

const SPREADSHEET_ID = "TU_SPREADSHEET_ID"; // reemplaza con tu ID real
const SHEET_NAME = "Finanzas";
let finanzasData = []; // todos los movimientos cargados

// ------------------------
// 0️⃣ Set token desde app.js
// ------------------------
function setToken(newToken) {
  token = newToken;
}

// ------------------------
// 1️⃣ Cargar datos de Finanzas
// ------------------------
async function cargarFinanzas() {
  if (!token) return;

  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.values) {
      console.error("No hay datos en la hoja");
      return;
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    finanzasData = rows.map(row => {
      const entry = {};
      headers.forEach((h, i) => entry[h] = row[i] || "");
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
    const fecha = new Date(mov.Fecha);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });
}

// ------------------------
// 3️⃣ Renderizar tabla
// ------------------------
function renderTablaMovimientos() {
  const tableBody = document.getElementById("finanzas-table-body");
  tableBody.innerHTML = "";

  const selector = document.getElementById("selectorMes");
  let fechaSeleccionada = selector.value ? new Date(selector.value + "-01") : new Date();
  const mes = fechaSeleccionada.getMonth();
  const anio = fechaSeleccionada.getFullYear();

  const filteredData = filtrarPorMes(finanzasData, mes, anio);

  filteredData.forEach(mov => {
    const tr = document.createElement("tr");
    const color = mov.Tipo === "Ingreso" ? "text-green-400" :
                  mov.Tipo === "Gasto" ? "text-red-400" : "text-gray-300";

    tr.innerHTML = `
      <td>${mov.Fecha}</td>
      <td>${mov.Tipo}</td>
      <td>${mov.Cantidad}</td>
      <td>${mov.Nombre}</td>
      <td>${mov.MetodoPago}</td>
    `;
    tr.classList.add(color);
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
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

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
// 6️⃣ Mostrar sección Finanzas
// ------------------------
async function mostrarFinanzas() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "flex";

  // Inicializar selector de mes al mes actual
  const selector = document.getElementById("selectorMes");
  const hoy = new Date();
  selector.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2,'0')}`;

  selector.addEventListener("change", renderTablaMovimientos);

  await cargarFinanzas();
}

// ------------------------
// 7️⃣ Inicialización
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
  const btnVolverMenuFinanzas = document.getElementById("btnVolverMenuFinanzas");
  if (btnVolverMenuFinanzas) btnVolverMenuFinanzas.addEventListener("click", mostrarMenuPrincipal);

  const formFinanza = document.getElementById("form-finanza");
  if (formFinanza) formFinanza.addEventListener("submit", agregarMovimiento);
});

// ------------------------
// 8️⃣ Exportar funciones públicas
// ------------------------
const Finanzas = {
  mostrarFinanzas,
  cargarFinanzas,
  setToken
};
