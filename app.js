// ===== CONFIGURACIÓN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
const SHEET_NAME = "Agenda";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Variables globales
let token = null;        // Guardará el token de acceso de Google
let tokenClient = null;  // Cliente GIS para solicitar token

// ===== LOGIN CON GIS =====
window.onload = () => {
  // Al inicio mostramos solo el login
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return console.error("No se encontró el botón loginBtn");

  // Inicializamos el cliente de Google Identity Services
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;          // Guardamos token
      mostrarMenuPrincipal();             // Pasamos al menú principal
    }
  });

  // Al hacer click en login, pedimos el token
  loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

// ===== FUNCIONES DE NAVEGACIÓN =====

// Mostrar menú principal
function mostrarMenuPrincipal() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}

// Mostrar vista de Agenda (sub-menú)
function mostrarAgenda() {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "flex";

  // Mostramos sub-menú y ocultamos formularios
  document.getElementById("menuButtons").style.display = "flex";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("fechaSelector").style.display = "none";
  document.getElementById("agenda").innerHTML = "";
  document.getElementById("msg").innerText = "";
}

// Mostrar formulario para agregar evento
function mostrarAgregarEvento() {
  document.getElementById("menuButtons").style.display = "none";
  document.getElementById("eventoForm").style.display = "flex";
  document.getElementById("fechaSelector").style.display = "none";
  document.getElementById("agenda").innerHTML = "";
  document.getElementById("msg").innerText = "";
}

// Mostrar selector de fecha para buscar
function mostrarBuscarFecha() {
  document.getElementById("menuButtons").style.display = "none";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("fechaSelector").style.display = "flex";
  document.getElementById("agenda").innerHTML = "";
  document.getElementById("msg").innerText = "";
}

// Volver al menú principal
function volverAMenu() {
  mostrarMenuPrincipal();
}

// ===== FUNCIONES DE DATOS =====

// Cargar todos los eventos desde Google Sheets
async function cargarEventos() {
  if (!token) return;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
  try {
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await resp.json();
    return data.values;
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al cargar eventos";
    return [];
  }
}

// Mostrar eventos en la pantalla
function mostrarEventos(values) {
  const div = document.getElementById("agenda");
  div.innerHTML = "";
  if (!values || values.length < 2) return;

  const headers = values[0];
  const rows = values.slice(1);

  rows.forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");
    div.innerHTML += `<p>${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})</p>`;
  });

  // Botón de volver al sub-menú
  div.innerHTML += `<button class="btn backBtn" onclick="mostrarAgenda()">Volver a Agenda</button>`;
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
    mostrarAgenda(); // Regresa al sub-menú después de agregar
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al agregar evento";
  }
});

// ===== BUSCAR POR FECHA =====
async function buscarPorFecha() {
  const fecha = document.getElementById("fechaInput").value;
  if (!fecha) return;

  const values = await cargarEventos();
  if (!values || values.length < 2) return;

  const headers = values[0];
  const rows = values.slice(1);

  // Filtrar eventos que coincidan con la fecha
  const filtrados = rows.filter(r => r[0] === fecha);

  const div = document.getElementById("agenda");
  div.innerHTML = "";

  filtrados.forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");
    div.innerHTML += `<p>${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})</p>`;
  });

  // Botón de volver al sub-menú
  div.innerHTML += `<button class="btn backBtn" onclick="mostrarAgenda()">Volver a Agenda</button>`;
}
