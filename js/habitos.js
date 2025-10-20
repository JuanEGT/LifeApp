// ===================== Habitos.js =====================
const SHEET_NAME_2 = "Habitos";

// --------------------- Helper para obtener fecha de hoy en formato YYYY-MM-DD (hora local) ---------------------
function hoyLocalStr() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// --------------------- Función para cargar hábitos ---------------------
async function cargarHabitos() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}?majorDimension=ROWS`;
    const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
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
  if (!nombre || !frecuencia) return false;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}:append?valueInputOption=USER_ENTERED`;
  const body = { values: [[nombre, frecuencia, estado, hoyLocalStr(), 0]] };
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    console.log("[Habitos] Hábito agregado");
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
    const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    const data = await resp.json();
    const totalLP = parseInt(data.values?.[0]?.[0] || 0);

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

    const cont = document.querySelector(".lp-summary");
    if (cont) {
      cont.innerHTML = `
        <div class="lp-info">
          <h3>🏆 LP totales: <span>${totalLP}</span></h3>
          <p>Rango actual: <strong>${rango}</strong></p>
          ${imagen ? `<img src="img/${imagen}" alt="${rango}" class="lp-rank-img">` : "" }
        </div>`;
    }
  } catch (err) {
    console.error("[Habitos] Error al mostrar LP total:", err);
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

// --------------------- Resetear estado a Pendiente si la fecha cambió ---------------------
async function resetearPendienteSiCambioDia(rowIndex, fechaUltima, estado) {
  const hoyStr = hoyLocalStr();
  const ultima = parseFechaSeguro(fechaUltima);
  if (!ultima) return estado; // sin fecha registrada
  const hoy = new Date();
  if (estado === "Pendiente") return estado; // ya pendiente
  if (ultima.toDateString() === hoy.toDateString()) return estado; // mismo día, no cambia

  // Actualiza a Pendiente y fecha de última modificación
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}!C${rowIndex}:D${rowIndex}?valueInputOption=USER_ENTERED`;
  const body = { values: [["Pendiente", hoyStr]] };
  try {
    const resp = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    console.log(`[Habitos] Fila ${rowIndex} reseteada a Pendiente`);
    return "Pendiente";
  } catch (err) {
    console.error("[Habitos] Error al resetear pendiente:", err);
    return estado;
  }
}

// --------------------- Verificar si se puede completar ---------------------
function puedeCompletar(estado) {
  return estado === "Pendiente";
}

// --------------------- Marcar hábito como completado ---------------------
async function marcarCompletado(rowIndex, frecuencia, fechaUltima, lpActual, btn) {
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.textContent = "⏳";
  }

  let estado = await resetearPendienteSiCambioDia(rowIndex, fechaUltima, "Completado");

  if (!puedeCompletar(estado)) {
    if (btn) btn.outerHTML = `<span class="completado-text">Completado</span>`;
    return;
  }

  const hoyStr = hoyLocalStr();
  const nuevaLP = parseInt(lpActual || 0) + 1;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}!C${rowIndex}:E${rowIndex}?valueInputOption=USER_ENTERED`;
  const body = { values: [["Completado", hoyStr, nuevaLP]] };
  try {
    const resp = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    if (btn) btn.outerHTML = `<span class="completado-text">Completado</span>`;
  } catch (err) {
    console.error("[Habitos] Error al marcar completado:", err);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✔️";
      btn.style.opacity = "1";
    }
  }
}

// --------------------- Inicialización del módulo ---------------------
async function initHabitos() {
  console.log("[Habitos] Inicializando módulo");

  // Botón volver al Home
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.addEventListener("click", volverHome);

  // Botón agregar hábito
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

  // Contenedor de tabla
  const tablaContainer = document.querySelector(".tablaHabitosContainer");
  if (!tablaContainer) return;
  tablaContainer.innerText = "Cargando hábitos...";

  const datos = await cargarHabitos();
  mostrarSumaYRank();

  if (datos.length > 1) {
    const [, ...rows] = datos; // ignorar encabezado
    const html = `
      <table class="tabla-habitos">
        <thead><tr><th>Nombre</th><th>Frecuencia</th><th>Acciones</th></tr></thead>
        <tbody>
          ${rows.map((r, i) => {
            if (!r || !r[0]) return "";
            const filaReal = i + 2;
            const [nombre, frecuencia, estadoOriginal, fechaUltima, lpActual] = r;
            const estado = estadoOriginal === "Pendiente" ? "Pendiente" : estadoOriginal;
            const botonHTML = `<button class="btn-completar"
              onclick="marcarCompletado(${filaReal}, '${frecuencia}', '${fechaUltima}', '${lpActual}', this)">✔️</button>`;
            const accionHTML = estado === "Completado" ? `<span class="completado-text">Completado</span>` : botonHTML;
            return `<tr><td>${nombre}</td><td>${frecuencia}</td><td>${accionHTML}</td></tr>`;
          }).join('')}
        </tbody>
      </table>`;
    tablaContainer.innerHTML = html;
  } else {
    tablaContainer.innerText = "No hay hábitos registrados.";
  }
}

window.initHabitos = initHabitos;
window.agregarHabito = agregarHabito;
window.marcarCompletado = marcarCompletado;
