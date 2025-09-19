// ===================== Notas.js =====================

// Token para la hoja de Notas
let notasToken = null; // Token específico de este módulo

// Función para recibir el token global
function setToken(token) {
  notasToken = token;
  console.log("[Notas] Token recibido:", notasToken);
}

// Función de inicialización del módulo
function initNotas() {
  console.log("[Notas] Inicializando módulo");

  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    console.log("[Notas] Botón de volver al Home encontrado");
    backBtn.addEventListener("click", () => {
      console.log("[Notas] Volviendo al Home");
      volverHome(); // Función global en main.js
    });
  } else {
    console.warn("[Notas] Botón de volver al Home NO encontrado");
  }
}

// Exponer funciones al scope global
window.setToken = setToken;
window.initNotas = initNotas;
