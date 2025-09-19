// ===================== FRASE MOTIVACIONAL =====================
const frases = [
  "No cuentes los días, haz que los días cuenten.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Cada día es una nueva oportunidad para mejorar.",
  "Haz hoy lo que otros no quieren, mañana tendrás lo que otros no tendrán.",
  "La disciplina es el puente entre metas y logros.",
  "Nunca es tarde para ser quien quieres ser.",
  "El único límite es el que tú mismo te pones.",
  "Transforma tus sueños en metas y tus metas en acciones.",
  "La constancia vence lo que la suerte no puede.",
  "No dejes para mañana lo que puedes hacer hoy.",
  "Los grandes logros requieren tiempo y paciencia.",
  "No busques resultados rápidos, busca resultados duraderos.",
  "El fracaso es solo una oportunidad para comenzar de nuevo con más experiencia.",
  "Cada pequeño paso cuenta hacia tu meta.",
  "Cree en ti y todo será posible.",
  "La motivación te inicia, el hábito te mantiene.",
  "Haz lo que amas y nunca trabajarás un día de tu vida.",
  "El éxito no es casualidad, es trabajo constante.",
  "No temas empezar de nuevo, cada día es una nueva oportunidad.",
  "Aprende a disfrutar del proceso, no solo del resultado.",
  "Lo que no te desafía no te cambia.",
  "La vida empieza donde termina tu zona de confort.",
  "No sueñes tu vida, vive tus sueños.",
  "El esfuerzo de hoy es la recompensa de mañana.",
  "No te compares con otros, compite contigo mismo.",
  "Sé el cambio que quieres ver en el mundo.",
  "Cada error es una lección disfrazada.",
  "Agradece lo que tienes mientras persigues lo que quieres.",
  "La actitud positiva atrae resultados positivos.",
  "Nunca subestimes el poder de la perseverancia.",
  "Los obstáculos son esas cosas espantosas que ves cuando apartas los ojos de tu meta.",
  "El que quiere hacer algo encuentra un medio, el que no quiere encuentra una excusa.",
  "Haz que tu vida sea tan buena que tu firma sea memorable.",
  "Cambia tus pensamientos y cambiarás tu mundo.",
  "No cuentes problemas, cuenta soluciones.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Todo logro comienza con la decisión de intentarlo.",
  "Nunca es demasiado tarde para fijar un nuevo objetivo o soñar un nuevo sueño.",
  "La acción es la clave fundamental para todo éxito.",
  "No importa cuán lento vayas, siempre y cuando no te detengas.",
  "Cada día es un lienzo en blanco, pinta algo hermoso.",
  "Haz hoy lo que otros no quieren, y mañana tendrás lo que otros no podrán.",
  "El momento que decides cambiar, empieza tu nueva historia.",
  "La paciencia y la perseverancia tienen un efecto mágico ante los cuales las dificultades desaparecen.",
  "Convierte tus heridas en sabiduría.",
  "El éxito no es la clave de la felicidad, la felicidad es la clave del éxito.",
  "Nunca te rindas, grandes cosas toman tiempo.",
  "La vida es 10% lo que te pasa y 90% cómo reaccionas ante ello.",
  "No esperes oportunidades, créalas.",
  "Cada mañana nacemos de nuevo, lo que hacemos hoy es lo que más importa."
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
    const eventos = data.events.slice(0, 10); // top 5 eventos
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
