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
  const tbody = document.getElementById("tablaFinanzasBody");
  const totalIngresosEl = document.getElementById("totalIngresos");
  const totalGastosEl = document.getElementById("totalGastos");
  const balanceEl = document.getElementById("balance");

  msg.innerText = "Cargando movimientos financieros...";
  const movimientos = await cargarFinanzas();
  msg.innerText = "";

  if (movimientos.length <= 1) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay registros</td></tr>`;
    return;
  }

  // Quitar encabezados
  const filas = movimientos.slice(1);

  // Calcular totales
  let totalIngresos = 0;
  let totalGastos = 0;

  tbody.innerHTML = filas.map(fila => {
    const [id, tipo, fecha, categoria, nombre, cantidad, metodo, notas] = fila;
    const valor = parseFloat(cantidad) || 0;

    if (tipo === "Ingreso") totalIngresos += valor;
    else if (tipo === "Gasto") totalGastos += valor;

    return `
      <tr>
        <td>${fecha}</td>
        <td>${tipo}</td>
        <td>${categoria}</td>
        <td>${nombre}</td>
        <td>${valor.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</td>
        <td>${metodo}</td>
        <td>${notas || ""}</td>
      </tr>
    `;
  }).join("");

  const balance = totalIngresos - totalGastos;
  totalIngresosEl.innerText = totalIngresos.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  totalGastosEl.innerText = totalGastos.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  balanceEl.innerText = balance.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  balanceEl.style.color = balance >= 0 ? "green" : "red";
}


// --------------------- Exponer función al scope global ---------------------
window.initFinanzas = initFinanzas;
