// ===================== agenda.js =====================

// Hoja de Google Sheets
const SHEET_NAME = "Agenda";

// Token global para Google Sheets
let agendaToken = null;

// ===================== DATOS =====================
/**
 * Setea el token de acceso para Google Sheets
 */
function setToken(token) {
  agendaToken = token;
  console.log("[Agenda] Token recibido:", agendaToken);
}

/**
 * Carga todos los eventos desde la hoja de cálculo
 */
async function cargarEventos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + agendaToken }
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    return Array.isArray(data.values) ? data.values : [];
  } catch (err) {
    console.error("[Agenda] Error al cargar eventos:", err);
    const cont = document.getElementById("agendaContent");
    if (cont) cont.innerHTML = "<p>Error al cargar eventos</p>";
    return [];
  }
}

/**
 * Agrega un evento a la hoja de cálculo
 */
async function agregarEvento(data) {
  if (!Array.isArray(data) || data.length < 5) {
    console.error("[Agenda] Datos inválidos para agregar evento:", data);
    const cont = document.getElementById("agendaContent");
    if (cont) cont.innerHTML = "<p>Error: datos del evento incompletos</p>";
    return false;
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { 
        Authorization: "Bearer " + agendaToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [data] })
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    console.log("[Agenda] Evento agregado correctamente:", data);
    return true;
  } catch (err) {
    console.error("[Agenda] Error al agregar evento:", err);
    const cont = document.getElementById("agendaContent");
    if (cont) cont.innerHTML = "<p>Error al agregar evento</p>";
    return false;
  }
}

/**
 * Elimina un evento según su ID
 */
async function eliminarEvento(id, values) {
  if (!id || !values || !Array.isArray(values) || values.length < 2) {
    console.warn("[Agenda] Datos inválidos para eliminar evento");
    return false;
  }

  const filaIndex = values.findIndex(r => r[0] == id);
  if (filaIndex < 1) return false;

  const fila = filaIndex + 1;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_NAME}!A${fila}:E?valueInputOption=USER_ENTERED`;

  try {
    const resp = await fetch(url, {
      method: "PUT",
      headers: { 
        Authorization: "Bearer " + agendaToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [["", "", "", "", ""]] })
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    console.log("[Agenda] Evento eliminado correctamente:", id);
    return true;
  } catch (err) {
    console.error("[Agenda] Error al eliminar evento:", err);
    const cont = document.getElementById("agendaContent");
    if (cont) cont.innerHTML = "<p>Error al eliminar evento</p>";
    return false;
  }
}

// ===================== UI =====================
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  if (!cont) return;

  cont.innerHTML = ""; // limpiar contenido existente

  // 1️⃣ Cargar los eventos desde Google Sheets
  const values = await cargarEventos();

  // 2️⃣ Mostrar recordatorios y calendario
  mostrarRecordatorios(values);
  mostrarCalendario(values);
}


/**
 * Muestra el calendario mensual con días destacados según eventos
 */
function mostrarCalendario(values) {
  const cont = document.getElementById("agendaContent");
  if (!cont) return;

  const calendarioDiv = document.createElement("div");
  calendarioDiv.className = "agenda-calendario";
  calendarioDiv.innerHTML = "<h3>Calendario mensual</h3>";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const diasMes = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Domingo

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(7, 40px)";
  grid.style.gap = "2px";
  grid.style.textAlign = "center";

  // Encabezado de días
  diasSemana.forEach(dia => {
    const cell = document.createElement("div");
    cell.innerText = dia;
    cell.style.fontWeight = "bold";
    grid.appendChild(cell);
  });

  // Mapear días con eventos
  const eventosPorDia = {};
  if (values && values.length >= 2) {
    const headers = values[0];
    values.slice(1).forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");
      if (!obj.Fecha) return;
      const partes = obj.Fecha.split("-");
      const fechaEvento = new Date(partes[0], partes[1]-1, partes[2]);
      if (fechaEvento.getFullYear() === year && fechaEvento.getMonth() === month) {
        eventosPorDia[fechaEvento.getDate()] = true;
      }
    });
  }

  // Offset inicial
  for (let i = 0; i < firstDayOfWeek; i++) grid.appendChild(document.createElement("div"));

  // Días del mes
  for (let d = 1; d <= diasMes; d++) {
    const cell = document.createElement("div");
    cell.innerText = d;
    cell.className = "dia " + (eventosPorDia[d] ? "rojo" : "verde");
    grid.appendChild(cell);
  }

  calendarioDiv.appendChild(grid);
  cont.appendChild(calendarioDiv);
}

/**
 * Muestra el formulario para agregar un nuevo evento
 */
function mostrarAgregarEvento() {
  const cont = document.getElementById("agendaContent");
  if (!cont) return;

  cont.innerHTML = ""; // limpiar

  const form = document.createElement("form");
  form.id = "eventoForm";
  form.className = "agenda-form";
  form.innerHTML = `
    <label>Fecha: <input type="date" name="Fecha" required></label>
    <label>Hora: <input type="time" name="Hora"></label>
    <label>Evento: <input type="text" name="Evento" required></label>
    <label>Notas: <textarea name="Notas"></textarea></label>
    <button type="submit" class="btn">Agregar Evento</button>
  `;
  cont.appendChild(form);

  const backBtn = document.createElement("button");
  backBtn.className = "btn backBtn";
  backBtn.type = "button";
  backBtn.innerText = "← Volver a Agenda";
  backBtn.style.marginTop = "10px";
  backBtn.onclick = mostrarAgenda;
  cont.appendChild(backBtn);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = [
      Date.now(),
      form.Fecha.value,
      form.Hora.value,
      form.Evento.value,
      form.Notas.value
    ];
    if (await agregarEvento(data)) mostrarAgenda();
  };
}

/**
 * Muestra la interfaz para buscar eventos por fecha
 */
function mostrarBuscarFecha() {
  const cont = document.getElementById("agendaContent");
  if (!cont) return;

  cont.innerHTML = `
    <label>Buscar por fecha: <input type="date" id="fechaInput"></label>
    <button id="btnBuscarPorFecha" class="btn">Buscar</button>
  `;

  const backBtn = document.createElement("button");
  backBtn.className = "btn backBtn";
  backBtn.type = "button";
  backBtn.innerText = "← Volver a Agenda";
  backBtn.style.marginTop = "10px";
  backBtn.onclick = mostrarAgenda;
  cont.appendChild(backBtn);

  document.getElementById("btnBuscarPorFecha").onclick = buscarPorFecha;
}

/**
 * Lógica para buscar eventos por fecha
 */
async function buscarPorFecha() {
  const fecha = document.getElementById("fechaInput").value;
  if (!fecha) return;

  const allValues = await cargarEventos();
  if (!allValues || allValues.length < 2) return;

  const headers = allValues[0];
  const rows = allValues.slice(1).filter(r => r[1] === fecha);

  const div = document.getElementById("agendaContent");
  div.innerHTML = "";

  rows.forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");

    const p = document.createElement("p");
    p.innerHTML = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;

    const delBtn = document.createElement("button");
    delBtn.innerText = "Eliminar";
    delBtn.className = "btn backBtn";
    delBtn.onclick = async () => {
      const id = obj.ID || r[0];
      await eliminarEvento(id, allValues);
      buscarPorFecha();
    };

    p.appendChild(delBtn);
    div.appendChild(p);
  });
}

/**
 * Muestra recordatorios de los próximos 7 días
 */
function mostrarRecordatorios(values) {
  const cont = document.getElementById("recordatorios");
  if (!cont) return;

  cont.innerHTML = "<h3>Próximos eventos</h3>";
  if (!values || values.length < 2) return;

  const headers = values[0];
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const sieteDias = new Date(hoy);
  sieteDias.setDate(hoy.getDate() + 7);

  values.slice(1).forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i] || "");
    if (!obj.Fecha) return;

    const partes = obj.Fecha.split("-");
    const fechaEvento = new Date(partes[0], partes[1]-1, partes[2]);

    if (fechaEvento >= hoy && fechaEvento <= sieteDias) {
      const divEvt = document.createElement("div");
      divEvt.className = "recordatorioItem";
      divEvt.innerHTML = `
        <strong>Fecha:</strong> ${obj.Fecha}<br>
        <strong>Hora:</strong> ${obj.Hora || "No definida"}<br>
        <strong>Evento:</strong> ${obj.Evento || "Sin nombre"}<br>
        <strong>Notas:</strong> ${obj.Notas || "Sin notas"}
      `;
      cont.appendChild(divEvt);
    }
  });
}

function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  mostrarAgenda();

  // Asociar listener al botón que ya existe en el HTML
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Volver al Home clickeado");
      window.volverHome(); // función global de main.js
    });
  } else {
    console.warn("[Agenda] Botón de volver al Home NO encontrado");
  }

}

// ===================== EXPOSICIÓN GLOBAL =====================
window.setToken = setToken;
window.initAgenda = initAgenda;
window.mostrarAgenda = mostrarAgenda;
window.mostrarAgregarEvento = mostrarAgregarEvento;
window.mostrarBuscarFecha = mostrarBuscarFecha;
