// ===================== Habitos.js =====================

// Token para la hoja de Habitos
let habitosToken = null; // Token específico de este módulo

// Función para recibir el token global
function setToken(token) {
  habitosToken = token;
  console.log("[Habitos] Token recibido:", habitosToken);
}

// Función de inicialización del módulo
function initHabitos() {
  console.log("[Habitos] Inicializando módulo");

  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    console.log("[Habitos] Botón de volver al Home encontrado");
    backBtn.addEventListener("click", () => {
      console.log("[Habitos] Volviendo al Home");
      volverHome(); // Función global en main.js
    });
  } else {
    console.warn("[Habitos] Botón de volver al Home NO encontrado");
  }
}

// Exponer funciones al scope global
window.setToken = setToken;
window.initHabitos = initHabitos;
