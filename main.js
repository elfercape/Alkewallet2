$(document).ready(function () {
  // ==========================================
  // 1. ESTADO INICIAL Y PERSISTENCIA (LocalStorage)
  // ==========================================

  // Saldo inicial predeterminado de $21.050
  let saldo = parseFloat(localStorage.getItem('alke_saldo')) || 21050;

  // Historial de movimientos
  let historial = JSON.parse(localStorage.getItem('alke_historial')) || [
    { fecha: '10/01/2026', desc: 'Carga inicial Alke', monto: 21050, tipo: 'ingreso' },
  ];

  // Agenda de contactos expandida (Nombre, Teléfono, CBU)
  let contactos = JSON.parse(localStorage.getItem('alke_contactos')) || [
    {
      nombre: 'Juan Pérez',
      telefono: '+56912345678',
      cbu: '0000012345678901234567',
      foto: 'https://i.pravatar.cc/150?u=juan',
    },
    {
      nombre: 'María García',
      telefono: '+56987654321',
      cbu: '0000098765432109876543',
      foto: 'https://i.pravatar.cc/150?u=maria',
    },
  ];

  // ==========================================
  // 2. FUNCIONES REUTILIZABLES (Core)
  // ==========================================

  const actualizarVistas = () => {
    // Actualiza el saldo en el Dashboard
    if ($('#currentBalance').length) {
      $('#currentBalance').text(`$ ${saldo.toLocaleString('es-CL')}`);
    }
    renderizarHistorial();
  };

  const registrarTransaccion = (descripcion, monto, tipo) => {
    const nuevaTrans = {
      fecha: new Date().toLocaleDateString(),
      desc: descripcion,
      monto: monto,
      tipo: tipo,
    };
    historial.unshift(nuevaTrans); // El más reciente primero
    localStorage.setItem('alke_historial', JSON.stringify(historial));
    localStorage.setItem('alke_saldo', saldo);
  };

  // ==========================================
  // 3. LÓGICA DE LOGIN Y SALIDA
  // ==========================================

  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    const email = $('#userEmail').val();
    const pass = $('#userPass').val();

    // jQuery para validar formato de correo (Regex)
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!regexEmail.test(email)) {
      alert('Error: El formato del correo electrónico no es válido.');
      return;
    }

    // Credenciales correctas
    if (email === 'admin@alke.com' && pass === '123456') {
      window.location.href = 'menu.html';
    } else {
      alert('Credenciales incorrectas. Pruebe con admin@alke.com / 123456');
    }
  });

  // Evento para el nuevo Botón Salir
  $('#btnSalir').on('click', function () {
    if (confirm('¿Desea cerrar su sesión de Alke Wallet?')) {
      // Solo redirigimos para mantener los datos en LocalStorage para la próxima vez
      window.location.href = 'index.html';
    }
  });

  // ==========================================
  // 4. GESTIÓN DE CONTACTOS (SendMoney)
  // ==========================================

  // Agregar nuevo contacto con Nombre, Teléfono y CBU
  $('#btnGuardarContacto').on('click', function () {
    const nombre = $('#newName').val();
    const tel = $('#newPhone').val();
    const cbu = $('#newCBU').val();

    if (nombre && cbu) {
      const nuevo = {
        nombre: nombre,
        telefono: tel,
        cbu: cbu,
        foto: `https://i.pravatar.cc/150?u=${Math.random()}`,
      };
      contactos.push(nuevo);
      localStorage.setItem('alke_contactos', JSON.stringify(contactos));

      alert('Contacto guardado en su agenda.');
      $('#newName, #newPhone, #newCBU').val(''); // Limpiar campos
      $('.collapse').collapse('hide'); // Cerrar panel
    } else {
      alert('El Nombre y el CBU son obligatorios.');
    }
  });

  // Buscador en tiempo real (Lección 6)
  $('#contactSearch').on('keyup', function () {
    let busqueda = $(this).val().toLowerCase();
    let lista = $('#contactResults').empty();

    if (busqueda.length > 0) {
      let filtrados = contactos.filter((c) => c.nombre.toLowerCase().includes(busqueda));
      filtrados.forEach((c) => {
        lista.append(`
                    <li class="list-group-item bg-dark text-white d-flex align-items-center contact-item border-secondary" style="cursor:pointer">
                        <img src="${c.foto}" class="rounded-circle mr-3" width="40" height="40">
                        <div>
                            <strong class="d-block">${c.nombre}</strong>
                            <small class="text-muted">CBU: ${c.cbu}</small>
                        </div>
                    </li>`);
      });
    }
  });

  // Seleccionar un contacto de la lista
  $(document).on('click', '.contact-item', function () {
    let nombreSeleccionado = $(this).find('strong').text();
    $('#contactSearch').val(nombreSeleccionado);
    $('#contactResults').empty();
  });

  // ==========================================
  // 5. TRANSACCIONES (Depósito y Envío)
  // ==========================================

  // Formulario de Depósito
  $('#depositForm').on('submit', function (e) {
    e.preventDefault();
    let monto = parseFloat($('#amount').val());
    if (monto > 0) {
      saldo += monto;
      registrarTransaccion('Depósito de Fondos', monto, 'ingreso');
      alert('Dinero cargado exitosamente.');
      window.location.href = 'menu.html';
    }
  });

  // Formulario de Envío
  $('#sendMoneyForm').on('submit', function (e) {
    e.preventDefault();
    let monto = parseFloat($('#sendAmount').val());
    let destinatario = $('#contactSearch').val();

    if (monto > 0 && monto <= saldo) {
      saldo -= monto;
      registrarTransaccion(`Envío a ${destinatario}`, monto, 'egreso');
      alert(`Transferencia enviada a ${destinatario}`);
      window.location.href = 'menu.html';
    } else {
      alert('Saldo insuficiente para realizar la operación.');
    }
  });

  // ==========================================
  // 6. RENDERIZADO DE HISTORIAL (Transactions.html)
  // ==========================================

  function renderizarHistorial() {
    const tabla = $('#transactionTableBody');
    if (tabla.length) {
      tabla.empty();
      historial.forEach((t) => {
        const color = t.tipo === 'ingreso' ? 'text-success' : 'text-danger';
        const signo = t.tipo === 'ingreso' ? '+' : '-';
        tabla.append(`
                    <tr class="border-bottom border-secondary">
                        <td>${t.fecha}</td>
                        <td>${t.desc}</td>
                        <td class="text-right ${color}">${signo} $${t.monto.toLocaleString(
          'es-CL'
        )}</td>
                    </tr>
                `);
      });
    }
  }

  // Inicialización al cargar la página
  actualizarVistas();
});
