// ===================== Agenda.js =====================
const Agenda = (() => {
  const SPREADSHEET_ID = "1CMnA-3Ch5Ac1LLP8Hgph15IeeH7Dlvcj0IvX51mLzKU";
  const SHEET_NAME = "Agenda";
  let token = null;

  function setToken(newToken) { token = newToken; }

  // ===== DATOS =====
  async function cargarEventos() {
    if (!token) return [];
    try {
      const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?majorDimension=ROWS`, {
        headers: { Authorization: "Bearer " + token }
      });
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
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`, {
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
    const filaIndex = values.findIndex(r => r[0] == id);
    if (filaIndex < 1) return;
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${filaIndex+1}:E?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [["", "", "", "", ""]] })
      });
    } catch (err) {
      console.error(err);
      document.getElementById("msg").innerText = "Error al eliminar evento";
    }
  }

  // ===== UI =====
  function mostrarAgenda() {
    document.getElementById("mainMenu").style.display="none";
    document.getElementById("agendaContainer").style.display="flex";
    document.getElementById("menuButtons").style.display="flex";
    document.getElementById("eventoForm").style.display="none";
    document.getElementById("fechaSelector").style.display="none";
    document.getElementById("agenda").innerHTML="";
    document.getElementById("msg").innerText="";

    cargarEventos().then(values=>{
      mostrarRecordatorios(values);
      mostrarCalendario(values);
      conectarFormAgregarEvento(); // conectar el submit del form
    });
  }

  function mostrarAgregarEvento() {
    document.getElementById("menuButtons").style.display="none";
    document.getElementById("eventoForm").style.display="flex";
    document.getElementById("fechaSelector").style.display="none";
    document.getElementById("agenda").innerHTML="";
    document.getElementById("msg").innerText="";
  }

  function mostrarBuscarFecha() {
    document.getElementById("menuButtons").style.display="none";
    document.getElementById("eventoForm").style.display="none";
    document.getElementById("fechaSelector").style.display="flex";
    document.getElementById("agenda").innerHTML="";
    document.getElementById("msg").innerText="";
  }

  async function buscarPorFecha() {
    const fecha = document.getElementById("fechaInput").value;
    if(!fecha) return;

    const values = await cargarEventos();
    if(!values || values.length < 2) return;

    const headers = values[0];
    const rows = values.slice(1).filter(r => r[1]===fecha);

    const div = document.getElementById("agenda");
    div.innerHTML = "";

    rows.forEach(r=>{
      const obj = {};
      headers.forEach((h,i)=> obj[h]=r[i]||"");
      const p = document.createElement("p");
      p.innerHTML=`${obj.Fecha} ${obj.Hora} - ${obj.Evento} (${obj.Notas})`;

      const delBtn = document.createElement("button");
      delBtn.innerText="Eliminar";
      delBtn.className="btn backBtn";
      delBtn.onclick = async ()=>{
        await eliminarEvento(obj.ID, values);
        buscarPorFecha();
      };

      p.appendChild(delBtn);
      div.appendChild(p);
    });

    if(!document.getElementById("backToAgendaFromSearch")){
      const backBtn = document.createElement("button");
      backBtn.id="backToAgendaFromSearch";
      backBtn.className="btn backBtn";
      backBtn.innerText="Volver a Agenda";
      backBtn.onclick=mostrarAgenda;
      div.appendChild(backBtn);
    }
  }

  function mostrarRecordatorios(values) {
    const cont = document.getElementById("recordatorios");
    cont.innerHTML="<h3>Próximos eventos</h3>";
    if(!values || values.length<2) return;
    const headers = values[0];
    values.slice(1).forEach(r=>{
      const obj = {};
      headers.forEach((h,i)=>obj[h]=r[i]||"");
      const fechaEvento = new Date(obj.Fecha);
      const hoy = new Date();
      const sieteDias = new Date(); sieteDias.setDate(hoy.getDate()+7);
      if(fechaEvento>=hoy && fechaEvento<=sieteDias){
        const divEvt = document.createElement("div");
        divEvt.className="recordatorioItem";
        divEvt.innerHTML=`
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
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Domingo

  // Mapeo nombres de días
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Crear grid
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(7, 40px)";
  grid.style.gap = "2px";
  grid.style.textAlign = "center";

  // Agregar nombres de días
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
      const partes = obj.Fecha.split("-");
      const fechaEvento = new Date(partes[0], partes[1] - 1, partes[2]);
      if (fechaEvento.getFullYear() === year && fechaEvento.getMonth() === month) {
        eventosPorDia[fechaEvento.getDate()] = true;
      }
    });
  }

  // Celdas vacías para el offset inicial
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyCell = document.createElement("div");
    grid.appendChild(emptyCell);
  }

  // Agregar días del mes
  for (let d = 1; d <= diasMes; d++) {
    const cell = document.createElement("div");
    cell.innerText = d;
    cell.className = "dia " + (eventosPorDia[d] ? "rojo" : "verde");
    grid.appendChild(cell);
  }

  cont.appendChild(grid);
}

  // ===== Conectar formulario interno =====
  function conectarFormAgregarEvento(){
    const form = document.getElementById("eventoForm");
    if(form){
      form.onsubmit = async (e)=>{
        e.preventDefault();
        if(!token) return;
        const data = [
          Date.now(),
          form.Fecha.value,
          form.Hora.value,
          form.Evento.value,
          form.Notas.value
        ];
        await agregarEvento(data);
        form.reset();
        mostrarAgenda();
      };
    }
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
