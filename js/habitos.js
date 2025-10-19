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
async function marcarCompletado(rowIndex, frecuencia, fechaUltima, lpActual, btn) {
  // 1️⃣ Desactivar botón visualmente
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.textContent = "⏳";
  }

  // 2️⃣ Validar frecuencia
  if (!puedeCompletar(fechaUltima, frecuencia)) {
    alert(`⚠️ Ya completaste este hábito (${frecuencia})`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = "✔️";
      btn.style.opacity = "0.5";
    }
    return;
  }

  // 3️⃣ Actualizar hoja
  const hoyStr = new Date().toISOString().split("T")[0];
  const nuevaLP = parseInt(lpActual || 0) + 1;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_2}!C${rowIndex}:E${rowIndex}?valueInputOption=USER_ENTERED`;
  const body = { values: [["Completado", hoyStr, nuevaLP]] };

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
    console.log(`[Habitos] Hábito fila ${rowIndex} marcado como completado`);

    // 4️⃣ Actualizar visual sin recargar
    if (btn) {
      btn.outerHTML = `<span class="completado-text">Completado</span>`;
    }

    // 5️⃣ Esperar 2 segundos antes de recargar tabla (por delay de la API)
    setTimeout(() => {
      initHabitos();
    }, 2000);

  } catch (err) {
    console.error("[Habitos] Error al marcar completado:", err);
    alert("⚠️ No se pudo actualizar el hábito");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✔️";
      btn.style.opacity = "1";
    }
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
  mostrarSumaYRank();

  if (datos.length > 1) {
    const [headers, ...rows] = datos;
    const visibleHeaders = headers.slice(0, 3).concat("Acciones");

    let html = `
      <table class="tabla-habitos">
        <thead>
          <tr>${visibleHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((r, i) => {
            if (!r || !r[0] || r.length < 3) return "";

            const filaReal = i + 2; // +2 por encabezado
            const nombre = r[0];
            const frecuencia = r[1];
            const estadoOriginal = r[2] || "Pendiente";
            const fechaUltima = r[3] || "";
            const lpActual = r[4] || 0;

            // Normalizar fecha (por si Sheets la devuelve en formato distinto)
            let fechaFormateada = fechaUltima;
            if (fechaUltima && fechaUltima.includes("/")) {
              const partes = fechaUltima.split("/");
              if (partes[2]) fechaFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;
            }

            // Calcular estado real
            const estado = resetearPendientes(frecuencia, fechaFormateada, estadoOriginal);
            const puede = puedeCompletar(fechaFormateada, frecuencia);

            const accionHTML = (estado === "Completado" || !puede)
              ? `<span class="completado-text">Completado</span>`
              : `<button class="btn-completar"
                         onclick="marcarCompletado(${filaReal}, '${frecuencia}', '${fechaFormateada}', '${lpActual}', this)">✔️</button>`;

            return `
              <tr>
                <td>${nombre}</td>
                <td>${frecuencia}</td>
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