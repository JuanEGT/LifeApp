// ===================== NOMBRE DEL notas.JS =====================
let notasToken = null; // Token específico de este notas

function setToken(token) {
  notasToken = token;
}

// Función de inicialización del notas
function initnotas() {
  console.log("[notas] Inicializando notas");

  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    console.log("[notas] Botón de volver al Home encontrado");
    backBtn.addEventListener("click", () => {
      console.log("[notas] Volviendo al Home");
      volverHome(); // Función global en main.js
    });
  } else {
    console.warn("[notas] Botón de volver al Home NO encontrado");
  }
}

// Exponer funciones al scope global
window.setToken = setToken;
window.initnotas = initnotas;
