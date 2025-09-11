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
      document.getElementById("mainMenu").style.display = "flex";
      document.getElementById("loginContainer").style.display = "none";
    }
  });

  loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

// ===== FUNCIONES DE NAVEGACIÓN =====
function mostrarAgenda() {
  document.getElementById("agendaContainer").style.display = "flex";
  document.getElementById("menuButtons").style.display = "flex";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("fechaSelector").style.display = "none";
  cargarEventos();
}

function mostrarAgregarEvento() {
  document.getElementById("eventoForm").style.display = "flex";
  document.getElementById("fechaSelector").style.display = "none";
}

function mostrarBuscarFecha() {
  document.getElementById("fechaSelector").style.display = "flex";
  document.getElementById("eventoForm").style.display = "none";
}

function volverAMenu() {
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}

// ===== FUNCIONES DE AGENDA =====
async function cargarEventos() {
  if (!token) return;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
  try {
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await resp.json();
    mostrarEventos(data.values);
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al cargar eventos";
  }
}

function mostrarEventos(values) {
  if (!values || values.length < 2) return;
  const headers = values[0];
  const rows = values.slice(1);
  const div = document.getElementById("agenda");
  div.innerHTML = "";
  rows.forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");
    div.innerHTML += `<p>${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})</p>`;
  });
}

// ===== AGREGAR EVENTO =====
document.getElementById("eventoForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!token) return;

  const form = e.target;
  const data = [
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
});

// ===== BUSCAR POR FECHA =====
function buscarPorFecha() {
  const fecha = document.getElementById("fechaInput").value;
  if (!fecha) return;
  if (!token) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;

  fetch(url, { headers: { Authorization: "Bearer " + token } })
    .then(resp => resp.json())
    .then(data => {
      if (!data.values || data.values.length < 2) return;
      const headers = data.values[0];
      const rows = data.values.slice(1).filter(r => r[0] === fecha); // Filtra por Fecha
      mostrarEventos([headers, ...rows]);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("msg").innerText = "Error al buscar por fecha";
    });
}