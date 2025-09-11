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
      document.getElementById("eventoForm").style.display = "block";
      cargarEventos();
    }
  });

  loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
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

// Mostrar eventos en pantalla por hora
function mostrarEventos(values) {
  if (!values || values.length < 2) return;
  const headers = values[0];
  const rows = values.slice(1);
  const div = document.getElementById("agenda");
  div.innerHTML = "";

  const horas = Array.from({ length: 24 }, (_, i) => i);

  horas.forEach(h => {
    div.innerHTML += `<h3>${String(h).padStart(2,'0')}:00 - ${String(h+1).padStart(2,'0')}:00</h3>`;
    rows.forEach((r, idx) => {
      const obj = {};
      headers.forEach((head, i) => obj[head] = r[i] || "");
      const hr = parseInt(obj.Hora.split(":")[0]);
      if (hr === h) {
        div.innerHTML += `<p>${obj.Hora} - ${obj.Evento} (${obj.Notas}) 
        <button onclick="eliminarEvento('${obj.ID}')">Eliminar</button></p>`;
      }
    });
  });
}

// Agregar evento
document.getElementById("eventoForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!token) return;

  const form = e.target;
  const newID = Date.now().toString(); // ID único
  const data = {
    ID: newID,
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
      body: JSON.stringify({ values: [[data.ID, data.Fecha, data.Hora, data.Evento, data.Notas]] })
    });
    form.reset();
    cargarEventos();
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al agregar evento";
  }
});

// Eliminar evento por ID
async function eliminarEvento(id) {
  if (!token) return;

  // Leer toda la hoja
  const urlGet = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
  try {
    const resp = await fetch(urlGet, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await resp.json();
    const headers = data.values[0];
    const rows = data.values.slice(1);
    let rowIndex = -1;
    rows.forEach((r, i) => {
      if (r[0] === id) rowIndex = i + 2; // +2 porque fila 1 = headers, índice 0
    });

    if (rowIndex > 0) {
      const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`;
      const body = {
        requests: [
          { deleteDimension: { range: { sheetId: 0, dimension: "ROWS", startIndex: rowIndex-1, endIndex: rowIndex } } }
        ]
      };
      await fetch(batchUpdateUrl, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      cargarEventos();
    }

  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al eliminar evento";
  }
}
