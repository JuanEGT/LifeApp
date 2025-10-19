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
    return Array.isArray(data.values) ? data.values : [];
  } catch (err) {
    console.error("[Habitos] Error al cargar hábitos:", err);
    const tablaContainer = document.querySelector(".tablaHabitosContainer");
    if (tablaContainer) tablaContainer.innerText = "⚠️ Error al cargar hábitos.";
    return [];
  }
}

// --------------------- Helper para parsear fechas seguras ---------------------
function parseFechaSeguro(fechaStr) {
  if (!fechaStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [y, m, d] = fechaStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
    const [d, m, y] = fechaStr.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(fechaStr);
  return isNaN(parsed) ? null : parsed;
}

// --------------------- Función para obtener número de semana ---------------------
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// --------------------- Función para determinar si el hábito debe estar pendiente ---------------------
function estadoSegunFecha(frecuencia, fechaUltima) {
  const hoy = new Date();
  const ultima = parseFechaSeguro(fechaUltima);
  if (!ultima) return "Pendiente";

  switch(frecuencia) {
    case "Diaria":
      return (ultima.toDateString() !== hoy.toDateString()) ? "Pendiente" : "Completado";
    case "Semanal":
      return (getWeekNumber(ultima) !== getWeekNumber(hoy) || ultima.getFullYear() !== hoy.getFullYear())
        ? "Pendiente" : "Completado";
    case "Mensual":
      return (ultima.getMonth() !== hoy.getMonth() || ultima.getFullYear() !== hoy.getFullYear())
        ? "Pendiente" : "Completado";
    default:
      return "Pendiente";
  }
}

// --------------------- Función para actualizar hábito en la hoja ---------------------
async function actualizarHabito(rowIndex, estado, fecha, lp) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}!C${rowIndex}:E${rowIndex}?valueInputOption=USER_ENTERED`;
  const body = { values: [[estado, fecha, lp]] };
  try {
    const resp = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
  } catch (err) {
    console.error("[Habitos] Error al actualizar hábito:", err);
  }
}

// --------------------- Función para marcar completado ---------------------
async function marcarCompletado(rowIndex, frecuencia, fechaUltima, lpActual, btn) {
  const hoyStr = new Date().toISOString().split("T")[0];
  const nuevaLP = parseInt(lpActual || 0) + 1;

  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.textContent = "⏳";
  }

  await actualizarHabito(rowIndex, "Completado", hoyStr, nuevaLP);

  if (btn) btn.outerHTML = `<span class="completado-text">Completado</span>`;
}

// --------------------- Función para inicializar tabla ---------------------
async function initHabitos() {
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.onclick = volverHome;

  const agregarBtn = document.getElementById("agregarHabitoBtn");
  if (agregarBtn) {
    agregarBtn.onclick = async () => {
      const nombre = document.getElementById("habitoNombre").value.trim();
      const frecuencia = document.getElementById("habitoFrecuencia").value;
      if (!nombre) { alert("⚠️ Ingresa un nombre para el hábito"); return; }
      const success = await agregarHabito(nombre, frecuencia);
      if (success) {
        alert("✅ Hábito agregado!");
        document.getElementById("habitoNombre").value = "";
        initHabitos();
      } else {
        alert("⚠️ Error al agregar hábito");
      }
    };
  }

  const tablaContainer = document.querySelector(".tablaHabitosContainer");
  if (!tablaContainer) return;
  tablaContainer.innerText = "Cargando hábitos...";

  const datos = await cargarHabitos();
  mostrarSumaYRank();

  if (datos.length > 1) {
    const [, ...rows] = datos; // ignorar encabezados

    let html = `<table class="tabla-habitos">
      <thead>
        <tr><th>Nombre</th><th>Frecuencia</th><th>Acciones</th></tr>
      </thead>
      <tbody>`;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;
      const filaReal = i + 2;
      const [nombre, frecuencia, estadoOriginal, fechaUltima, lpActual] = r;

      // Determinar estado real según fecha
      let estado = estadoSegunFecha(frecuencia, fechaUltima);
      const hoyStr = new Date().toISOString().split("T")[0];

      // Si estaba completado pero fecha anterior, resetear a Pendiente
      if (estado === "Pendiente" && estadoOriginal === "Completado") {
        await actualizarHabito(filaReal, "Pendiente", hoyStr, lpActual || 0);
      }

      // Mostrar botón solo si está pendiente
      const mostrarComoPendiente = estado === "Pendiente";
      const accionHTML = mostrarComoPendiente
        ? `<button class="btn-completar" onclick="marcarCompletado(${filaReal}, '${frecuencia}', '${hoyStr}', '${lpActual}', this)">✔️</button>`
        : `<span class="completado-text">Completado</span>`;

      html += `<tr>
        <td>${nombre}</td>
        <td>${frecuencia}</td>
        <td>${accionHTML}</td>
      </tr>`;
    }

    html += `</tbody></table>`;
    tablaContainer.innerHTML = html;
  } else {
    tablaContainer.innerText = "No hay hábitos registrados.";
  }
}

// --------------------- Exportar funciones ---------------------
window.initHabitos = initHabitos;
window.agregarHabito = agregarHabito;
window.marcarCompletado = marcarCompletado;