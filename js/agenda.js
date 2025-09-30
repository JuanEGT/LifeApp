// ===================== agenda.js =====================

// Nombre de la hoja de Google Sheets
const SHEET_NAME = "Agenda";

// Token global para acceder a Google Sheets
let agendaToken = null;

// Función para recibir y guardar el token
function setToken(token) {
  agendaToken = token;
  console.log("[Agenda] Token recibido:", agendaToken);
}

async function cargarEventos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    return Array.isArray(data.values) ? data.values : [];
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = "Error al cargar eventos";
    return [];
  }
}

// ===================== UI =====================
// Función para mostrar la agenda (actualmente solo muestra los botones existentes)
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  if (!cont) return;

  // Por ahora, solo mostrar un mensaje para verificar que se cargó la sección
  cont.innerHTML = "<p>Agenda cargada</p>";
}

// Inicializa el módulo de agenda
function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  // 1️⃣ Mostrar la agenda al iniciar
  mostrarAgenda();

  // 2️⃣ Asociar listener al botón de volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Volver al Home clickeado");
      window.volverHome(); // función global de main.js
    });
  } else {
    console.warn("[Agenda] Botón de volver al Home NO encontrado");
  }

  // 3️⃣ Asociar listener al botón de agregar evento
  const agregarBtn = document.getElementById("btnAgregarEvento");
  if (agregarBtn) {
    agregarBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Agregar Evento clickeado");
      const form = document.getElementById("formAgregarEvento");
      if (form) form.style.display = "block"; // mostrar el formulario
    });
  }

  // 4️⃣ Asociar listener al botón de buscar por fecha
  const buscarBtn = document.getElementById("btnBuscarFecha");
  if (buscarBtn) {
    buscarBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Buscar por Fecha clickeado");
      // Aquí podrías abrir un input o filtro por fecha
      const fechaInput = document.getElementById("inputBuscarFecha");
      if (fechaInput) fechaInput.style.display = "block";
    });
  }
}


// ===================== EXPOSICIÓN GLOBAL =====================
window.setToken = setToken;
window.initAgenda = initAgenda;
window.mostrarAgenda = mostrarAgenda;
