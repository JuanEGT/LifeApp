// ===== CONFIGURACIÓN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com"; // reemplaza
const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU"; // reemplaza
const SHEET_NAME = "Agenda";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Variables globales
let token = null;

// ===== LOGIN CON GIS =====
window.onload = () => {
  google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;
      document.getElementById("eventoForm").style.display = "block";
      cargarEventos();
    }
  });

  document.querySelector(".g_id_signin").addEventListener("click", () => {
    google.accounts.oauth2.requestAccessToken({
      prompt: "consent",
      scope: SCOPES,
      callback: (resp) => {
        token = resp.access_token;
        document.getElementById("eventoForm").style.display = "block";
        cargarEventos();
      }
    });
  });
};

// ===== FUNCIONES =====

// Leer eventos
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

// Mostrar eventos en pantalla
function mostrarEventos(values) {
  if (!values || values.length < 2) return;
  const headers = values[0];
  const rows = values.slice(1);
  const div = document.getElementById("agenda");
  div.innerHTML = "";
  rows.forEach(r => {
    const obj = {};
    headers.forEach((h,i)=> obj[h]=r[i]||"");
    div.innerHTML += `<p>${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})</p>`;
  });
}

// Agregar evento
document.getElementById("eventoForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!token) return;

  const form = e.target;
  const data = {
    Fecha: form.Fecha.value,
    Hora: form.Hora.value,
    Evento: form.Evento.value,
    Notas: form.Notas.value
  };

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [[data.Fecha, data.Hora, data.Evento, data.Notas]] })
    });
    form.reset();
    cargarEventos();
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al agregar evento";
  }
});
