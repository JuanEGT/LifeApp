// ===================== App.js =====================

// ===== CONFIGURACIÓN LOGIN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let token = null;
let tokenClient = null;

// ===== INICIALIZACIÓN =====
window.onload = () => {
  // Estado inicial
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
      Agenda.setToken(token); // Pasamos token al módulo Agenda
      mostrarMenuPrincipal();
    }
  });

  // Botón de login
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  }

  // Conectar botones del menú principal
  const btnAgenda = document.getElementById("btnAgenda");
  if (btnAgenda) btnAgenda.addEventListener("click", () => Agenda.mostrarAgenda());

  const btnVolverMenu = document.getElementById("btnVolverMenu");
  if (btnVolverMenu) btnVolverMenu.addEventListener("click", () => mostrarMenuPrincipal());
};

// ===== FUNCIONES =====
function mostrarMenuPrincipal() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}
