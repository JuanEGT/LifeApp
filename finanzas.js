const Finanzas = (() => {
  const FINANZAS_API_URL = "https://script.google.com/macros/s/AKfycbwTF_4IhuQzO3C1pvvNHTusdSWvBjNyRycdLF3AppAxZ9cqHLoZWeldBbaeFS88aHGbXA/exec?sheet=Finanzas";

  // ------------------------
  // Funciones internas
  // ------------------------
  async function cargarFinanzas() {
    try {
      const res = await fetch(FINANZAS_API_URL);
      const data = await res.json();
      renderTablaMovimientos(data);
      renderResumen(data);
    } catch (err) {
      console.error("Error cargando Finanzas:", err);
    }
  }

  async function mostrarFinanzas() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("agendaContainer").style.display = "none";
    document.getElementById("finanzasContainer").style.display = "flex";

    await cargarFinanzas();
  }

  function renderTablaMovimientos(data) {
    const tableBody = document.getElementById("finanzas-table-body");
    tableBody.innerHTML = "";

    data.forEach(mov => {
      const tr = document.createElement("tr");
      const color = mov.Tipo === "Ingreso" ? "text-green-400" :
                    mov.Tipo === "Gasto" ? "text-red-400" : "text-gray-300";
      tr.innerHTML = `
        <td>${mov.Fecha}</td>
        <td>${mov.Tipo}</td>
        <td>${mov.Cantidad}</td>
        <td>${mov.Nombre}</td>
        <td>${mov.MetodoPago}</td>
      `;
      tr.classList.add(color);
      tableBody.appendChild(tr);
    });
  }

  function renderResumen(data) {
    let totalIngresos = 0;
    let totalGastos = 0;

    data.forEach(mov => {
      const cantidad = parseFloat(mov.Cantidad) || 0;
      if (mov.Tipo === "Ingreso") totalIngresos += cantidad;
      if (mov.Tipo === "Gasto") totalGastos += cantidad;
    });

    const saldo = totalIngresos - totalGastos;

    document.getElementById("total-ingresos").textContent = totalIngresos;
    document.getElementById("total-gastos").textContent = totalGastos;
    document.getElementById("saldo").textContent = saldo;
  }

  async function agregarMovimiento(event) {
    event.preventDefault();

    const payload = {
      ID: Date.now().toString(),
      Grupo: document.getElementById("grupo").value,
      Tipo: document.getElementById("tipo").value,
      Fecha: document.getElementById("fecha").value,
      Cantidad: document.getElementById("cantidad").value,
      Nombre: document.getElementById("nombre").value,
      MetodoPago: document.getElementById("metodoPago").value,
      SalarioHora: "",
      HorasTrabajadas: "",
      Propinas: "",
      Bonos: "",
      Impuestos: "",
      IngresoNeto: document.getElementById("cantidad").value,
      TasaInteres: "",
      TasaCrecimiento: "",
      Periodicidad: "-"
    };

    try {
      const res = await fetch(FINANZAS_API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      const result = await res.json();

      if (result.success) {
        cargarFinanzas();
        document.getElementById("form-finanza").reset();
      } else {
        console.error("Error agregando movimiento:", result.error);
      }
    } catch (err) {
      console.error("Error agregando movimiento:", err);
    }
  }

  // ------------------------
  // Inicialización
  // ------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const btnVolverMenuFinanzas = document.getElementById("btnVolverMenuFinanzas");
    if (btnVolverMenuFinanzas) btnVolverMenuFinanzas.addEventListener("click", mostrarMenuPrincipal);

    const formFinanza = document.getElementById("form-finanza");
    if (formFinanza) formFinanza.addEventListener("submit", agregarMovimiento);
  });

  // ===== Exportar funciones públicas =====
  return {
    mostrarFinanzas,
    cargarFinanzas
  };
})();
