// ===================== main.js =====================

// ===== REFERENCIAS A CONTENEDORES =====
const loginContainer = document.getElementById("loginContainer");
const mainMenu = document.getElementById("mainMenu");
const contenedorPrincipal = document.getElementById("contenedorPrincipal");
const loginBtn = document.getElementById("loginBtn");

// ===== INICIALIZACIÓN =====
window.onload = () => {
  console.log("[Main] Página cargada, inicializando app...");

  // Validar que los elementos existan
  if (!loginContainer || !mainMenu || !contenedorPrincipal || !loginBtn) {
    console.error("[Main] Uno o más elementos del DOM no fueron encontrados.");
    return;
  }

  // Mostrar login y ocultar menú y contenedor principal
  loginContainer.style.display = "flex";
  mainMenu.style.display = "none";
  contenedorPrincipal.style.display = "none";
  console.log("[Main] Login visible, menú y contenedor ocultos.");

  // Inicializar cliente OAuth
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      if (!resp || !resp.access_token) {
        console.error("[Login] No se recibió token de acceso.");
        return;
      }

      token = resp.access_token; // usa la variable global
      console.log("[Login] Token recibido:", token);

      // Ocultar login y mostrar menú y contenedor
      loginContainer.style.display = "none";
      mainMenu.style.display = "flex";
      contenedorPrincipal.style.display = "block";
      console.log("[Login] Login oculto, menú y contenedor visibles.");

      // Pasar token a los módulos si existen
      [window.Agenda, window.Finanzas, window.Habitos, window.Salud, window.Notas, window.Home]
        .forEach(mod => { if (mod && typeof mod.setToken === 'function') mod.setToken(token); });

      // Cargar módulo inicial: Home
      cargarModulo('home');
    }
  });

  // ===== BOTÓN LOGIN =====
  loginBtn.addEventListener("click", () => {
    console.log("[Login] Botón Login presionado. Solicitando token...");
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

// ===================== FUNCIÓN PARA CARGAR MÓDULOS =====================
function cargarModulo(modulo) {
  console.log(`[Main] Cargando módulo: ${modulo}`);
  
  if (!contenedorPrincipal) {
    console.error("[Main] contenedorPrincipal no existe.");
    return;
  }

  fetch(`components/${modulo}.html`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(html => {
      contenedorPrincipal.innerHTML = html;
      console.log(`[Main] HTML de ${modulo} cargado en contenedorPrincipal.`);

      // Llamar a la función de inicialización del módulo si existe
      const initFunc = window['init' + capitalize(modulo)];
      try {
        if (typeof initFunc === 'function') {
          console.log(`[Main] Inicializando módulo: ${modulo}`);
          initFunc();
        } else {
          console.warn(`[Main] No se encontró init${capitalize(modulo)}()`);
        }
      } catch (err) {
        console.error(`[Main] Error inicializando módulo ${modulo}:`, err);
      }
    })
    .catch(err => {
      console.error(`[Main] Error cargando módulo ${modulo}:`, err);
      contenedorPrincipal.innerHTML = `<p>Error cargando el módulo ${modulo}. Revisa la consola.</p>`;
    });
}

// ===================== FUNCIONES AUXILIARES =====================
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===================== INIT AGENDA =====================
function initAgenda() {
  console.log("[Agenda] Inicializando módulo...");

  // 1️⃣ Inyectar o mostrar el HTML de la agenda
  mostrarAgenda(); // Asegúrate de que esto deje #backToHomeBtn en el DOM

  // 2️⃣ Obtener el botón de volver al home
  const backBtn = document.getElementById("backToHomeBtn");

  if (backBtn) {
    // 3️⃣ Asociar evento al botón usando la función global
    backBtn.addEventListener("click", () => {
      console.log("[Agenda] Botón Volver al Home clickeado");
      window.volverHome(); // Llama a la función global de main.js
    });
  } else {
    console.warn("[Agenda] Botón de volver al Home NO encontrado");
  }

  // 4️⃣ Inicializar otros elementos de la agenda
  const btnAgregarEvento = document.getElementById("btnAgregarEvento");
  const btnBuscarFecha = document.getElementById("btnBuscarPorFecha");
  // Aquí podrías agregar eventos para estos botones...

  console.log("[Agenda] Módulo inicializado correctamente");
}

// ===================== EJECUTAR INIT =====================
window.addEventListener("DOMContentLoaded", () => {
  initAgenda();
});
