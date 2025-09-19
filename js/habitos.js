// ===================== NOMBRE DEL Habitos.JS =====================
let habitosToken = null; // Token específico de este Habitos

function setToken(token) {
  habitosToken = token;
}

// Función de inicialización del Habitos
function initHabitos() {
  console.log("[Habitos] Inicializando Habitos");

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
