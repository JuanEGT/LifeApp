const url = "https://script.google.com/macros/s/AKfycbxZlkiUlVRWpWJseCJSbUH_EwywzeHkDNZsTqFQ5M-1l5_My9VX4LiCZ344WPywXudKng/exec?sheet=Agenda";

fetch(url)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("agenda");
    container.innerHTML = data.map(row => `
      <div class="agenda-item">
        <div class="datetime">${row.Fecha} ${row.Hora}</div>
        <div class="evento">${row.Evento}</div>
        <div class="notas">${row.Notas}</div>
      </div>
    `).join("");
  })
  .catch(err => console.error("Error:", err));
