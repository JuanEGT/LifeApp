// ===================== tar_hab.js =====================
const TarHab = (function () {
  // Mostrar el módulo
  function mostrarTarHab() {
    document.getElementById("tarHabContainer").style.display = "flex";
    document.getElementById("mainMenu").style.display = "none";
  }

  // Inicializar botones solo cuando DOM esté listo
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".btnVolverTarHab")?.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("tarHabContainer").style.display = "none";
        document.getElementById("mainMenu").style.display = "flex";
      });
    });
  });

  // Retornar funciones públicas
  return {
    mostrarTarHab,
  };
})();
