// ===================== main.js =====================

// ===== INICIALIZACIÓN =====
window.onload = () => {
  console.log("[Main] Página cargada, inicializando app...");

  // Mostrar login y ocultar menú y contenedor principal
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("contenedorPrincipal").style.display = "none";
  console.log("[Main] Login visible, menú y contenedor ocultos.");

  // Inicializar cliente OAuth
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      token = resp.access_token; // usa la variable global
      console.log("[Login] Token recibido:", token);

      // Ocultar login y mostrar menú y contenedor
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("mainMenu").style.display = "flex";
      document.getElementById("contenedorPrincipal").style.display = "block";
      console.log("[Login] Login oculto, menú y contenedor visibles.");

      // Pasar token a los módulos si existen
      if (window.Agenda) Agenda.setToken(token);
      if (window.Finanzas) Finanzas.setToken(token);
      if (window.Habitos) Habitos.setToken(token);
      if (window.Salud) Salud.setToken(token);
      if (window.Notas) Notas.setToken(token);
      if (window.Home) Home.setToken(token);

      // Cargar módulo inicial: Home
      console.log("[Main] Cargando módulo inicial: Home");
      cargarModulo('home');
    }
  });

  // ===== BOTÓN LOGIN =====
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("[Login] Botón Login presionado. Solicitando token...");
      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  }
};

// ===================== FUNCIÓN PARA CARGAR MÓDULOS =====================
function cargarModulo(modulo) {
  console.log(`[Main] Cargando módulo: ${modulo}`);
  fetch(`components/${modulo}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('contenedorPrincipal').innerHTML = html;
      console.log(`[Main] HTML de ${modulo} cargado en contenedorPrincipal.`);

      // Llamar a la función de inicialización del módulo si existe
      const initFunc = window['init' + capitalize(modulo)];
      if (typeof initFunc === 'function') {
        console.log(`[Main] Inicializando módulo: ${modulo}`);
        initFunc();
      } else {
        console.log(`[Main] No se encontró init${capitalize(modulo)}()`);
      }
    })
    .catch(err => {
      console.error(`[Main] Error cargando módulo ${modulo}:`, err);
    });
}

// Función para capitalizar el nombre del módulo (ej: agenda → Agenda)
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===================== FUNCIÓN PARA VOLVER AL HOME =====================
function volverHome() {
  console.log("[Main] Volviendo al módulo Home");
  cargarModulo('home');
}
