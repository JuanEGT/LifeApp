// finanzas.js
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU"; // reemplaza con tu ID real
let token = null; // token OAuth2

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
  if (!token) {
    console.error("Token OAuth2 no disponible");
    return;
  }

  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Finanzas?majorDimension=ROWS`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!data.values) {
      console.error("No hay datos en la hoja");
      return;
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    const formattedData = rows.map(row => {
      const entry = {};
      headers.forEach((h, i) => entry[h] = row[i] || "");
      return entry;
    });

    renderTablaMovimientos(formattedData);
    renderResumen(formattedData);

  } catch (err) {
    console.error("Error cargando Finanzas:", err);
  }
}

// ------------------------
// 2️⃣ Mostrar sección Finanzas
// ------------------------
async function mostrarFinanzas() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "flex";

  await cargarFinanzas();
}

// ------------------------
// 3️⃣ Renderizar tabla
// ------------------------
function renderTablaMovimientos(data) {
  const tableBody = document.getElementById("finanzas-table-body");
  tableBody.innerHTML = "";

  data.forEach(mov => {
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

  if (!token) {
    console.error("Token OAuth2 no disponible");
    return;
  }

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
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Finanzas:append?valueInputOption=USER_ENTERED`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.updates) {
      cargarFinanzas();
      document.getElementById("form-finanza").reset();
    } else {
      console.error("Error agregando movimiento:", result);
    }

  } catch (err) {
    console.error("Error agregando movimiento:", err);
  }
}

// ------------------------
// 6️⃣ Inicialización
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
  const btnVolverMenuFinanzas = document.getElementById("btnVolverMenuFinanzas");
  if (btnVolverMenuFinanzas) btnVolverMenuFinanzas.addEventListener("click", mostrarMenuPrincipal);

  const formFinanza = document.getElementById("form-finanza");
  if (formFinanza) formFinanza.addEventListener("submit", agregarMovimiento);
});

// ------------------------
// 7️⃣ Exportar funciones públicas
// ------------------------
const Finanzas = {
  mostrarFinanzas,
  cargarFinanzas,
  setToken
};
