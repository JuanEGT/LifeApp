// ===================== salud.js =====================

// Token para la hoja de Finanzas
let saludToken = null; // Token específico de este módulo

// Función para recibir el token global
function setToken(token) {
  saludTokenToken = token;
  console.log("[Salud] Token recibido:", agendaToken);
}

// Función de inicialización del módulo
function initSalud() {
  console.log("[Salud] Inicializando módulo");

  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    console.log("[Salud] Botón de volver al Home encontrado");
    backBtn.addEventListener("click", () => {
      console.log("[Salud] Volviendo al Home");
      volverHome(); // Función global en main.js
    });
  } else {
    console.warn("[Salud] Botón de volver al Home NO encontrado");
  }
}

// Exponer funciones al scope global
window.setToken = setToken;
window.initSalud = initSalud;
