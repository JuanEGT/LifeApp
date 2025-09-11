const url = "https://script.google.com/macros/s/AKfycbxZlkiUlVRWpWJseCJSbUH_EwywzeHkDNZsTqFQ5M-1l5_My9VX4LiCZ344WPywXudKng/exec?sheet=Agenda";

const container = document.getElementById("agenda");
const form = document.getElementById("agendaForm");

// 👉 Mostrar los eventos
function cargarAgenda() {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = data.map(row => `
        <div class="agenda-item">
          <div class="datetime">${row.Fecha} ${row.Hora}</div>
          <div class="evento">${row.Evento}</div>
          <div class="notas">${row.Notas}</div>
        </div>
      `).join("");
    })
    .catch(err => console.error("Error:", err));
}

// 👉 Enviar formulario al Sheet
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const payload = {};
  formData.forEach((value, key) => {
    payload[key] = value;
  });

  try {
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });

    form.reset();
    cargarAgenda(); // recargar lista
  } catch (err) {
    console.error("Error al enviar:", err);
  }
});

// 👉 Cargar datos al inicio
cargarAgenda();
