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

  // Actualizar barra y calendario
  cargarEventos().then(values => {
    mostrarRecordatorios(values);
    mostrarCalendario(values);
  });
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
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [["", "", "", "", ""]] })
        });

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
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
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
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
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

// ===== NUEVAS FUNCIONES: RECORDATORIOS Y CALENDARIO =====

// Barra de recordatorios próximos 7 días
function mostrarRecordatorios(values) {
  const cont = document.getElementById("recordatorios");
  cont.innerHTML = "<h3>Próximos eventos</h3>";
  if (!values || values.length < 2) return;

  const headers = values[0];
  const rows = values.slice(1);

  const hoy = new Date();
  const sieteDias = new Date();
  sieteDias.setDate(hoy.getDate() + 7);

  rows.forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");

    const fechaEvento = new Date(obj.Fecha);
    if (fechaEvento >= hoy && fechaEvento <= sieteDias) {
      const divEvt = document.createElement("div");
      divEvt.className = "recordatorioItem";
      divEvt.innerText = `${obj.Fecha} - ${obj.Evento}`;

      // Tooltip personalizado
      const tooltip = document.createElement("span");
      tooltip.className = "tooltip";
      tooltip.innerText = `Hora: ${obj.Hora || "No definida"}\nNotas: ${obj.Notas || "Sin notas"}`;

      divEvt.appendChild(tooltip);
      cont.appendChild(divEvt);
    }
  });
}



// Calendario mensual visual (solo colores)
function mostrarCalendario(values) {
  const cont = document.getElementById("calendario");
  cont.innerHTML = "<h3>Calendario mensual</h3>";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Crear matriz de días del mes
  const diasMes = new Date(year, month + 1, 0).getDate();
  const rows = [];
  for (let i=1; i<=diasMes; i++) rows.push(i);

  const eventosPorDia = {};
  if (values && values.length >= 2) {
    const headers = values[0];
    const dataRows = values.slice(1);
    dataRows.forEach(r => {
      const obj = {};
      headers.forEach((h,i)=> obj[h] = r[i]||"");
      const d = new Date(obj.Fecha).getDate();
      eventosPorDia[d] = true;
    });
  }

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(7, 30px)";
  grid.style.gap = "2px";

  rows.forEach(d => {
    const cell = document.createElement("div");
    cell.style.width = "30px";
    cell.style.height = "30px";
    cell.style.display = "flex";
    cell.style.alignItems = "center";
    cell.style.justifyContent = "center";
    cell.style.backgroundColor = eventosPorDia[d] ? "red" : "green";
    cell.style.color = "#fff";
    cell.innerText = d;
    grid.appendChild(cell);
  });

  cont.appendChild(grid);
}
