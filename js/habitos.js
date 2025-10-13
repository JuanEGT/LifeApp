// ===================== Habitos.js =====================
const SHEET_NAME_2 = "Habitos";

// --------------------- Función para cargar hábitos ---------------------
async function cargarHabitos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
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

// --------------------- Función para agregar un hábito ---------------------
async function agregarHabito(nombre, frecuencia, estado = "Pendiente") {
  if (!nombre || !frecuencia) {
    console.warn("[Habitos] Nombre y frecuencia son obligatorios");
    return false;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}:append?valueInputOption=USER_ENTERED`;

  const body = {
    values: [[nombre, frecuencia, estado]]
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    const data = await resp.json();
    console.log("[Habitos] Hábito agregado:", data);
    return true;
  } catch (err) {
    console.error("[Habitos] Error al agregar hábito:", err);
    return false;
  }
}

// --------------------- Inicialización del módulo ---------------------
async function initHabitos() {
  console.log("[Habitos] Inicializando módulo");

  // Botón para volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", volverHome);
  }

  // Contenedor principal
  const content = document.querySelector(".habitosContent");
  if (!content) return;

  // Agregamos formulario para nuevo hábito
  content.innerHTML = `
    <div class="nuevoHabitoForm">
      <input type="text" id="habitoNombre" placeholder="Nombre del hábito" />
      <input type="text" id="habitoFrecuencia" placeholder="Frecuencia" />
      <button id="agregarHabitoBtn" class="btn">➕ Agregar Hábito</button>
    </div>
    <div class="tablaHabitosContainer">Cargando hábitos...</div>
  `;

  // Botón para agregar hábito
  const agregarBtn = document.getElementById("agregarHabitoBtn");
  if (agregarBtn) {
    agregarBtn.addEventListener("click", async () => {
      const nombre = document.getElementById("habitoNombre").value;
      const frecuencia = document.getElementById("habitoFrecuencia").value;
      const success = await agregarHabito(nombre, frecuencia);
      if (success) {
        alert("✅ Hábito agregado!");
        initHabitos(); // recargar tabla y formulario
      } else {
        alert("⚠️ Error al agregar hábito");
      }
    });
  }

  // Cargar y mostrar datos
  const datos = await cargarHabitos();
  const tablaContainer = content.querySelector(".tablaHabitosContainer");

  if (datos.length > 0) {
    const [headers, ...rows] = datos;
    let html = `<table class="tabla-habitos">
                  <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                  <tbody>
                    ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
                  </tbody>
                </table>`;
    tablaContainer.innerHTML = html;
  } else {
    tablaContainer.innerText = "No hay hábitos registrados.";
  }
}


// Exponer al scope global
window.initHabitos = initHabitos;
window.agregarHabito = agregarHabito;
