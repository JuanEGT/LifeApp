// ===================== NOMBRE DEL salud.JS =====================
let saludToken = null; // Token específico de este salud

function setToken(token) {
  saludToken = token;
}

// Función de inicialización del salud
function initsalud() {
  console.log("[salud] Inicializando salud");

  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    console.log("[salud] Botón de volver al Home encontrado");
    backBtn.addEventListener("click", () => {
      console.log("[salud] Volviendo al Home");
      volverHome(); // Función global en main.js
    });
  } else {
    console.warn("[salud] Botón de volver al Home NO encontrado");
  }
}

// Exponer funciones al scope global
window.setToken = setToken;
window.initsalud = initsalud;
