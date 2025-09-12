// ===================== App.js =====================

// ===== CONFIGURACIÓN LOGIN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let token = null;
let tokenClient = null;

// ===== INICIALIZACIÓN =====
window.onload = () => {
  // Mostrar login y ocultar demás vistas
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "none";

  // Inicializar cliente OAuth
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;
      Agenda.setToken(token);
      mostrarMenuPrincipal();
    }
  });

  // ===== BOTÓN LOGIN =====
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  }

  // ===== BOTONES DEL MENÚ PRINCIPAL =====
  const btnAgenda = document.getElementById("btnAgenda");
  if (btnAgenda) btnAgenda.addEventListener("click", () => Agenda.mostrarAgenda());

  // ===== BOTONES DE SUBMENÚ =====
  const btnAgregar = document.getElementById("btnAgregarEvento");
  if (btnAgregar) btnAgregar.addEventListener("click", () => Agenda.mostrarAgregarEvento());

  const btnBuscar = document.getElementById("btnBuscarFecha");
  if (btnBuscar) btnBuscar.addEventListener("click", () => Agenda.mostrarBuscarFecha());

  const btnVolverMenu = document.getElementById("btnVolverMenu");
  if (btnVolverMenu) btnVolverMenu.addEventListener("click", mostrarMenuPrincipal);

  const btnVolverMenuFinanzas = document.getElementById("btnVolverMenuFinanzas");
  if (btnVolverMenuFinanzas) btnVolverMenuFinanzas.addEventListener("click", mostrarMenuPrincipal);

  // ===== BOTÓN DE VOLVER A AGENDA DESDE BÚSQUEDA =====
  const btnVolverAgenda = document.getElementById("btnVolverAgenda");
  if (btnVolverAgenda) btnVolverAgenda.addEventListener("click", () => Agenda.mostrarAgenda());
};

// ===== FUNCIONES =====
function mostrarMenuPrincipal() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}
