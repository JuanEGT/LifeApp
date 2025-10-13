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
    const tablaContainer = document.querySelector(".tablaHabitosContainer");
    if (tablaContainer) tablaContainer.innerText = "⚠️ Error al cargar hábitos.";
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

  const body = { values: [[nombre, frecuencia, estado, "", 0]] };

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

// --------------------- Función para verificar si se puede completar ---------------------
function puedeCompletar(fechaUltima, frecuencia) {
  const hoy = new Date();
  if (!fechaUltima) return true;

  const ultima = new Date(fechaUltima);

  switch(frecuencia) {
    case "Diaria":
      return ultima.toDateString() !== hoy.toDateString();
    case "Semanal":
      const diffDias = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24));
      return diffDias >= 7;
    case "Mensual":
      return hoy.getMonth() !== ultima.getMonth() || hoy.getFullYear() !== ultima.getFullYear();
    default:
      return true;
  }
}

// --------------------- Función para resetear pendientes ---------------------
function resetearPendientes(frecuencia, fechaUltima, estado) {
  const hoy = new Date();
  if (!fechaUltima) return estado;

  const ultima = new Date(fechaUltima);

  switch(frecuencia) {
    case "Diaria":
      if (ultima.toDateString() !== hoy.toDateString()) return "Pendiente";
      break;
    case "Semanal":
      const diffDias = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24));
      if (diffDias >= 7) return "Pendiente";
      break;
    case "Mensual":
      if (hoy.getMonth() !== ultima.getMonth() || hoy.getFullYear() !== ultima.getFullYear()) return "Pendiente";
      break;
  }
  return estado;
}

// --------------------- Función para marcar hábito como completado ---------------------
async function marcarCompletado(rowIndex, frecuencia, fechaUltima, lpActual) {
  if (!puedeCompletar(fechaUltima, frecuencia)) {
    alert(`⚠️ Ya completaste este hábito según su frecuencia (${frecuencia})`);
    return;
  }

  const hoyStr = new Date().toISOString().split("T")[0];
  const nuevaLP = parseInt(lpActual || 0) + 1;

  // Construir objeto para actualizar la fila (Estado y Última actualización)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}!C${rowIndex}:E${rowIndex}?valueInputOption=USER_ENTERED`;
  const body = {
    values: [["Completado", hoyStr, nuevaLP]]
  };

  try {
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    console.log(`[Habitos] Hábito en fila ${rowIndex} marcado como completado`);
    initHabitos(); // recargar tabla
  } catch (err) {
    console.error("[Habitos] Error al marcar completado:", err);
    alert("⚠️ No se pudo actualizar el hábito");
  }
}

// --------------------- Inicialización del módulo ---------------------
async function initHabitos() {
  console.log("[Habitos] Inicializando módulo");

  // Botón para volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.addEventListener("click", volverHome);

  // Botón para agregar hábito
  const agregarBtn = document.getElementById("agregarHabitoBtn");
  if (agregarBtn) {
    agregarBtn.addEventListener("click", async () => {
      const nombre = document.getElementById("habitoNombre").value;
      const frecuencia = document.getElementById("habitoFrecuencia").value;
      const success = await agregarHabito(nombre, frecuencia);
      if (success) {
        alert("✅ Hábito agregado!");
        initHabitos();
        document.getElementById("habitoNombre").value = "";
      } else {
        alert("⚠️ Error al agregar hábito");
      }
    });
  }

  // Contenedor de la tabla
  const tablaContainer = document.querySelector(".tablaHabitosContainer");
  if (!tablaContainer) return;

  tablaContainer.innerText = "Cargando hábitos...";

  // Cargar y mostrar datos
  const datos = await cargarHabitos();

  if (datos.length > 0) {
    const [headers, ...rows] = datos;
    const visibleHeaders = headers.slice(0, 3).concat("Acciones"); // Nombre, Frecuencia, Estado + columna de botones

    let html = `<table class="tabla-habitos">
                  <thead><tr>${visibleHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                  <tbody>
                    ${rows.map((r, i) => {
                      // Resetear estado si toca
                      const estado = resetearPendientes(r[1], r[3], r[2]);
                      return `<tr>
                                <td>${r[0]}</td>
                                <td>${r[1]}</td>
                                <td>${estado}</td>
                                <td>
                                  <button onclick="marcarCompletado(${i+2}, '${r[1]}', '${r[3]}', '${r[4]}')">✔️</button>
                                </td>
                              </tr>`;
                    }).join('')}
                  </tbody>
                </table>`;
    tablaContainer.innerHTML = html;
  } else {
    tablaContainer.innerText = "No hay hábitos registrados.";
  }
}

// Exponer funciones al scope global
window.initHabitos = initHabitos;
window.agregarHabito = agregarHabito;
window.marcarCompletado = marcarCompletado;
