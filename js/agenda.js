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

  // Evento para volver al menú principal
  const backBtn = document.getElementById("backToMenuBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Volviendo al menú principal");
      document.getElementById("contenedorPrincipal").innerHTML = "";
      document.getElementById("mainMenu").style.display = "flex";
    });
  }

  // Aquí más lógica futura para Agenda (leer hoja de cálculo, mostrar tareas, etc.)
}

window.setToken = setToken;
window.initAgenda = initAgenda;
