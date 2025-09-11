// ===============================
// VARIABLES GLOBALES
// ===============================

// Array donde se guardan los eventos
let agenda = [];

// Obtenemos referencias a los elementos del DOM
const mainMenu = document.getElementById("mainMenu");       // Contenedor del menú principal
const agendaContainer = document.getElementById("agenda");  // Contenedor de la agenda
const subMenu = document.getElementById("subMenu");         // Submenú (Agregar / Buscar)
const addForm = document.getElementById("addForm");         // Formulario de agregar evento
const searchDate = document.getElementById("searchDate");   // Selector de fecha
const results = document.getElementById("results");         // Resultados de búsqueda
const msg = document.getElementById("msg");                 // Mensaje de error/info

// Botones
const backToMenuBtn = document.getElementById("backToMenu");   // Volver al menú principal
const backToAgendaBtn = document.getElementById("backToAgenda"); // Volver a la agenda


// ===============================
// FUNCIONES DE NAVEGACIÓN
// ===============================

// Mostrar el menú principal
function mostrarMenu() {
  mainMenu.style.display = "flex";   // Mostramos menú principal
  agendaContainer.style.display = "none"; // Ocultamos agenda
  addForm.classList.add("hidden");   // Ocultamos formulario
  searchDate.classList.add("hidden");// Ocultamos buscador
  results.innerHTML = "";            // Limpiamos resultados
  msg.textContent = "";              // Limpiamos mensajes
}

// Mostrar la agenda principal con submenú
function mostrarAgenda() {
  mainMenu.style.display = "none";        // Ocultamos menú principal
  agendaContainer.style.display = "flex"; // Mostramos agenda
  subMenu.style.display = "flex";         // Mostramos submenú
  addForm.classList.add("hidden");        // Ocultamos formulario
  searchDate.classList.add("hidden");     // Ocultamos buscador
  results.innerHTML = "";                 // Limpiamos resultados

  backToMenuBtn.style.display = "block";  // Botón "volver al menú principal"
  backToAgendaBtn.style.display = "none"; // Ocultamos "volver a agenda"

  mostrarEventos(); // Renderizamos los eventos
}

// Mostrar formulario de agregar evento
function mostrarAgregarEvento() {
  subMenu.style.display = "none";         // Ocultamos submenú
  addForm.classList.remove("hidden");     // Mostramos formulario
  searchDate.classList.add("hidden");     // Ocultamos buscador
  results.innerHTML = "";                 // Limpiamos resultados
  msg.textContent = "";                   // Limpiamos mensajes

  backToMenuBtn.style.display = "none";   // Ocultamos botón menú principal
  backToAgendaBtn.style.display = "block";// Mostramos botón volver a agenda
}

// Mostrar buscador por fecha
function mostrarBuscarFecha() {
  subMenu.style.display = "none";         // Ocultamos submenú
  addForm.classList.add("hidden");        // Ocultamos formulario
  searchDate.classList.remove("hidden");  // Mostramos buscador
  results.innerHTML = "";                 // Limpiamos resultados
  msg.textContent = "";                   // Limpiamos mensajes

  backToMenuBtn.style.display = "none";   // Ocultamos botón menú principal
  backToAgendaBtn.style.display = "block";// Mostramos botón volver a agenda
}


// ===============================
// FUNCIONES DE LÓGICA DE AGENDA
// ===============================

// Renderizar eventos en la agenda
function mostrarEventos() {
  const agendaList = document.getElementById("agendaList");
  agendaList.innerHTML = ""; // Limpiamos

  if (agenda.length === 0) {
    agendaList.innerHTML = "<p>No hay eventos aún.</p>";
    return;
  }

  // Recorremos los eventos y los pintamos
  agenda.forEach((evento, index) => {
    const p = document.createElement("p");
    p.textContent = `${evento.fecha} - ${evento.nombre}`;
    agendaList.appendChild(p);
  });
}

// Guardar evento desde el formulario
document.getElementById("eventForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevenimos recarga

  const nombre = document.getElementById("nombre").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!nombre || !fecha) {
    msg.textContent = "Por favor llena todos los campos.";
    return;
  }

  agenda.push({ nombre, fecha }); // Guardamos el evento
  msg.textContent = "Evento agregado con éxito.";

  // Reseteamos formulario
  document.getElementById("eventForm").reset();

  // Volvemos a agenda
  mostrarAgenda();
});

// Buscar eventos por fecha
document.getElementById("dateInput").addEventListener("change", function () {
  const date = this.value;
  results.innerHTML = "";

  const encontrados = agenda.filter((e) => e.fecha === date);

  if (encontrados.length === 0) {
    results.innerHTML = "<p>No hay eventos en esta fecha.</p>";
  } else {
    encontrados.forEach((e) => {
      const p = document.createElement("p");
      p.textContent = `${e.fecha} - ${e.nombre}`;
      results.appendChild(p);
    });
  }
});


// ===============================
// BOTONES DE NAVEGACIÓN
// ===============================

document.getElementById("goToAgenda").addEventListener("click", mostrarAgenda);
document.getElementById("goToAdd").addEventListener("click", mostrarAgregarEvento);
document.getElementById("goToSearch").addEventListener("click", mostrarBuscarFecha);

backToMenuBtn.addEventListener("click", mostrarMenu);
backToAgendaBtn.addEventListener("click", mostrarAgenda);

// ===============================
// INICIO
// ===============================
mostrarMenu(); // Mostramos el menú al cargar
