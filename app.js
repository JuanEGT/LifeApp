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
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return console.error("No se encontró el botón loginBtn");

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
};

// ===== FUNCIONES DE NAVEGACIÓN =====
function mostrarMenuPrincipal() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}

function mostrarAgenda() {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "flex";

  document.getElementById("menuButtons").style.display = "flex";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("fechaSelector").style.display = "none";
  document.getElementById("agenda").innerHTML = "";
  document.getElementById("msg").innerText = "";
}

function mostrarAgregarEvento() {
  document.getElementById("menuButtons").style.display = "none";
  document.getElementById("eventoForm").style.display = "flex";
  document.getElementById("fechaSelector").style.display = "none";
  document.getElementById("agenda").innerHTML = "";
  document.getElementById("msg").innerText = "";

  if (!document.getElementById("backToAgendaFromAdd")) {
    const backBtn = document.createElement("button");
    backBtn.id = "backToAgendaFromAdd";
    backBtn.innerText = "Volver a Agenda";
    backBtn.className = "btn backBtn";
    backBtn.onclick = mostrarAgenda;
    document.getElementById("eventoForm").appendChild(backBtn);
  }
}

function mostrarBuscarFecha() {
  document.getElementById("menuButtons").style.display = "none";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("fechaSelector").style.display = "flex";
  document.getElementById("agenda").innerHTML = "";
  document.getElementById("msg").innerText = "";
}

function volverAMenu() {
  mostrarMenuPrincipal();
}

// ===== FUNCIONES DE DATOS =====
async function cargarEventos() {
  if (!token) return;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
  try {
    const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
    const data = await resp.json();
    return data.values;
  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Error al cargar eventos";
    return [];
  }
}

// ===== MOSTRAR EVENTOS =====
function mostrarEventos(values) {
  const div = document.getElementById("agenda");
  div.innerHTML = "";
  if (!values || values.length < 2) return;

  const headers = values[0];
  const rows = values.slice(1);

  rows.forEach((r) => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");

    const p = document.createElement("p");
    p.innerHTML = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;

    // Botón eliminar por ID
    const delBtn = document.createElement("button");
    delBtn.innerText = "Eliminar";
    delBtn.className = "btn backBtn";
    delBtn.onclick = async () => {
      try {
        const filaIndex = values.findIndex(row => row[0] == obj.ID);
        if (filaIndex < 1) return;

        const fila = filaIndex + 1;
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${fila}:E?valueInputOption=USER_ENTERED`, {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ values: [["", "", "", "", ""]] })
        });

        // Refrescar la lista completa
        const allValues = await cargarEventos();
        mostrarEventos(allValues);
      } catch (err) {
        console.error(err);
        document.getElementById("msg").innerText = "Error al eliminar evento";
      }
    };

    p.appendChild(delBtn);
    div.appendChild(p);
  });

  div.innerHTML += `<button class="btn backBtn" onclick="mostrarAgenda()">Volver a Agenda</button>`;
}

// ===== AGREGAR EVENTO =====
document.getElementById("eventoForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!token) return;

  const form = e.target;
  const id = Date.now();

  const data = [
    id,
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
});

// ===== BUSCAR POR FECHA =====
async function buscarPorFecha() {
  const fecha = document.getElementById("fechaInput").value;
  if (!fecha) return;

  const values = await cargarEventos();
  if (!values || values.length < 2) return;

  const headers = values[0];
  const rows = values.slice(1);
  const filtrados = rows.filter(r => r[1] === fecha);

  const div = document.getElementById("agenda");
  div.innerHTML = "";

  filtrados.forEach((r) => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");

    const p = document.createElement("p");
    p.innerHTML = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;

    // Botón eliminar por ID
    const delBtn = document.createElement("button");
    delBtn.innerText = "Eliminar";
    delBtn.className = "btn backBtn";
    delBtn.onclick = async () => {
      try {
        const filaIndex = values.findIndex(row => row[0] == obj.ID);
        if (filaIndex < 1) return;

        const fila = filaIndex + 1;
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${fila}:E?valueInputOption=USER_ENTERED`, {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ values: [["", "", "", "", ""]] })
        });

        buscarPorFecha();
      } catch (err) {
        console.error(err);
        document.getElementById("msg").innerText = "Error al eliminar evento";
      }
    };

    p.appendChild(delBtn);
    div.appendChild(p);
  });

  if (!document.getElementById("backToAgendaFromSearch")) {
    const backBtn = document.createElement("button");
    backBtn.id = "backToAgendaFromSearch";
    backBtn.innerText = "Volver a Agenda";
    backBtn.className = "btn backBtn";
    backBtn.onclick = mostrarAgenda;
    div.appendChild(backBtn);
  }
}
