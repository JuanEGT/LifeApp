// ================= app.js =================
import { Agenda } from "./agenda.js";
import { Finanzas } from "./finanzas.js";

let token = null;

// ===== Login Google =====
function initLogin() {
  const loginBtn = document.getElementById("loginBtn");
  loginBtn.onclick = () => {
    console.log("Botón login presionado");
    google.accounts.id.prompt();
  };

  window.handleCredentialResponse = (response) => {
    // response.credential contiene el JWT
    token = response.credential;
    console.log("Token recibido:", token);

    // Pasar token a módulos
    Agenda.setToken(token);
    Finanzas.setToken(token);

    mostrarMenuPrincipal();
  };
}

// ===== Menú principal =====
function mostrarMenuPrincipal() {
  console.log("Mostrando menú principal");
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
  document.getElementById("moduleContainer").style.display = "none";

  document.getElementById("btnAgenda").onclick = cargarModuloAgenda;
  document.getElementById("btnFinanzas").onclick = cargarModuloFinanzas;
}

// ===== Cargar módulos dinámicamente =====
async function cargarModuloAgenda() {
  console.log("Cargando módulo Agenda");
  const res = await fetch('html/agenda.html');
  if (!res.ok) {
    console.error("Error al cargar agenda.html:", res.status);
    return;
  }
  const html = await res.text();

  const container = document.getElementById("moduleContainer");
  container.innerHTML = html;
  container.style.display = "flex";

  document.getElementById("mainMenu").style.display = "none";

  // Inicializar Agenda
  Agenda.mostrarAgenda();
}

async function cargarModuloFinanzas() {
  console.log("Cargando módulo Finanzas");
  const res = await fetch('html/finanzas.html');
  if (!res.ok) {
    console.error("Error al cargar finanzas.html:", res.status);
    return;
  }
  const html = await res.text();

  const container = document.getElementById("moduleContainer");
  container.innerHTML = html;
  container.style.display = "flex";

  document.getElementById("mainMenu").style.display = "none";

  // Inicializar Finanzas
  Finanzas.initBotonesSubmenus();
  await Finanzas.cargarFinanzas();
}

// ===== Inicialización DOM =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("App cargada: mostrando login");
  initLogin();
});
