const SHEET_NAME_2 = "Habitos";

// --------------------- LP por frecuencia ---------------------
const LP_POR_FRECUENCIA = {
  diaria: { ganados: 5 },
  semanal: { ganados: 10 },
  mensual: { ganados: 30 }
};

// --------------------- Funciones auxiliares ---------------------
function obtenerLP(frecuencia) {
  return LP_POR_FRECUENCIA[frecuencia.toLowerCase()] || { ganados: 0 };
}

function habitoDisponible(habito) {
  const estado = habito[2]; // Estado
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
  let indexActual = 0;
  for (let i = 0; i < rangos.length; i++) {
    if (lpTotales >= rangos[i].lp) {
      rangoActual = rangos[i];
      indexActual = i;
    } else break;
  }

  let division = rangoActual.divisiones > 1
    ? Math.max(1, rangoActual.divisiones - Math.floor((lpTotales - rangoActual.lp) / 100))
    : 1;

  return { nombre: rangoActual.nombre, division, lpTotales };
}

// --------------------- Cargar hábitos ---------------------
async function cargarHabitos() {
  try {
    const url = `${SCRIPT_URL}?sheet=${SHEET_NAME_2}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data; // Array de objetos
  } catch (err) {
    console.error("[Habitos] Error al cargar hábitos:", err);
    const content = document.querySelector(".habitosContent");
    if (content) content.innerText = "⚠️ Error al cargar hábitos.";
    return [];
  }
}

// --------------------- Completar hábito ---------------------
async function completarHabito(habito, fila) {
  const hoy = new Date().toISOString().split("T")[0];
  const { ganados } = obtenerLP(habito[1]);

  const url = `${SCRIPT_URL}?action=marcarCompletado&fila=${fila}&fecha=${hoy}&lp=${ganados}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    alert(`+${ganados} LP 🎉`);
    initHabitos(); // recargar hábitos
  } catch (err) {
    console.error("[Habitos] Error al marcar completado:", err);
  }
}

// --------------------- Mostrar hábitos ---------------------
async function mostrarHabitos() {
  const datos = await cargarHabitos();
  const content = document.querySelector(".habitosContent");
  if (!content) return;

  if (!datos || datos.length === 0) {
    content.innerText = "No hay hábitos en la hoja.";
    return;
  }

  content.innerHTML = "";
  let lpTotales = 0;

  datos.forEach((habito, i) => {
    const div = document.createElement("div");
    div.classList.add("habito-item");
    div.innerText = `${habito.Nombre} (${habito.Frecuencia})`;

    const btn = document.createElement("button");
    btn.innerText = "✓";
    btn.disabled = !habitoDisponible([habito.Nombre, habito.Frecuencia, habito.Estado, habito["Última actualización"]]);
    btn.addEventListener("click", () => completarHabito([habito.Nombre, habito.Frecuencia, habito.Estado, habito["Última actualización"]], i + 2));

    div.appendChild(btn);
    content.appendChild(div);

    lpTotales += parseInt(habito["LP totales"] || 0);
  });

  const rango = calcularRango(lpTotales);
  content.insertAdjacentHTML("beforeend", `<p>División: ${rango.nombre} ${rango.division} - LP: ${rango.lpTotales}</p>`);
}

// --------------------- Agregar hábito ---------------------
async function agregarHabito() {
  const nombre = document.getElementById("nuevoHabitoNombre").value.trim();
  const frecuencia = document.getElementById("nuevoHabitoFrecuencia").value;
  if (!nombre) return alert("Escribe un nombre para el hábito");

  const url = `${SCRIPT_URL}?action=agregarHabito&nombre=${encodeURIComponent(nombre)}&frecuencia=${frecuencia}&estado=Pendiente&fecha=&lp=0`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
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
