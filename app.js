// 👇 pon aquí tu WebApp URL de Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbwTF_4IhuQzO3C1pvvNHTusdSWvBjNyRycdLF3AppAxZ9cqHLoZWeldBbaeFS88aHGbXA/exec";
const SHEET = "Agenda";

// ===============================
// Cargar eventos (GET)
// ===============================
async function cargarEventos() {
  try {
    const res = await fetch(`${API_URL}?sheet=${SHEET}`);
    const data = await res.json();

    const lista = document.getElementById("agenda");
    lista.innerHTML = "";

    if (data.length === 0) {
      lista.innerHTML = "<p>No hay eventos</p>";
      return;
    }

    data.forEach(ev => {
      const div = document.createElement("div");
      div.className = "evento";
      div.textContent = `${ev.Fecha} ${ev.Hora} - ${ev.Evento} (${ev.Notas || ""})`;
      lista.appendChild(div);
    });
  } catch (err) {
    console.error("Error al cargar:", err);
    document.getElementById("agenda").innerHTML = "<p>Error al cargar eventos</p>";
  }
}

// ===============================
// Enviar evento (POST)
// ===============================
document.getElementById("eventoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const datos = {
    Fecha: form.Fecha.value,
    Hora: form.Hora.value,
    Evento: form.Evento.value,
    Notas: form.Notas.value
  };

  try {
    const res = await fetch(`${API_URL}?sheet=${SHEET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const result = await res.json();
    if (result.success) {
      document.getElementById("msg").textContent = "✅ Evento guardado!";
      form.reset();
      cargarEventos();
    } else {
      document.getElementById("msg").textContent = "❌ Error al guardar: " + result.error;
    }
  } catch (err) {
    console.error("Error al enviar:", err);
    document.getElementById("msg").textContent = "❌ No se pudo enviar el evento.";
  }
});

// ===============================
// Inicializar
// ===============================
cargarEventos();
