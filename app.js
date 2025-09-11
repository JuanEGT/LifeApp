// ===================== App.js =====================

// ===== CONFIGURACIÓN LOGIN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let token = null;
let tokenClient = null;

// ===== INICIALIZACIÓN =====
window.onload = () => {
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "none";

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token;
      Agenda.setToken(token);
      Finanzas.setToken(token);
      mostrarMenuPrincipal();
    }
  });

  // ===== LOGIN =====
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  });

  // ===== MENÚ PRINCIPAL =====
  const btnAgenda = document.getElementById("btnAgenda");
  if (btnAgenda) btnAgenda.addEventListener("click", () => Agenda.mostrarAgenda());

  const btnFinanzas = document.getElementById("btnFinanzas");
  if (btnFinanzas) btnFinanzas.addEventListener("click", () => Finanzas.mostrarFinanzas());

  // ===== BOTONES AGENDA =====
  const btnAgregar = document.getElementById("btnAgregarEvento");
  if (btnAgregar) btnAgregar.addEventListener("click", () => Agenda.mostrarAgregarEvento());

  const btnBuscar = document.getElementById("btnBuscarFecha");
  if (btnBuscar) btnBuscar.addEventListener("click", () => Agenda.mostrarBuscarFecha());

  const btnVolverMenu = document.getElementById("btnVolverMenu");
  if (btnVolverMenu) btnVolverMenu.addEventListener("click", () => mostrarMenuPrincipal());

  const btnVolverAgenda = document.getElementById("btnVolverAgenda");
  if (btnVolverAgenda) btnVolverAgenda.addEventListener("click", () => Agenda.mostrarAgenda());

  const btnBuscarPorFecha = document.getElementById("btnBuscarPorFecha");
  if (btnBuscarPorFecha) btnBuscarPorFecha.addEventListener("click", (e) => {
    e.preventDefault();
    Agenda.buscarPorFecha();
  });

  const eventoForm = document.getElementById("eventoForm");
  if (eventoForm) {
    eventoForm.addEventListener("submit", async (e) => {
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

  // ===== BOTONES FINANZAS =====
  const btnVolverMenuFinanzas = document.getElementById("btnVolverMenuFinanzas");
  if (btnVolverMenuFinanzas) btnVolverMenuFinanzas.addEventListener("click", () => mostrarMenuPrincipal());
};

// ===== FUNCIONES GENERALES =====
function mostrarMenuPrincipal() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("agendaContainer").style.display = "none";
  document.getElementById("finanzasContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}
