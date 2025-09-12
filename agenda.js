// ===================== Agenda.js =====================
const Agenda = (() => {
  // ===================== Configuración =====================
  const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
  const SHEET_NAME = "Agenda";

  let token = null;

  function setToken(newToken) {
    token = newToken;
  }

  // ===================== Funciones de Datos =====================
  async function cargarEventos() {
    if (!token) return [];
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
    try {
      const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
      const data = await resp.json();
      return data.values || [];
    } catch (err) {
      console.error(err);
      document.getElementById("msg").innerText = "Error al cargar eventos";
      return [];
    }
  }

  async function agregarEvento(data) {
    if (!token) return;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
    try {
      await fetch(url, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [data] })
      });
    } catch (err) {
      console.error(err);
      document.getElementById("msg").innerText = "Error al agregar evento";
    }
  }

  async function eliminarEvento(id, values) {
    if (!token) return;
    const filaIndex = values.findIndex(row => row[0] == id);
    if (filaIndex < 1) return;
    const fila = filaIndex + 1;
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${fila}:E?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [["", "", "", "", ""]] })
      });
    } catch (err) {
      console.error(err);
      document.getElementById("msg").innerText = "Error al eliminar evento";
    }
  }

  // ===================== Funciones de UI =====================
  async function mostrarEventos(values) {
    const div = document.getElementById("agenda");
    div.innerHTML = "";
    if (!values || values.length < 2) return;

    const headers = values[0];
    const rows = values.slice(1);

    rows.forEach((r) => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");

      const p = document.createElement("p");
      p.innerHTML = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;

      const delBtn = document.createElement("button");
      delBtn.innerText = "Eliminar";
      delBtn.className = "btn backBtn";
      delBtn.onclick = async () => {
        await eliminarEvento(obj.ID, values);
        const allValues = await cargarEventos();
        mostrarEventos(allValues);
      };

      p.appendChild(delBtn);
      div.appendChild(p);
    });
  }

  async function buscarPorFecha() {
    const fecha = document.getElementById("fechaInput").value;
    if (!fecha) return;

    const values = await cargarEventos();
    if (!values || values.length < 2) return;

    const headers = values[0];
    const rows = values.slice(1);
    const filtrados = rows.filter(r => r[1] === fecha);

    const div = document.getElementById("agenda");
    div.innerHTML = "";

    filtrados.forEach((r) => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");

      const p = document.createElement("p");
      p.innerHTML = `${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;

      const delBtn = document.createElement("button");
      delBtn.innerText = "Eliminar";
      delBtn.className = "btn backBtn";
      delBtn.onclick = async () => {
        await eliminarEvento(obj.ID, values);
        buscarPorFecha();
      };

      p.appendChild(delBtn);
      div.appendChild(p);
    });

    // Botón volver a Agenda
    if (!document.getElementById("backToAgendaFromSearch")) {
      const backBtn = document.createElement("button");
      backBtn.id = "backToAgendaFromSearch";
      backBtn.innerText = "Volver a Agenda";
      backBtn.className = "btn backBtn";
      backBtn.onclick = mostrarAgenda;
      div.appendChild(backBtn);
    }
  }

  function mostrarRecordatorios(values) {
    const cont = document.getElementById("recordatorios");
    cont.innerHTML = "<h3>Próximos eventos</h3>";
    if (!values || values.length < 2) return;

    const headers = values[0];
    const rows = values.slice(1);

    const hoy = new Date();
    const sieteDias = new Date();
    sieteDias.setDate(hoy.getDate() + 7);

    rows.forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");

      const fechaEvento = new Date(obj.Fecha);
      if (fechaEvento >= hoy && fechaEvento <= sieteDias) {
        const divEvt = document.createElement("div");
        divEvt.className = "recordatorioItem";
        divEvt.innerHTML = `
          <strong>Fecha:</strong> ${obj.Fecha}<br>
          <strong>Hora:</strong> ${obj.Hora || "No definida"}<br>
          <strong>Evento:</strong> ${obj.Evento}<br>
          <strong>Notas:</strong> ${obj.Notas || "Sin notas"}
        `;
        cont.appendChild(divEvt);
      }
    });
  }

  function mostrarCalendario(values) {
    const cont = document.getElementById("calendario");
    cont.innerHTML = "<h3>Calendario mensual</h3>";

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const diasMes = new Date(year, month + 1, 0).getDate();
    const rows = [];
    for (let i = 1; i <= diasMes; i++) rows.push(i);

    const eventosPorDia = {};
    if (values && values.length >= 2) {
      const headers = values[0];
      const dataRows = values.slice(1);
      dataRows.forEach(r => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = r[i] || "");

        const partes = obj.Fecha.split("-");
        const fechaEvento = new Date(partes[0], partes[1] - 1, partes[2]);
        if (fechaEvento.getFullYear() === year && fechaEvento.getMonth() === month) {
          eventosPorDia[fechaEvento.getDate()] = true;
        }
      });
    }

    const grid = document.createElement("div");
    grid.className = "calendario-grid";

    rows.forEach(d => {
      const cell = document.createElement("div");
      cell.className = "dia " + (eventosPorDia[d] ? "rojo" : "verde");
      cell.innerText = d;
      grid.appendChild(cell);
    });

    cont.appendChild(grid);
  }

  // ===================== UI de navegación =====================
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
    });
  }

  function mostrarAgregarEvento() {
    document.getElementById("menuButtons").style.display = "none";
    document.getElementById("eventoForm").style.display = "flex";
    document.getElementById("fechaSelector").style.display = "none";
    document.getElementById("agenda").innerHTML = "";
    document.getElementById("msg").innerText = "";

    // Botón Volver a Agenda
    if (!document.getElementById("backToAgendaFromAdd")) {
      const backBtn = document.createElement("button");
      backBtn.id = "backToAgendaFromAdd";
      backBtn.innerText = "Volver a Agenda";
      backBtn.className = "btn backBtn";
      backBtn.onclick = mostrarAgenda;
      document.getElementById("eventoForm").appendChild(backBtn);
    }
  }

  function mostrarBuscarFecha() {
    document.getElementById("menuButtons").style.display = "none";
    document.getElementById("eventoForm").style.display = "none";
    document.getElementById("fechaSelector").style.display = "flex";
    document.getElementById("agenda").innerHTML = "";
    document.getElementById("msg").innerText = "";
  }

  // ===================== Exportar funciones públicas =====================
  return {
    setToken,
    cargarEventos,
    agregarEvento,
    eliminarEvento,
    mostrarEventos,
    buscarPorFecha,
    mostrarRecordatorios,
    mostrarCalendario,
    mostrarAgenda,
    mostrarAgregarEvento,
    mostrarBuscarFecha
  };
})();
