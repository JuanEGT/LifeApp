// ===================== App.js =====================

// ===== CONFIGURACIÓN LOGIN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Variables globales
let token = null;
let tokenClient = null;

// ===== INICIALIZACIÓN =====
window.onload = () => {
  // Mostrar login
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";

  // Inicializar Google Identity Services
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;
      Agenda.setToken(token);  // Pasamos el token al módulo Agenda
      mostrarMenuPrincipal();
    }
  });

  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return console.error("No se encontró el botón loginBtn");

  loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

// ===== FUNCIONES DE NAVEGACIÓN =====
function mostrarMenuPrincipal() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}

function volverAMenu() {
  mostrarMenuPrincipal();
}

// ===== EVENT LISTENERS MENÚ =====
document.querySelectorAll('#mainMenu .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const accion = btn.innerText.toLowerCase();
    if (accion.includes("agenda")) {
      Agenda.mostrarAgenda();
    }
    // Aquí puedes agregar más módulos como Finanzas, Hábitos, etc.
  });
});

// ===== FORMULARIO AGREGAR EVENTO =====
const eventoForm = document.getElementById("eventoForm");
if (eventoForm) {
  eventoForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!token) return;

    const form = e.target;
    const id = Date.now();
    const data = [
      id,
      form.Fecha.value,
      form.Hora.value,
      form.Evento.value,
      form.Notas.value
    ];

    await Agenda.agregarEvento(data);
    form.reset();
    Agenda.mostrarAgenda();
  });
}