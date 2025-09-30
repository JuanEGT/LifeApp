// ===================== agenda.js =====================

// Nombre de la hoja de Google Sheets
const SHEET_NAME = "Agenda";

// Variable interna para almacenar los eventos cargados
let eventosCache = [];

// ===================== DATOS =====================
// Cargar eventos desde Google Sheets usando token global
async function cargarEventos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
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

// ===================== UI =====================
// Mostrar agenda (solo mensaje por ahora)
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");
  if (!cont || !msg) return;

  msg.innerText = "Cargando agenda...";
  cont.innerHTML = "<p>Agenda lista. Eventos precargados en memoria.</p>";
  msg.innerText = "";
}

// ===================== FUNCION UNICA PARA AGREGAR EVENTO =====================
function agregarEvento() {
  const form = document.getElementById("formAgregarEvento");
  const btnCancelar = document.getElementById("btnCancelarEvento");
  if (!form) return;

  // Mostrar formulario
  form.style.display = "block";

  // Botón cancelar
  if (btnCancelar) {
    btnCancelar.onclick = () => {
      form.style.display = "none";
      form.reset();
    };
  }

  // Agregar listener de submit solo una vez
  if (!form.dataset.listenerAgregado) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const fecha = document.getElementById("inputFecha").value;
      const hora = document.getElementById("inputHora").value;
      const eventoTexto = document.getElementById("inputEvento").value;
      const notas = document.getElementById("inputNotas").value;
      const id = Date.now().toString();

      const data = [id, fecha, hora, eventoTexto, notas];

      // Guardar en Google Sheets
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ values: [data] })
        });

        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

        console.log("[Agenda] Evento agregado correctamente");
        form.reset();
        form.style.display = "none";

        // Actualizar eventos en memoria y UI
        await cargarEventos();
        mostrarAgenda();
      } catch (err) {
        console.error("Error al agregar evento:", err);
        const msg = document.getElementById("msg");
        if (msg) msg.innerText = "Error al agregar evento";
      }
    };

    form.dataset.listenerAgregado = "true";
  }
}

// ===================== INICIALIZACIÓN =====================
async function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  // Cargar eventos
  await cargarEventos();
  mostrarAgenda();

  // Botón volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.addEventListener("click", () => window.volverHome());

  // Botón agregar evento → nuestra función única
  const agregarBtn = document.getElementById("btnAgregarEvento");
  if (agregarBtn) agregarBtn.onclick = agregarEvento;

  // Botón buscar por fecha
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
