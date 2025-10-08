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
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");
  if (!cont || !msg) return;

  msg.innerText = "Cargando agenda...";
  cont.innerHTML = "";

  // Cargar eventos desde Google Sheets
  const eventos = await cargarEventos();

  // Llamar a la función de calendario para mostrarlo
  mostrarCalendario(eventos);

  msg.innerText = "";
}

//====================CALENDARIO======================
async function mostrarCalendario() {
  const cont = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");
  if (!cont || !msg) return;

  msg.innerText = "Generando calendario...";
  cont.innerHTML = "";

  // Cargar eventos desde Google Sheets
  const eventosCache = await cargarEventos();
  if (eventosCache.length < 2) {
    cont.innerHTML = "<p>No hay eventos para este mes.</p>";
    msg.innerText = "";
    return;
  }

  const eventos = eventosCache.slice(1); // ignorar encabezados
  const today = new Date();
  const mes = today.getMonth();
  const anio = today.getFullYear();
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasMes = new Date(anio, mes + 1, 0).getDate();

  // Crear tabla
  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const filaHead = document.createElement("tr");
  ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].forEach(d => {
    const th = document.createElement("th");
    th.innerText = d;
    filaHead.appendChild(th);
  });
  thead.appendChild(filaHead);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  let fila = document.createElement("tr");

  // Espacios hasta primer día
  for (let i = 0; i < primerDia; i++) {
    fila.appendChild(document.createElement("td"));
  }

  for (let dia = 1; dia <= diasMes; dia++) {
    if (fila.children.length === 7) {
      tbody.appendChild(fila);
      fila = document.createElement("tr");
    }

    const td = document.createElement("td");
    td.innerText = dia;

    // Revisar si hay evento
    const fechaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const tieneEvento = eventos.some(r => r[1] === fechaStr);
    td.dataset.evento = tieneEvento ? "true" : "false"; // para CSS/JS posterior

    fila.appendChild(td);
  }

  // Rellenar últimos espacios de la fila
  while (fila.children.length < 7) fila.appendChild(document.createElement("td"));

  tbody.appendChild(fila);
  tabla.appendChild(tbody);
  cont.appendChild(tabla);

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
  console.log("[Agenda] Se ejecutó buscarPorFecha"); // <- log al iniciar función

  const menu = document.getElementById("menuButtons");
  const form = document.getElementById("formAgregarEvento");
  const fechaSelector = document.getElementById("fechaSelector");
  const agendaDiv = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");

    console.log("menuButtons:", menu);
    console.log("formAgregarEvento:", form);
    console.log("fechaSelector:", fechaSelector);
    console.log("agendaContent:", agendaDiv);
    console.log("msg:", msg);


  // Ocultar elementos principales
  console.log("[Agenda] Ocultando menú y formulario");
  menu.style.display = "none";
  form.style.display = "none";
  agendaDiv.innerHTML = "";
  msg.innerText = "";

  // Mostrar selector de fecha
  console.log("[Agenda] Mostrando selector de fecha");
  fechaSelector.style.display = "flex";

  const btnBuscar = document.getElementById("btnBuscarPorFecha");
  const btnVolver = document.getElementById("btnVolverAgenda");

  // Volver a agenda
  btnVolver.onclick = async () => {
    console.log("[Agenda] Volver a agenda presionado");
    fechaSelector.style.display = "none";
    menu.style.display = "flex";
    await mostrarAgenda(); // recargar vista de agenda
  };

  // Buscar eventos por fecha
  btnBuscar.onclick = async () => {
    const fecha = document.getElementById("fechaInput").value;
    console.log("[Agenda] Botón buscar presionado. Fecha:", fecha);
    if (!fecha) return;

    const allValues = await cargarEventos();
    if (!allValues || allValues.length < 2) {
      console.log("[Agenda] No hay eventos en la agenda");
      return;
    }

    const headers = allValues[0];
    const rows = allValues.slice(1).filter(r => r[1] === fecha);

    console.log("[Agenda] Eventos encontrados:", rows.length);
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

  // Cargar eventos y mostrar calendario
  await mostrarAgenda();
  console.log("[Agenda] Agenda mostrada en UI");

  // Botón volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Volver al Home presionado");
      window.volverHome();
    });
    console.log("[Agenda] Botón Volver al Home conectado");
  } else {
    console.log("[Agenda] ERROR: Botón Volver al Home no encontrado");
  }

  // Botón agregar evento → nuestra función única
  const agregarBtn = document.getElementById("btnAgregarEvento");
  if (agregarBtn) {
    agregarBtn.onclick = () => {
      console.log("[Agenda] Botón Agregar Evento presionado");
      agregarEvento();
    };
    console.log("[Agenda] Botón Agregar Evento conectado");
  } else {
    console.log("[Agenda] ERROR: Botón Agregar Evento no encontrado");
  }

  // Botón buscar por fecha
  const btnBuscarFecha = document.getElementById("btnBuscarFecha");
  if (btnBuscarFecha) {
    btnBuscarFecha.onclick = () => {
      console.log("[Agenda] Botón Buscar por Fecha presionado");
      buscarPorFecha();
    };
    console.log("[Agenda] Botón Buscar por Fecha conectado");
  } else {
    console.log("[Agenda] ERROR: Botón Buscar por Fecha no encontrado");
  }
}



// ===================== EXPOSICIÓN GLOBAL =====================
window.initAgenda = initAgenda;
window.mostrarAgenda = mostrarAgenda;
