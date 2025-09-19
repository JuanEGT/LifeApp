// ===================== finanzas.js =====================

// Token para la hoja de Finanzas
let finanzasToken = null; // Token específico de este módulo

// Función para recibir el token global
function setToken(token) {
  finanzasToken = token;
  console.log("[Finanzas] Token recibido:", agendaToken);
}

// Función de inicialización del módulo
function initFinanzas() {
  console.log("[Finanzas] Inicializando módulo");

  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    console.log("[Finanzas] Botón de volver al Home encontrado");
    backBtn.addEventListener("click", () => {
      console.log("[Finanzas] Volviendo al Home");
      volverHome(); // Función global en main.js
    });
  } else {
    console.warn("[Finanzas] Botón de volver al Home NO encontrado");
  }
}

// Exponer funciones al scope global
window.setToken = setToken;
window.initFinanzas = initFinanzas;
