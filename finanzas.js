// ===== finanzas.js =====
const Finanzas = (() => {
  let token = null; // Token de Google Sheets
  let sheetId = "TU_ID_DE_SHEET"; // Reemplaza con tu ID real

  // ===== SET TOKEN =====
  function setToken(t) {
    token = t;
  }

  // ===== MOSTRAR FINANZAS =====
  function mostrarFinanzas() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("agendaContainer").style.display = "none";
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("finanzasContainer").style.display = "flex";
    // Aquí después cargaríamos los datos de la Sheet
  }

  // ===== AGREGAR REGISTRO =====
  async function agregarRegistro(data) {
    if (!token) return;

    // Aquí agregarías código para escribir en Google Sheets
    // data = [Grupo, Tipo, Fecha, Cantidad, Nombre, Método, etc.]
    console.log("Agregar registro:", data);
  }

  return {
    setToken,
    mostrarFinanzas,
    agregarRegistro
  };
})();
