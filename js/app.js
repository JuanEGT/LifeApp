// ===================== App.js =====================

// ===== CONFIGURACIÓN LOGIN =====
const CLIENT_ID = "721915958995-9gri9jissf6vp3i1sfj93ft3tjqp7rnk.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let token = null;
let tokenClient = null;

// Contenedor donde se cargarán los módulos
const moduleContainer = document.getElementById("moduleContainer");

// ===== INICIALIZACIÓN =====
window.onload = () => {
  console.log("App cargada: mostrando login");
  
  // Mostrar login y ocultar menú principal
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("mainMenu").style.display = "none";

  // Inicializar cliente OAuth
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      console.log("Token recibido:", resp);
      token = resp.access_token;
      mostrarMenuPrincipal();
      // Pasar token a módulos si tienen init
      if (typeof Agenda !== "undefined") Agenda.setToken(token);
      if (typeof Finanzas !== "undefined") Finanzas.setToken(token);
    }
  });

  // ===== BOTÓN LOGIN =====
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("Botón login presionado");
      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  }

  // ===== BOTONES DEL MENÚ PRINCIPAL =====
  document.getElementById("btnAgenda").addEventListener("click", () => {
    console.log("Cargando módulo Agenda");
    cargarModulo("agenda.html", () => {
      if (typeof Agenda !== "undefined") Agenda.mostrarAgenda();
    });
  });

  document.getElementById("btnFinanzas").addEventListener("click", () => {
    console.log("Cargando módulo Finanzas");
    cargarModulo("finanzas.html", () => {
      if (typeof Finanzas !== "undefined") Finanzas.mostrarFinanzas();
    });
  });
};

// ===== FUNCIONES =====
function mostrarMenuPrincipal() {
  console.log("Mostrando menú principal");
  document.getElementById("loginContainer").style.display = "none";
  moduleContainer.innerHTML = ""; // limpiar módulo previo
  document.getElementById("mainMenu").style.display = "flex";
}

/**
 * Carga un módulo HTML dinámicamente dentro de #moduleContainer
 * @param {string} url - ruta del html del módulo
 * @param {function} callback - función que se ejecuta después de cargar
 */
function cargarModulo(url, callback) {
  console.log("Fetching módulo:", url);
  fetch(`html/${url}`)
    .then(response => {
      if (!response.ok) throw new Error(`Error al cargar ${url}`);
      return response.text();
    })
    .then(html => {
      moduleContainer.innerHTML = html;
      console.log(`Módulo ${url} cargado`);
      if (callback) callback();
    })
    .catch(err => {
      console.error("Error cargando módulo:", err);
    });
}
