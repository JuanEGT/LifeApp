// ===================== tar_hab.js =====================
const TarHab = (function () {
  let tokenLocal; // Token que recibiremos desde app.js
  const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
  const SHEET_NAME = "Habitos";

  let chartHabitos = null;

  // ===================== TOKEN =====================
  function setToken(tok) {
    tokenLocal = tok;
  }

  // ===================== CARGAR HABITOS =====================
  async function cargarHabitos() {
    if (!tokenLocal) {
      console.error("Token no definido");
      return;
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokenLocal}`,
        },
      });
      const dataJson = await resp.json();
      const data = dataJson.values || [];
      console.log("Habitos cargados:", data);

      renderHabitos(data);
      renderChart(data);
    } catch (err) {
      console.error("Error cargando Habitos:", err);
    }
  }

  // ===================== RENDER EN HTML =====================
  function renderHabitos(data) {
    const tareasDiv = document.getElementById("tarHabTareas");
    const habitosDiv = document.getElementById("tarHabHabitos");

    tareasDiv.innerHTML = "<h3>Tareas</h3>";
    habitosDiv.innerHTML = "<h3>Hábitos</h3>";

    data.forEach((row) => {
      const nombre = row[0] || "";
      const tipo = row[1] || "";
      const estado = row[2] || "";

      const itemDiv = document.createElement("div");
      itemDiv.textContent = `${nombre} - ${estado}`;
      if (tipo.toLowerCase() === "tarea") {
        tareasDiv.appendChild(itemDiv);
      } else {
        habitosDiv.appendChild(itemDiv);
      }
    });
  }

  // ===================== CHART =====================
  function renderChart(data) {
    const ctx = document.getElementById("tarHabCalendario").getContext("2d");
    const labels = [];
    const progreso = [];

    data.forEach((row) => {
      const tipo = row[1] || "";
      const estado = row[2] || "";
      if (tipo.toLowerCase() === "hábito" || tipo.toLowerCase() === "habito") {
        labels.push(row[0]);
        progreso.push(estado.toLowerCase() === "hecho" ? 1 : 0);
      }
    });

    if (chartHabitos) chartHabitos.destroy();
    chartHabitos = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Progreso hábitos",
            data: progreso,
            backgroundColor: "#4caf50",
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 1,
            ticks: {
              stepSize: 1,
              callback: (val) => (val === 1 ? "✅" : "❌"),
            },
          },
        },
      },
    });
  }

  // ===================== MOSTRAR MÓDULO =====================
  function mostrarTarHab() {
    document.getElementById("tarHabContainer").style.display = "flex";
    document.getElementById("mainMenu").style.display = "none";
    cargarHabitos();
  }

  // ===================== EXPORTAR / CAPTURA =====================
  function exportTarHab() {
    html2canvas(document.getElementById("tarHabContainer")).then((canvas) => {
      const link = document.createElement("a");
      link.download = "tar_hab_captura.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  // ===================== INICIALIZAR BOTONES =====================
  document.getElementById("btnExportTarHab")?.addEventListener("click", exportTarHab);
  document.querySelectorAll(".btnVolverTarHab")?.forEach((btn) =>
    btn.addEventListener("click", () => {
      document.getElementById("tarHabContainer").style.display = "none";
      document.getElementById("mainMenu").style.display = "flex";
    })
  );

  // ===================== RETURN OBJETO PÚBLICO =====================
  return {
    setToken,
    mostrarTarHab,
  };
})();
