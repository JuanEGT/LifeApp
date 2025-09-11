// ===== CONFIGURACIÓN =====
const SHEET_FINANZAS = "Finanzas"; // nombre de tu hoja de cálculo

// Variables globales compartidas con app.js
// token ya debe estar definido en app.js después del login
// tokenClient también se mantiene desde login

// ===== CARGAR REGISTROS =====
async function cargarFinanzas() {
  if (!token) return;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_FINANZAS}?majorDimension=ROWS`;
  try {
    const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
    const data = await resp.json();
    return data.values || [];
  } catch (err) {
    console.error(err);
    alert("Error al cargar datos de finanzas");
    return [];
  }
}

// ===== MOSTRAR REGISTROS =====
async function mostrarFinanzas() {
  const cont = document.getElementById("finanzasContainer");
  cont.innerHTML = "<h3>Finanzas</h3>";
  const values = await cargarFinanzas();
  if (!values || values.length < 2) return;

  const headers = values[0];
  const rows = values.slice(1);

  // Crear tabla
  const table = document.createElement("table");
  table.className = "tablaFinanzas";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.innerText = h;
    headerRow.appendChild(th);
  });
  const thAccion = document.createElement("th");
  thAccion.innerText = "Acción";
  headerRow.appendChild(thAccion);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  rows.forEach((r, index) => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");

    const tr = document.createElement("tr");
    headers.forEach(h => {
      const td = document.createElement("td");
      td.innerText = obj[h];
      tr.appendChild(td);
    });

    // Botón eliminar
    const tdAccion = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.innerText = "Eliminar";
    delBtn.className = "btn backBtn";
    delBtn.onclick = async () => {
      const fila = index + 2; // fila real en Sheets (1 = headers)
      try {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_FINANZAS}!A${fila}:P?valueInputOption=USER_ENTERED`, {
          method: "PUT",
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [["".repeat(headers.length)]] })
        });
        mostrarFinanzas();
      } catch (err) {
        console.error(err);
        alert("Error al eliminar registro");
      }
    };
    tdAccion.appendChild(delBtn);
    tr.appendChild(tdAccion);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  cont.appendChild(table);

  // Mostrar resumen rápido
  mostrarResumen(values);
}

// ===== RESUMEN RAPIDO =====
function mostrarResumen(values) {
  if (!values || values.length < 2) return;
  const headers = values[0];
  const rows = values.slice(1);

  let ingresos = 0, gastos = 0, ahorros = 0, deudas = 0, inversiones = 0;

  rows.forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");

    const cantidad = parseFloat(obj.Cantidad) || 0;
    const neto = parseFloat(obj["Ingreso neto"]) || cantidad;

    switch(obj.Grupo) {
      case "Movimientos":
        if (obj.Tipo === "Ingreso") ingresos += neto;
        if (obj.Tipo === "Gasto") gastos += cantidad;
        break;
      case "Finanzas Personales":
        if (obj.Tipo === "Ahorro") ahorros += cantidad;
        if (obj.Tipo === "Deuda") deudas += cantidad;
        if (obj.Tipo === "Inversión") inversiones += cantidad;
        break;
    }
  });

  const cont = document.getElementById("finanzasResumen");
  cont.innerHTML = `
    <h4>Resumen rápido</h4>
    <p>Ingresos netos: $${ingresos}</p>
    <p>Gastos: $${gastos}</p>
    <p>Ahorros: $${ahorros}</p>
    <p>Deudas: $${deudas}</p>
    <p>Inversiones: $${inversiones}</p>
    <p>Saldo neto: $${ingresos - gastos}</p>
  `;
}

// ===== AGREGAR REGISTRO =====
document.getElementById("finanzasForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!token) return;

  const form = e.target;
  const id = Date.now();

  const data = [
    id,
    form.Grupo.value,
    form.Tipo.value,
    form.Fecha.value,
    form.Cantidad.value,
    form.Nombre.value,
    form.MetodoPago.value,
    form.SalarioHora.value,
    form.HorasTrabajadas.value,
    form.Propinas.value,
    form.Bonos.value,
    form.Impuestos.value,
    form.IngresoNeto.value,
    form.TasaInteres.value,
    form.TasaCrecimiento.value,
    form.Periodicidad.value
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_FINANZAS}:append?valueInputOption=USER_ENTERED`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [data] })
    });
    form.reset();
    mostrarFinanzas();
  } catch (err) {
    console.error(err);
    alert("Error al agregar registro");
  }
});
