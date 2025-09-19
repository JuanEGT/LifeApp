// ===================== Agenda.js =====================
const Agenda = (() => {
  const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
  const SHEET_NAME = "Agenda";
  let token = null;

  function setToken(newToken) {
    console.log("[Agenda] Token seteado:", newToken);
    token = newToken;
  }

  // ===== DATOS =====
  async function cargarEventos() {
    console.log("[Agenda] Cargando eventos...");
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`;
      const resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });

      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

      const data = await resp.json();
      console.log("[Agenda] Eventos cargados:", data.values ? data.values.length - 1 : 0);
      return Array.isArray(data.values) ? data.values : [];
    } catch (err) {
      console.error("[Agenda] Error al cargar eventos:", err);
      const msg = document.getElementById("msg");
      if (msg) msg.innerText = "Error al cargar eventos";
      return [];
    }
  }

  async function agregarEvento(data) {
    console.log("[Agenda] Agregando evento:", data);
    if (!Array.isArray(data) || data.length < 5) {
      console.error("[Agenda] Datos inválidos para agregar evento:", data);
      const msg = document.getElementById("msg");
      if (msg) msg.innerText = "Error: datos del evento incompletos";
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
      console.log("[Agenda] Evento agregado correctamente");
      return true;
    } catch (err) {
      console.error("[Agenda] Error al agregar evento:", err);
      const msg = document.getElementById("msg");
      if (msg) msg.innerText = "Error al agregar evento";
      return false;
    }
  }

  async function eliminarEvento(id, values) {
    console.log("[Agenda] Eliminando evento ID:", id);
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
      console.log("[Agenda] Evento eliminado correctamente");
      return true;
    } catch (err) {
      console.error("[Agenda] Error al eliminar evento:", err);
      const msg = document.getElementById("msg");
      if (msg) msg.innerText = "Error al eliminar evento";
      return false;
    }
  }

  // ===== UI =====
  function mostrarAgenda() {
    console.log("[Agenda] Mostrando Agenda");

    const mainMenu = document.getElementById("mainMenu");
    const agendaContainer = document.getElementById("agendaContainer");
    const menuButtons = document.getElementById("menuButtons");
    const eventoForm = document.getElementById("eventoForm");
    const fechaSelector = document.getElementById("fechaSelector");
    const agendaDiv = document.getElementById("agenda");
    const msg = document.getElementById("msg");

    if (mainMenu) mainMenu.style.display = "none";
    if (agendaContainer) agendaContainer.style.display = "flex";
    if (menuButtons) menuButtons.style.display = "flex";
    if (eventoForm) eventoForm.style.display = "none";
    if (fechaSelector) fechaSelector.style.display = "none";
    if (agendaDiv) agendaDiv.innerHTML = "";
    if (msg) msg.innerText = "";

    cargarEventos().then(values => {
      mostrarRecordatorios(values);
      mostrarCalendario(values);

      const btnAgregar = document.getElementById("btnAgregarEvento");
      if (btnAgregar) btnAgregar.onclick = mostrarAgregarEvento;

      const btnBuscar = document.getElementById("btnBuscarFecha");
      if (btnBuscar) btnBuscar.onclick = mostrarBuscarFecha;

      const btnVolver = document.getElementById("btnVolverMenu");
      if (btnVolver) btnVolver.onclick = mostrarMenuPrincipal;

      const btnBuscarPorFecha = document.getElementById("btnBuscarPorFecha");
      if (btnBuscarPorFecha) btnBuscarPorFecha.onclick = buscarPorFecha;
    });
  }

  function mostrarCalendario(values) {
    const cont = document.getElementById("calendario");
    if (!cont) return;
    cont.innerHTML = "<h3>Calendario mensual</h3>";

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const diasMes = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, 40px)";
    grid.style.gap = "2px";
    grid.style.textAlign = "center";

    diasSemana.forEach(dia => {
      const cell = document.createElement("div");
      cell.innerText = dia;
      cell.style.fontWeight = "bold";
      grid.appendChild(cell);
    });

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

    for (let i = 0; i < firstDayOfWeek; i++) grid.appendChild(document.createElement("div"));

    for (let d = 1; d <= diasMes; d++) {
      const cell = document.createElement("div");
      cell.innerText = d;
      cell.className = "dia " + (eventosPorDia[d] ? "rojo" : "verde");
      grid.appendChild(cell);
    }

    cont.appendChild(grid);
  }

  function mostrarAgregarEvento() {
    console.log("[Agenda] Mostrando formulario Agregar Evento");

    const menuButtons = document.getElementById("menuButtons");
    const fechaSelector = document.getElementById("fechaSelector");
    const agendaDiv = document.getElementById("agenda");
    const msg = document.getElementById("msg");
    const form = document.getElementById("eventoForm");

    if (menuButtons) menuButtons.style.display = "none";
    if (fechaSelector) fechaSelector.style.display = "none";
    if (agendaDiv) agendaDiv.innerHTML = "";
    if (msg) msg.innerText = "";
    if (form) form.style.display = "flex";

    form.onsubmit = async (e) => {
      e.preventDefault();
      const data = [
        Date.now(),
        form.Fecha.value,
        form.Hora.value,
        form.Evento.value,
        form.Notas.value
      ];
      if (await agregarEvento(data)) {
        form.reset();
        mostrarAgenda();
      }
    };

    let backBtn = document.getElementById("backToAgendaFromAdd");
    if (!backBtn) {
      backBtn = document.createElement("button");
      backBtn.id = "backToAgendaFromAdd";
      backBtn.className = "btn backBtn";
      backBtn.innerText = "Volver a Agenda";
      backBtn.style.display = "block";
      backBtn.style.marginTop = "10px";
      backBtn.onclick = mostrarAgenda;
      form.appendChild(backBtn);
    } else {
      backBtn.style.display = "block";
    }
  }

  function mostrarBuscarFecha() {
    console.log("[Agenda] Mostrando selector de fecha");
    const menuButtons = document.getElementById("menuButtons");
    const eventoForm = document.getElementById("eventoForm");
    const agendaDiv = document.getElementById("agenda");
    const msg = document.getElementById("msg");
    const fechaSelector = document.getElementById("fechaSelector");

    if (menuButtons) menuButtons.style.display = "none";
    if (eventoForm) eventoForm.style.display = "none";
    if (agendaDiv) agendaDiv.innerHTML = "";
    if (msg) msg.innerText = "";
    if (fechaSelector) fechaSelector.style.display = "flex";

    let backBtn = document.getElementById("backToAgendaFromSearch");
    if (!backBtn) {
      backBtn = document.createElement("button");
      backBtn.id = "backToAgendaFromSearch";
      backBtn.className = "btn backBtn";
      backBtn.innerText = "Volver a Agenda";
      backBtn.style.display = "block";
      backBtn.style.marginTop = "10px";
      backBtn.onclick = mostrarAgenda;
      fechaSelector.appendChild(backBtn);
    } else {
      backBtn.style.display = "block";
    }
  }

  async function buscarPorFecha() {
    console.log("[Agenda] Buscando eventos por fecha...");
    const fechaInput = document.getElementById("fechaInput");
    if (!fechaInput || !fechaInput.value) return;

    const fecha = fechaInput.value;
    const allValues = await cargarEventos();
    if (!allValues || allValues.length < 2) return;

    const headers = allValues[0];
    const rows = allValues.slice(1).filter(r => r[1] === fecha);
    const div = document.getElementById("agenda");
    if (!div) return;
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
  }

  function mostrarRecordatorios(values) {
    console.log("[Agenda] Mostrando recordatorios");
    const cont = document.getElementById("recordatorios");
    if (!cont) return;
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

  function mostrarMenuPrincipal() {
    console.log("[Agenda] Volviendo al menú principal");
    const mainMenu = document.getElementById("mainMenu");
    const agendaContainer = document.getElementById("agendaContainer");
    if (agendaContainer) agendaContainer.style.display = "none";
    if (mainMenu) mainMenu.style.display = "flex";
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
