// ===================== agenda.js =====================

// Nombre de la hoja de Google Sheets
const SHEET_NAME = "Agenda";

// Token global para acceder a Google Sheets
let agendaToken = null;

// Función para recibir y guardar el token
function setToken(token) {
  agendaToken = token;
  console.log("[Agenda] Token recibido:", agendaToken);
}

async function cargarEventos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    return Array.isArray(data.values) ? data.values : [];
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    const msg = document.getElementById("msg");
    if (msg) msg.innerText = "Error al cargar eventos";
    return [];
  }
}

// ===================== UI =====================
// Función para mostrar la agenda 
async function mostrarAgenda() {
  const cont = document.getElementById("agendaContent");
  const msg = document.getElementById("msg");
  if (!cont || !msg) return;

  // Mostrar mensaje de carga
  msg.innerText = "Cargando eventos...";
  cont.innerHTML = "";

  const eventos = await cargarEventos();

  if (eventos.length === 0) {
    cont.innerHTML = "<p>No hay eventos registrados.</p>";
  } else {
    const lista = document.createElement("ul");
    lista.classList.add("agenda-lista");

    // Saltar la primera fila si es encabezado
    for (let i = 1; i < eventos.length; i++) {
      const fila = eventos[i]; // fila = [ID, Fecha, Hora, Evento, Notas]
      const li = document.createElement("li");
      li.innerHTML = `<strong>${fila[1]}</strong> ${fila[2]} - ${fila[3]} ${fila[4] ? "- " + fila[4] : ""}`;
      lista.appendChild(li);
    }

    cont.appendChild(lista);
  }

  msg.innerText = "";
}


// Inicializa el módulo de agenda
function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  // 1️⃣ Mostrar la agenda al iniciar
  mostrarAgenda();

  // 2️⃣ Asociar listener al botón de volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Volver al Home clickeado");
      window.volverHome(); // función global de main.js
    });
  } else {
    console.warn("[Agenda] Botón de volver al Home NO encontrado");
  }

  // 3️⃣ Asociar listener al botón de agregar evento
  const agregarBtn = document.getElementById("btnAgregarEvento");
  if (agregarBtn) {
    agregarBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Agregar Evento clickeado");
      const form = document.getElementById("formAgregarEvento");
      if (form) form.style.display = "block"; // mostrar el formulario
    });
  }

  // 4️⃣ Asociar listener al botón de buscar por fecha
  const buscarBtn = document.getElementById("btnBuscarFecha");
  if (buscarBtn) {
    buscarBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Buscar por Fecha clickeado");
      // Aquí podrías abrir un input o filtro por fecha
      const fechaInput = document.getElementById("inputBuscarFecha");
      if (fechaInput) fechaInput.style.display = "block";
    });
  }
}


// ===================== EXPOSICIÓN GLOBAL =====================
window.setToken = setToken;
window.initAgenda = initAgenda;
window.mostrarAgenda = mostrarAgenda;
