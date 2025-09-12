// ===================== Agenda.js =====================
const Agenda = (() => {
  const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
  const SHEET_NAME = "Agenda";
  let token = null;

  function setToken(newToken) { token = newToken; }

  // ===== DATOS =====
  async function cargarEventos() {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
      const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });

      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

      const data = await resp.json();
      return Array.isArray(data.values) ? data.values : [];
    } catch (err) {
      console.error("Error al cargar eventos:", err);
      document.getElementById("msg").innerText = "Error al cargar eventos";
      return [];
    }
  }

  async function agregarEvento(data) {
    if (!Array.isArray(data) || data.length < 5) {
      console.error("Datos inválidos para agregar evento:", data);
      document.getElementById("msg").innerText = "Error: datos del evento incompletos";
      return false;
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [data] })
      });

      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      return true;
    } catch (err) {
      console.error("Error al agregar evento:", err);
      document.getElementById("msg").innerText = "Error al agregar evento";
      return false;
    }
  }

  async function eliminarEvento(id, values) {
    if (!id || !values || !Array.isArray(values) || values.length < 2) return false;

    const filaIndex = values.findIndex(r => r[0] == id);
    if (filaIndex < 1) return false;

    const fila = filaIndex + 1;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${fila}:E?valueInputOption=USER_ENTERED`;

    try {
      const resp = await fetch(url, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [["", "", "", "", ""]] })
      });

      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      return true;
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      document.getElementById("msg").innerText = "Error al eliminar evento";
      return false;
    }
  }

  // ===== UI =====
function mostrarAgenda() {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("agendaContainer").style.display = "flex";
  document.getElementById("menuButtons").style.display = "flex";
  document.getElementById("eventoForm").style.display = "none";
  document.getElementById("fechaSelector").style.display = "none";
  document.getElementById("agenda").innerHTML = "";
  document.getElementById("msg").innerText = "";

  cargarEventos().then(values => {
    mostrarRecordatorios(values);
    mostrarCalendario(values);
    conectarFormAgregarEvento(); // conectar submit
    conectarBotonesAgenda();     // conectar botones de agenda
  });
}

  function conectarBotonesAgenda() {
  const btnAgregar = document.getElementById("btnAgregarEvento");
  if (btnAgregar) btnAgregar.onclick = mostrarAgregarEvento;

  const btnBuscar = document.getElementById("btnBuscarFecha");
  if (btnBuscar) btnBuscar.onclick = mostrarBuscarFecha;

  const btnVolver = document.getElementById("btnVolverMenu");
  if (btnVolver) btnVolver.onclick = () => {
    document.getElementById("agendaContainer").style.display = "none";
    document.getElementById("mainMenu").style.display = "flex";
  };
}

  function mostrarCalendario(values) {
  const cont = document.getElementById("calendario");
  cont.innerHTML = "<h3>Calendario mensual</h3>";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const diasMes = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Domingo

  // Nombres de los días
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Crear grid
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(7, 40px)";
  grid.style.gap = "2px";
  grid.style.textAlign = "center";

  // Encabezado de días
  diasSemana.forEach(dia => {
    const cell = document.createElement("div");
    cell.innerText = dia;
    cell.style.fontWeight = "bold";
    grid.appendChild(cell);
  });

  // Mapear días con eventos
  const eventosPorDia = {};
  if (values && values.length >= 2) {
    const headers = values[0];
    values.slice(1).forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");
      if (!obj.Fecha) return;
      const partes = obj.Fecha.split("-");
      const fechaEvento = new Date(partes[0], partes[1]-1, partes[2]);
      if (fechaEvento.getFullYear() === year && fechaEvento.getMonth() === month) {
        eventosPorDia[fechaEvento.getDate()] = true;
      }
    });
  }

  // Offset inicial para el primer día de la semana
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyCell = document.createElement("div");
    grid.appendChild(emptyCell);
  }

  // Días del mes
  for (let d = 1; d <= diasMes; d++) {
    const cell = document.createElement("div");
    cell.innerText = d;
    cell.className = "dia " + (eventosPorDia[d] ? "rojo" : "verde");
    grid.appendChild(cell);
  }

  cont.appendChild(grid);
}

  function mostrarAgregarEvento() {
    document.getElementById("menuButtons").style.display = "none";
    const form = document.getElementById("eventoForm");
    form.style.display = "flex";
    document.getElementById("fechaSelector").style.display = "none";
    document.getElementById("agenda").innerHTML = "";
    document.getElementById("msg").innerText = "";

    // Conectar submit del form
    form.onsubmit = async (e) => {
      e.preventDefault();
      const data = [
        Date.now(),
        form.Fecha.value,
        form.Hora.value,
        form.Evento.value,
        form.Notas.value
      ];
      const exito = await agregarEvento(data);
      if (exito) {
        form.reset();
        mostrarAgenda();
      }
    };

    // Botón volver a agenda
    let backBtn = document.getElementById("backToAgendaFromAdd");
    if (!backBtn) {
      backBtn = document.createElement("button");
      backBtn.id = "backToAgendaFromAdd";
      backBtn.innerText = "Volver a Agenda";
      backBtn.className = "btn backBtn";
      backBtn.style.display = "block";
      backBtn.style.marginTop = "10px";
      backBtn.onclick = mostrarAgenda;
      form.appendChild(backBtn);
    } else {
      backBtn.style.display = "block";
    }
  }

  function mostrarBuscarFecha() {
    document.getElementById("menuButtons").style.display = "none";
    document.getElementById("eventoForm").style.display = "none";
    const selector = document.getElementById("fechaSelector");
    selector.style.display = "flex";
    document.getElementById("agenda").innerHTML = "";
    document.getElementById("msg").innerText = "";

    let backBtn = document.getElementById("btnVolverAgenda");
    if (backBtn) {
      backBtn.style.display = "block";
      backBtn.onclick = mostrarAgenda;
    }
  }

  async function buscarPorFecha() {
    const fecha = document.getElementById("fechaInput").value;
    if (!fecha) return;

    const allValues = await cargarEventos();
    if (!allValues || allValues.length < 2) return;

    const headers = allValues[0];
    const rows = allValues.slice(1).filter(r => r[1] === fecha);

    const div = document.getElementById("agenda");
    div.innerHTML = "";

    rows.forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");

      const p = document.createElement("p");
      p.innerHTML = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;

      const delBtn = document.createElement("button");
      delBtn.innerText = "Eliminar";
      delBtn.className = "btn backBtn";
      delBtn.onclick = async () => {
        const id = obj.ID || r[0];
        await eliminarEvento(id, allValues);
        buscarPorFecha();
      };

      p.appendChild(delBtn);
      div.appendChild(p);
    });

    // Botón volver a agenda
    let backBtn = document.getElementById("backToAgendaFromSearch");
    if (!backBtn) {
      backBtn = document.createElement("button");
      backBtn.id = "backToAgendaFromSearch";
      backBtn.className = "btn backBtn";
      backBtn.innerText = "Volver a Agenda";
      backBtn.onclick = mostrarAgenda;
      div.appendChild(backBtn);
    } else {
      backBtn.style.display = "block";
    }
  }

  function mostrarRecordatorios(values) {
    const cont = document.getElementById("recordatorios");
    cont.innerHTML = "<h3>Próximos eventos</h3>";
    if (!values || values.length < 2) return;

    const headers = values[0];
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const sieteDias = new Date(hoy);
    sieteDias.setDate(hoy.getDate() + 7);

    values.slice(1).forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");
      if (!obj.Fecha) return;

      const partes = obj.Fecha.split("-");
      const fechaEvento = new Date(partes[0], partes[1]-1, partes[2]);

      if (fechaEvento >= hoy && fechaEvento <= sieteDias) {
        const divEvt = document.createElement("div");
        divEvt.className = "recordatorioItem";
        divEvt.innerHTML = `
          <strong>Fecha:</strong> ${obj.Fecha}<br>
          <strong>Hora:</strong> ${obj.Hora || "No definida"}<br>
          <strong>Evento:</strong> ${obj.Evento || "Sin nombre"}<br>
          <strong>Notas:</strong> ${obj.Notas || "Sin notas"}
        `;
        cont.appendChild(divEvt);
      }
    });
  }

  // ===== Exportar funciones públicas =====
  return {
    setToken,
    mostrarAgenda,
    mostrarAgregarEvento,
    mostrarBuscarFecha,
    buscarPorFecha
  };
})();
