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

// --------------------- Mostrar Suma LP y Rango ---------------------
async function mostrarSumaYRank() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Habitos!F2?majorDimension=ROWS`;
    const resp = await fetch(url, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    const totalLP = parseInt(data.values?.[0]?.[0] || 0);

    // Determinar rango según LP
    let rango = "Sin rango", imagen = "";
    if (totalLP >= 3900) { rango = "Challenger 👑"; imagen = "rango-challenger.png"; }
    else if (totalLP >= 3600) { rango = "Gran Maestro 🟥"; imagen = "rango-gm.png"; }
    else if (totalLP >= 3300) { rango = "Maestro 🔶"; imagen = "rango-master.png"; }
    else if (totalLP >= 3000) { rango = "Diamante 🔷"; imagen = "rango-diamond.png"; }
    else if (totalLP >= 2500) { rango = "Esmeralda 🟢"; imagen = "rango-emerald.png"; }
    else if (totalLP >= 2000) { rango = "Platino 💎"; imagen = "rango-platino.png"; }
    else if (totalLP >= 1500) { rango = "Oro 🟡"; imagen = "rango-oro.png"; }
    else if (totalLP >= 1000) { rango = "Plata ⚪"; imagen = "rango-plata.png"; }
    else if (totalLP >= 500) { rango = "Bronce 🟤"; imagen = "rango-bronce.png"; }
    else { rango = "Hierro ⚙️"; imagen = "rango-hierro.png"; }

    // Mostrar datos en el contenedor
    const cont = document.querySelector(".lp-summary");
    if (cont) {
      cont.innerHTML = `
        <div class="lp-info">
          <h3>🏆 LP totales: <span>${totalLP}</span></h3>
          <p>Rango actual: <strong>${rango}</strong></p>
          ${imagen ? `<img src="img/${imagen}" alt="${rango}" class="lp-rank-img">` : ""}
        </div>
      `;
    }
  } catch (err) {
    console.error("[Habitos] Error al mostrar LP total:", err);
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

// --------------------- Función para obtener número de semana ---------------------
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
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
      return getWeekNumber(ultima) !== getWeekNumber(hoy) || ultima.getFullYear() !== hoy.getFullYear();
    case "Mensual":
      return ultima.getMonth() !== hoy.getMonth() || ultima.getFullYear() !== hoy.getFullYear();
    default:
      return true;
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
    agregarBtn.onclick = async () => {
      const nombre = document.getElementById("habitoNombre").value.trim();
      const frecuencia = document.getElementById("habitoFrecuencia").value;
      if (!nombre) {
        alert("⚠️ Ingresa un nombre para el hábito");
        return;
      }
      const success = await agregarHabito(nombre, frecuencia);
      if (success) {
        alert("✅ Hábito agregado!");
        document.getElementById("habitoNombre").value = "";
        initHabitos(); // recargar tabla
      } else {
        alert("⚠️ Error al agregar hábito");
      }
    };
  }

  // Contenedor de la tabla
  const tablaContainer = document.querySelector(".tablaHabitosContainer");
  if (!tablaContainer) return;
  tablaContainer.innerText = "Cargando hábitos...";

  // Cargar y mostrar datos
  const datos = await cargarHabitos();

  if (datos.length > 0) {
    const [headers, ...rows] = datos;
    const visibleHeaders = headers.slice(0, 3).concat("Acciones"); // Nombre, Frecuencia, Estado + columna de acciones

    let html = `<table class="tabla-habitos">
                  <thead><tr>${visibleHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                  <tbody>
                    ${rows.map((r, i) => {
                      // Resetear estado si toca
                      const estado = resetearPendientes(r[1], r[3], r[2]);
                      const accionHTML = puedeCompletar(r[3], r[1])
                        ? `<button onclick="marcarCompletado(${i+2}, '${r[1]}', '${r[3]}', '${r[4]}')">✔️</button>`
                        : `<span class="completado-text">Completado</span>`;
                      return `<tr>
                                <td>${r[0]}</td>
                                <td>${r[1]}</td>
                                <td>${estado}</td>
                                <td>${accionHTML}</td>
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