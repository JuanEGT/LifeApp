// ===== CONFIGURACIÓN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
const SHEET_NAME = "Agenda";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Variables globales
let token = null;
let tokenClient = null;

// ===== LOGIN CON GIS =====
window.onload = () => {
  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) {
    console.error("No se encontró el botón loginBtn");
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;
      document.getElementById("mainMenu").style.display = "block"; // Mostrar menú principal
    }
  });

  loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

// ===== FUNCIONES =====

// Mostrar agenda por fecha
async function cargarEventos(fechaSeleccionada = null) {
  if (!token) return;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
  try {
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await resp.json();
    mostrarEventos(data.values, fechaSeleccionada);
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al cargar eventos";
  }
}

// Mostrar eventos en pantalla
function mostrarEventos(values, fechaSeleccionada = null) {
  if (!values || values.length < 2) return;
  const headers = values[0];
  const rows = values.slice(1);
  const div = document.getElementById("agenda");
  div.innerHTML = "";

  rows.forEach(r => {
    const obj = {};
    headers.forEach((h,i)=> obj[h]=r[i]||"");
    if (!fechaSeleccionada || obj.Fecha === fechaSeleccionada) {
      div.innerHTML += `<p>
        ${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})
        <button onclick="eliminarEvento(${obj.ID})">Eliminar</button>
      </p>`;
    }
  });
}

// Agregar evento
async function agregarEvento(event) {
  event.preventDefault();
  if (!token) return;

  const form = event.target;
  const data = [
    Date.now(), // ID único
    form.Fecha.value,
    form.Hora.value,
    form.Evento.value,
    form.Notas.value
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [data] })
    });
    form.reset();
    cargarEventos();
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al agregar evento";
  }
}

// Eliminar evento por ID
async function eliminarEvento(id) {
  if (!token) return;

  // Leer todos los datos
  const urlGet = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
  const resp = await fetch(urlGet, { headers: { Authorization: "Bearer " + token } });
  const data = await resp.json();

  if (!data.values || data.values.length < 2) return;

  const headers = data.values[0];
  const rows = data.values.slice(1);
  let rowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] == id) {
      rowIndex = i + 2; // +2 porque Sheets indexa desde 1 y la primera fila son headers
      break;
    }
  }

  if (rowIndex === -1) return;

  // Eliminar fila
  const urlDelete = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`;
  await fetch(urlDelete, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requests: [
        { deleteDimension: { range: { sheetId: 0, dimension: "ROWS", startIndex: rowIndex-1, endIndex: rowIndex } } }
      ]
    })
  });

  cargarEventos();
}

// ===== EVENTOS DEL DOM =====
window.showAgenda = () => {
  document.getElementById("menuButtons").style.display = "block";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("agendaContainer").style.display = "block";
};

window.showAgregarEvento = () => {
  document.getElementById("eventoForm").style.display = "block";
  document.getElementById("menuButtons").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
};

window.showBuscarFecha = () => {
  document.getElementById("fechaSelector").style.display = "block";
  document.getElementById("menuButtons").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
};

window.buscarPorFecha = () => {
  const fecha = document.getElementById("fechaInput").value;
  cargarEventos(fecha);
  document.getElementById("fechaSelector").style.display = "none";
  document.getElementById("agendaContainer").style.display = "block";
};

// Formulario agregar evento
document.getElementById("eventoForm").addEventListener("submit", agregarEvento);
