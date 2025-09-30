// ===================== agenda.js =====================

// Nombre de la hoja de Google Sheets
const SHEET_NAME = "Agenda";

// Variable interna para almacenar los eventos cargados
let eventosCache = [];

// ===================== DATOS =====================
// Función para cargar eventos desde Google Sheets usando el token global 'token'
async function cargarEventos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token } // token global de config.js
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    // Guardar en la variable interna para usar luego
    eventosCache = Array.isArray(data.values) ? data.values : [];
    console.log(`[Agenda] ${eventosCache.length} eventos cargados.`);
    return eventosCache;
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = "Error al cargar eventos";
    eventosCache = [];
    return [];
  }
}

// Función para agregar un evento a Google Sheets
async function agregarEvento(data) {
  if (!Array.isArray(data) || data.length < 5) {
    console.error("Datos inválidos para agregar evento:", data);
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = "Error: datos del evento incompletos";
    return false;
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token, // token global de config.js
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [data] })
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    return true;
  } catch (err) {
    console.error("Error al agregar evento:", err);
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = "Error al agregar evento";
    return false;
  }
}

// ===================== UI =====================
// Función para mostrar la agenda (solo mensaje por ahora)
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");
  if (!cont || !msg) return;

  msg.innerText = "Cargando agenda...";
  cont.innerHTML = "<p>Agenda lista. Eventos precargados en memoria.</p>";
  msg.innerText = "";
}

// Función modular para iniciar el flujo de agregar evento
function iniciarAgregarEvento() {
  const form = document.getElementById("formAgregarEvento");
  if (!form) return;

  // Mostrar formulario
  form.style.display = "block";

  // Botón cancelar
  const btnCancelar = document.getElementById("btnCancelarEvento");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      form.style.display = "none";
      form.reset();
    });
  }

  // Manejar submit del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fecha = document.getElementById("inputFecha").value;
    const hora = document.getElementById("inputHora").value;
    const evento = document.getElementById("inputEvento").value;
    const notas = document.getElementById("inputNotas").value;
    const id = Date.now().toString(); // ID único

    const data = [id, fecha, hora, evento, notas];

    const exito = await agregarEvento(data);
    if (exito) {
      console.log("[Agenda] Evento agregado correctamente");
      form.reset();
      form.style.display = "none";
      await cargarEventos(); // recargar eventos en memoria
      mostrarAgenda();      // opcional actualizar vista
    }
  }, { once: true }); // "once" evita múltiples listeners
}

// ===================== INICIALIZACIÓN =====================
async function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  // Cargar eventos en memoria usando el token global
  await cargarEventos();

  // Mostrar la agenda
  mostrarAgenda();

  // Botón volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => window.volverHome());
  }

  // Botón agregar evento → llama a la función modular
  const agregarBtn = document.getElementById("btnAgregarEvento");
  if (agregarBtn) {
    agregarBtn.addEventListener("click", iniciarAgregarEvento);
  }

  // Botón buscar por fecha (solo mostrar input)
  const buscarBtn = document.getElementById("btnBuscarFecha");
  if (buscarBtn) {
    buscarBtn.addEventListener("click", () => {
      const fechaInput = document.getElementById("inputBuscarFecha");
      if (fechaInput) fechaInput.style.display = "block";
    });
  }
}

// ===================== EXPOSICIÓN GLOBAL =====================
window.initAgenda = initAgenda;
window.mostrarAgenda = mostrarAgenda;

// ===================== NOTA =====================
// Ahora usamos el token global de config.js directamente.
// Eventos se cargan en 'eventosCache' al iniciar.
// El flujo de agregar evento está encapsulado en 'iniciarAgregarEvento'.
