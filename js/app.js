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
  document.getElementById("tarHabContainer").style.display = "none";

  // Inicializar cliente OAuth
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;
      mostrarMenuPrincipal();
      Agenda.setToken(token);      // pasar token a agenda.js
      Finanzas.setToken(token);    // pasar token a finanzas.js
      TarHab.setToken(token);    // pasar token a tar_hab.js 
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

  const btnFinanzas = document.getElementById("btnFinanzas");
  if (btnFinanzas) btnFinanzas.addEventListener("click", () => Finanzas.mostrarFinanzas());

  const btnTarHab = document.getElementById("btnTarHab");
  if (btnTarHab) btnTarHab.addEventListener("click", () => TarHab.mostrarTarHab());
};

// ===== FUNCIONES =====
function mostrarMenuPrincipal() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "none";
  document.getElementById("tarHabContainer").style.display = "none"; 
  document.getElementById("mainMenu").style.display = "flex";
}
