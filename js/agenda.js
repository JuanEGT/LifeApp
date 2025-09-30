// ===================== agenda.js =====================

// Nombre de la hoja de Google Sheets
const SHEET_NAME = "Agenda";

// Token global para acceder a Google Sheets
let agendaToken = null;

// Variable interna para almacenar los eventos cargados
let eventosCache = [];

// ===================== CONFIG =====================
// Función para recibir y guardar el token
function setToken(token) {
  agendaToken = token;
  console.log("[Agenda] Token recibido:", agendaToken);
}

// ===================== DATOS =====================
// Función para cargar eventos desde Google Sheets
async function cargarEventos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + agendaToken }
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    // Guardar en la variable interna para usar luego
    eventosCache = Array.isArray(data.values) ? data.values : [];
    console.log(`[Agenda] ${eventosCache.length} eventos cargados.`);
    return eventosCache;
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = "Error al cargar eventos";
    eventosCache = [];
    return [];
  }
}

// ===================== UI =====================
// Función para mostrar la agenda (puede actualizarse luego para mostrar eventos)
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");
  if (!cont || !msg) return;

  // Mensaje mientras se carga
  msg.innerText = "Cargando agenda...";
  cont.innerHTML = "";

  // Por simplicidad, aquí no mostramos los eventos,
  // solo confirmamos que la agenda se cargó
  cont.innerHTML = "<p>Agenda lista. Eventos precargados en memoria.</p>";

  msg.innerText = "";
}

// ===================== INICIALIZACIÓN =====================
// Inicializa el módulo de agenda
async function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  // 1️⃣ Cargar los eventos en memoria antes de mostrar la agenda
  await cargarEventos();

  // 2️⃣ Mostrar la agenda (solo mensaje por ahora)
  mostrarAgenda();

  // 3️⃣ Asociar listener al botón de volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Volver al Home clickeado");
      window.volverHome();
    });
  } else {
    console.warn("[Agenda] Botón de volver al Home NO encontrado");
  }

  // 4️⃣ Asociar listener al botón de agregar evento
  const agregarBtn = document.getElementById("btnAgregarEvento");
  if (agregarBtn) {
    agregarBtn.addEventListener("click", () => {
      const form = document.getElementById("formAgregarEvento");
      if (form) form.style.display = "block";
    });
  }

  // 5️⃣ Asociar listener al botón de buscar por fecha
  const buscarBtn = document.getElementById("btnBuscarFecha");
  if (buscarBtn) {
    buscarBtn.addEventListener("click", () => {
      const fechaInput = document.getElementById("inputBuscarFecha");
      if (fechaInput) fechaInput.style.display = "block";
    });
  }
}

// ===================== EXPOSICIÓN GLOBAL =====================
window.setToken = setToken;
window.initAgenda = initAgenda;
window.mostrarAgenda = mostrarAgenda;

// ===================== NOTA =====================
// Ahora todos los eventos se cargan en 'eventosCache' al iniciar.
// Puedes usar esa variable en otras funciones dentro de este módulo
// sin necesidad de mostrar los eventos inmediatamente.
