// ===== CONFIGURACIÓN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
const SHEET_NAME = "Agenda";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Variables globales
let token = null;
let tokenClient = null;

// ===== LOGIN Y DOM READY =====
window.onload = () => {
  const loginBtn = document.getElementById("loginBtn");
  const eventoForm = document.getElementById("eventoForm");
  const msg = document.getElementById("msg");

  if (!loginBtn || !eventoForm) {
    console.error("No se encontraron elementos del DOM");
    return;
  }

  // Inicializar Token Client de GIS
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;
      eventoForm.style.display = "block";
      cargarEventos();
    }
  });

  // Botón de login
  loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  });

  // Formulario para agregar evento
  eventoForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!token) return;

    const data = [
      eventoForm.Fecha.value,
      eventoForm.Hora.value,
      eventoForm.Evento.value,
      eventoForm.Notas.value
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
      eventoForm.reset();
      cargarEventos();
    } catch (err) {
      console.error(err);
      msg.innerText = "Error al agregar evento";
    }
  });
};

// ===== FUNCIONES =====

// Leer eventos de la hoja
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

// Mostrar eventos en la pantalla
function mostrarEventos(values) {
  if (!values || values.length < 2) return;
  const headers = values[0];
  const rows = values.slice(1);
  const div = document.getElementById("agenda");
  div.innerHTML = "";
  rows.forEach(r => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = r[i] || "");
    div.innerHTML += `<p>${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})</p>`;
  });
}
  