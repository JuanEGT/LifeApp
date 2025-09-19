// ===================== tar_hab.js =====================
const TarHab = (function () {

  console.log("✅ tar_hab.js cargado"); // se ejecuta apenas carga el archivo

  // Mostrar el módulo
  function mostrarTarHab() {
    console.log("👉 Entró a TarHab.mostrarTarHab()");
    const tarHabContainer = document.getElementById("tarHabContainer");
    const mainMenu = document.getElementById("mainMenu");

    if (tarHabContainer && mainMenu) {
      console.log("✅ Encontrados contenedores:", { tarHabContainer, mainMenu });
      tarHabContainer.style.display = "flex";
      mainMenu.style.display = "none";
    } else {
      console.log("❌ No se encontraron los contenedores");
    }
  }

  // Inicializar botones (intento 1: directo)
  const volverBtns = document.querySelectorAll(".btnVolverTarHab");
  console.log("🔎 Botones .btnVolverTarHab encontrados en carga:", volverBtns);

  volverBtns.forEach((btn) => {
    console.log("➡ Agregando listener a:", btn);
    btn.addEventListener("click", () => {
      console.log("👆 Click en botón Volver Tareas&Hábito");
      document.getElementById("tarHabContainer").style.display = "none";
      document.getElementById("mainMenu").style.display = "flex";
    });
  });

  // También lo reforzamos con delegación por si acaso
  document.addEventListener("click", (ev) => {
    if (ev.target.closest(".btnVolverTarHab")) {
      console.log("👆 Delegación detectó click en botón Volver Tareas&Hábito");
      document.getElementById("tarHabContainer").style.display = "none";
      document.getElementById("mainMenu").style.display = "flex";
    }
  });

  // Retornar funciones públicas
  return {
    mostrarTarHab,
  };
})();
