// ===================== FRASE MOTIVACIONAL =====================
const frases = [
  "No cuentes los días, haz que los días cuenten.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Cada día es una nueva oportunidad para mejorar.",
  "Haz hoy lo que otros no quieren, mañana tendrás lo que otros no tendrán.",
  "La disciplina es el puente entre metas y logros."
];

function fraseDelDia() {
  const hoy = new Date();
  const index = hoy.getDate() % frases.length; // cambia cada día
  return frases[index];
}

// ===================== EVENTOS HISTÓRICOS =====================
async function eventosHistoricos() {
  const contenedor = document.getElementById('eventosDelDia');
  try {
    const res = await fetch('https://history.muffinlabs.com/date');
    const data = await res.json();

    const eventos = data.data.Events.slice(0, 5); // top 5 eventos
    const lista = eventos.map(ev => `<li>${ev.year}: ${ev.text}</li>`).join('');

    contenedor.innerHTML = `<ul>${lista}</ul>`;
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>No se pudieron cargar los eventos históricos.</p>";
  }
}

// ===================== INICIALIZACIÓN HOME =====================
function initHome() {
  // Frase motivacional
  const motivacion = document.getElementById('motivacion');
  if (motivacion) {
    motivacion.textContent = fraseDelDia();
  }

  // Eventos históricos
  eventosHistoricos();
}

// Hacemos global para que main.js pueda llamarlo
window.initHome = initHome;
