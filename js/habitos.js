// ===================== Habitos.js =====================
const SHEET_NAME_2 = "Habitos";

// --------------------- Función para cargar hábitos ---------------------
async function cargarHabitos() {

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token } // usa el token global
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    console.log("[Habitos] Datos cargados desde la hoja:", data);

    return Array.isArray(data.values) ? data.values : [];
  } catch (err) {
    console.error("[Habitos] Error al cargar hábitos:", err);
    const content = document.querySelector(".habitosContent");
    if (content) content.innerText = "⚠️ Error al cargar hábitos.";
    return [];
  }
}

// --------------------- Inicialización del módulo ---------------------
async function initHabitos() {
  console.log("[Habitos] Inicializando módulo");

  // Botón para volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    console.log("[Habitos] Botón de volver al Home encontrado");
    backBtn.addEventListener("click", volverHome);
  } else {
    console.warn("[Habitos] Botón de volver al Home NO encontrado");
  }

  // Cargar y mostrar datos
  const datos = await cargarHabitos();
  console.log("[Habitos] Datos obtenidos:", datos);

  const content = document.querySelector(".habitosContent");
  if (content && datos.length > 0) {
    const [headers, ...rows] = datos;

    let html = `<table class="tabla-habitos">
                  <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                  <tbody>
                    ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
                  </tbody>
                </table>`;
    content.innerHTML = html;
  } else if (content) {
    content.innerText = "No hay datos en la hoja de hábitos.";
  }
}

// Exponer al scope global (solo lo necesario)
window.initHabitos = initHabitos; // ✅ Esto sí existe

