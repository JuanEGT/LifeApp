// ===================== agenda.js =====================

// Hoja de Google Sheets
const SHEET_NAME = "Agenda";

// Token global para Google Sheets
let agendaToken = null;

function setToken(token) {
  agendaToken = token;
  console.log("[Agenda] Token recibido:", agendaToken);
}

// ===================== UI =====================
async function mostrarAgenda() {
  document.getElementById("agendaContent");
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
