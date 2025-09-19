// ===================== agenda.js =====================

// Token para la hoja de Agenda
let agendaToken = null;

// Función para recibir el token global
function setToken(token) {
  agendaToken = token;
  console.log("[Agenda] Token recibido:", agendaToken);
}

// Función de inicialización del módulo
function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  // Evento para volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Volviendo al Home");
      volverHome(); // Llama a la función central de main.js
    });
  } else {
    console.warn("[Agenda] Botón de volver al Home NO encontrado");
  }
}

// Hacer funciones accesibles globalmente
window.setToken = setToken;
window.initAgenda = initAgenda;
