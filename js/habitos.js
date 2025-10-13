const SHEET_NAME_2 = "Habitos";

// --------------------- LP por frecuencia ---------------------
const LP_POR_FRECUENCIA = {
  diaria: { ganados: 5, perdidos: 2 },
  semanal: { ganados: 10, perdidos: 5 },
  mensual: { ganados: 30, perdidos: 15 }
};

// --------------------- Funciones auxiliares ---------------------
function obtenerLP(frecuencia) {
  return LP_POR_FRECUENCIA[frecuencia.toLowerCase()] || { ganados: 0, perdidos: 0 };
}

function habitoDisponible(habito) {
  const frecuencia = habito[1]; // Frecuencia
  const estado = habito[2];     // Estado
  const ultimaFecha = habito[3]; // Última actualización
  const hoy = new Date().toDateString();
  const last = ultimaFecha ? new Date(ultimaFecha).toDateString() : null;

  return estado === "Pendiente" && last !== hoy;
}

function calcularRango(lpTotales) {
  const rangos = [
    { nombre: "Hierro", divisiones: 5, lp: 0 },
    { nombre: "Bronce", divisiones: 5, lp: 500 },
    { nombre: "Plata", divisiones: 5, lp: 1000 },
    { nombre: "Oro", divisiones: 5, lp: 1500 },
    { nombre: "Platino", divisiones: 5, lp: 2100 },
    { nombre: "Esmeralda", divisiones: 5, lp: 2800 },
    { nombre: "Diamante", divisiones: 5, lp: 3600 },
    { nombre: "Maestro", divisiones: 1, lp: 4500 },
    { nombre: "Gran Maestro", divisiones: 1, lp: 5500 },
    { nombre: "Challenger", divisiones: 1, lp: 6500 }
  ];

  let rangoActual = rangos[0];
  for (let i = 0; i < rangos.length; i++) {
    if (lpTotales >= rangos[i].lp) rangoActual = rangos[i];
    else break;
  }

  let division = rangoActual.divisiones > 1
    ? Math.max(1, rangoActual.divisiones - Math.floor((lpTotales - rangoActual.lp) / Math.ceil(((rangos[i - 1]?.lp ?? 0) + 1))))
    : 1;

  return { nombre: rangoActual.nombre, division, lpTotales };
}

// --------------------- Cargar hábitos ---------------------
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
    return [];
  }
}

// --------------------- Completar hábito ---------------------
async function completarHabito(habito, fila) {
  const hoy = new Date().toISOString().split('T')[0];
  const { ganados } = obtenerLP(habito[1]);

  try {
    const url = `${SCRIPT_URL}?action=marcarCompletado&fila=${fila}&fecha=${hoy}&lp=${ganados}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Error al actualizar hábito: ${resp.status}`);
    alert(`+${ganados} LP 🎉`);
    initHabitos(); // recargar
  } catch (err) {
    console.error("[Habitos] Error al marcar completado:", err);
  }
}

// --------------------- Mostrar hábitos ---------------------
async function mostrarHabitos() {
  const datos = await cargarHabitos();
  const content = document.querySelector(".habitosContent");
  if (!content) return;

  if (datos.length < 2) {
    content.innerText = "No hay hábitos en la hoja.";
    return;
  }

  const [headers, ...rows] = datos;
  content.innerHTML = "";

  let lpTotales = 0;

  rows.forEach((habito, i) => {
    const div = document.createElement("div");
    div.classList.add("habito-item");
    div.innerText = `${habito[0]} (${habito[1]})`;

    const btn = document.createElement("button");
    btn.innerText = "✓";
    btn.disabled = !habitoDisponible(habito);
    btn.addEventListener("click", () => completarHabito(habito, i + 2));

    div.appendChild(btn);
    content.appendChild(div);

    const { ganados } = obtenerLP(habito[1]);
    if (!btn.disabled) lpTotales += 0;
    else lpTotales += ganados;
  });

  const rango = calcularRango(lpTotales);
  content.insertAdjacentHTML("beforeend", `<p>División: ${rango.nombre} ${rango.division} - LP: ${rango.lpTotales}</p>`);
}

// --------------------- Agregar hábito ---------------------
async function agregarHabito() {
  const nombre = document.getElementById("nuevoHabitoNombre").value.trim();
  const frecuencia = document.getElementById("nuevoHabitoFrecuencia").value;
  if (!nombre) return alert("Escribe un nombre para el hábito");

  const estado = "Pendiente";
  const ultimaActualizacion = "";
  const lpTotales = 0;

  const url = `${SCRIPT_URL}?action=agregarHabito&nombre=${encodeURIComponent(nombre)}&frecuencia=${frecuencia}&estado=${estado}&fecha=${ultimaActualizacion}&lp=${lpTotales}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Error al agregar hábito: ${resp.status}`);
    alert(`Hábito "${nombre}" agregado ✅`);
    initHabitos();
    document.getElementById("nuevoHabitoNombre").value = "";
  } catch (err) {
    console.error("[Habitos] Error al agregar hábito:", err);
  }
}

// --------------------- Inicialización ---------------------
async function initHabitos() {
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.addEventListener("click", volverHome);

  const agregarBtn = document.getElementById("agregarHabitoBtn");
  if (agregarBtn) agregarBtn.addEventListener("click", agregarHabito);

  await mostrarHabitos();
}

// --------------------- Exponer módulo ---------------------
window.initHabitos = initHabitos;
