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
  const index = hoy.getDate() % frases.length;
  return frases[index];
}

// ===================== EVENTOS HISTÓRICOS (Wikipedia ES) =====================
async function eventosHistoricos() {
  const contenedor = document.getElementById('eventosDelDia');
  try {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    const url = `https://es.wikipedia.org/api/rest_v1/feed/onthisday/events/${mes}/${dia}`;
    const res = await fetch(url);
    const data = await res.json();

    // Wikipedia devuelve un array llamado 'events'
    const eventos = data.events.slice(0, 5); // top 5 eventos
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
