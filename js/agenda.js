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
// Mostrar agenda con eventos
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");
  if (!cont || !msg) return;

  msg.innerText = "Cargando agenda...";
  cont.innerHTML = "";

  if (eventosCache.length < 2) {
    cont.innerHTML = "<p>No hay eventos.</p>";
  } else {
    const headers = eventosCache[0];
    eventosCache.slice(1).forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");
      const p = document.createElement("p");
      p.innerText = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;
      cont.appendChild(p);
    });
  }

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

// ===================== FUNCION UNICA PARA BUSCAR POR FECHA =====================
function buscarPorFecha() {
  const menu = document.getElementById("menuButtons");
  const form = document.getElementById("formAgregarEvento");
  const fechaSelector = document.getElementById("fechaSelector");
  const agendaDiv = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");

  if (!menu || !form || !fechaSelector || !agendaDiv || !msg) return;

  // Ocultar elementos principales
  menu.style.display = "none";
  form.style.display = "none";
  agendaDiv.innerHTML = "";
  msg.innerText = "";

  // Mostrar selector de fecha
  fechaSelector.style.display = "flex";

  const btnBuscar = document.getElementById("btnBuscarPorFecha");
  const btnVolver = document.getElementById("btnVolverAgenda");

  // Volver a agenda
  btnVolver.onclick = async () => {
    fechaSelector.style.display = "none";
    menu.style.display = "flex";
    await mostrarAgenda(); // recargar vista de agenda
  };

  // Buscar eventos por fecha
  btnBuscar.onclick = async () => {
    const fecha = document.getElementById("fechaInput").value;
    if (!fecha) return;

    const allValues = await cargarEventos();
    if (!allValues || allValues.length < 2) return;

    const headers = allValues[0];
    const rows = allValues.slice(1).filter(r => r[1] === fecha);

    agendaDiv.innerHTML = "";

    rows.forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");
      const p = document.createElement("p");
      p.innerText = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;
      agendaDiv.appendChild(p);
    });
  };
}

// ===================== INICIALIZACIÓN =====================
async function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  await cargarEventos();
  await mostrarAgenda();

  // Botón volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.addEventListener("click", () => window.volverHome());

  // Botón agregar evento → nuestra función única
  const agregarBtn = document.getElementById("btnAgregarEvento");
  if (agregarBtn) agregarBtn.onclick = agregarEvento;

  // Botón buscar por fecha
  const btnBuscarFecha = document.getElementById("btnBuscarFecha");
  if (btnBuscarFecha) btnBuscarFecha.onclick = () => buscarPorFecha();
}

// ===================== EXPOSICIÓN GLOBAL =====================
window.initAgenda = initAgenda;
window.mostrarAgenda = mostrarAgenda;
