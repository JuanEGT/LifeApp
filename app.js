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
      mostrarMenuPrincipal();
    }
  });

  loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  });

  // Asociar formulario de agregar evento
  const form = document.getElementById("eventoForm");
  if (form) form.addEventListener("submit", agregarEvento);
};

// ===== FUNCIONES DE NAVEGACIÓN =====
function ocultarTodos() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("menuButtons").style.display = "none";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("fechaSelector").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("msg").innerText = "";
}

function mostrarMenuPrincipal() {
  ocultarTodos();
  document.getElementById("mainMenu").style.display = "block";
}

function mostrarAgenda() {
  ocultarTodos();
  document.getElementById("agendaContainer").style.display = "block";
  document.getElementById("menuButtons").style.display = "block";
  cargarEventos();
}

function mostrarAgregarEvento() {
  ocultarTodos();
  document.getElementById("eventoForm").style.display = "block";
  document.getElementById("agendaContainer").style.display = "block";
}

function mostrarBuscarFecha() {
  ocultarTodos();
  document.getElementById("fechaSelector").style.display = "block";
  document.getElementById("agendaContainer").style.display = "block";
}

function volverAMenu() {
  mostrarMenuPrincipal();
}

// ===== FUNCIONES DE AGENDA =====
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
    mostrarAgenda();
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al agregar evento";
  }
}

async function eliminarEvento(id) {
  if (!token) return;

  const urlGet = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
  const resp = await fetch(urlGet, { headers: { Authorization: "Bearer " + token } });
  const data = await resp.json();

  if (!data.values || data.values.length < 2) return;

  const headers = data.values[0];
  const rows = data.values.slice(1);
  let rowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] == id) {
      rowIndex = i + 2;
      break;
    }
  }

  if (rowIndex === -1) return;

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

// ===== BUSCAR POR FECHA =====
function buscarPorFecha() {
  const fecha = document.getElementById("fechaInput").value;
  cargarEventos(fecha);
  mostrarAgenda();
}
