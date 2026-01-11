$(document).ready(function () {
  // ==========================================
  // 1. ESTADO INICIAL Y PERSISTENCIA
  // ==========================================

  // Saldo inicial (si no existe, se crea con $21.050)
  let saldo = parseFloat(localStorage.getItem('alke_saldo')) || 21050;

  // Historial de transacciones
  let historial = JSON.parse(localStorage.getItem('alke_historial')) || [
    { fecha: '10/01/2026', desc: 'Saldo Inicial', monto: 21050, tipo: 'ingreso' },
  ];

  // Agenda de Contactos (Lección 6)
  let contactos = JSON.parse(localStorage.getItem('alke_contactos')) || [
    { nombre: 'Juan Pérez', foto: 'https://i.pravatar.cc/150?u=juan' },
    { nombre: 'María García', foto: 'https://i.pravatar.cc/150?u=maria' },
    { nombre: 'Pedro Soto', foto: 'https://i.pravatar.cc/150?u=pedro' },
  ];

  // ==========================================
  // 2. FUNCIONES DE UTILIDAD
  // ==========================================

  const actualizarVistaSaldo = () => {
    if ($('#currentBalance').length) {
      $('#currentBalance').text(`$ ${saldo.toLocaleString('es-CL')}`);
    }
  };

  const registrarMovimiento = (descripcion, monto, tipo) => {
    const nuevaTrans = {
      fecha: new Date().toLocaleDateString(),
      desc: descripcion,
      monto: monto,
      tipo: tipo,
    };
    historial.unshift(nuevaTrans); // Agregar al inicio de la lista
    localStorage.setItem('alke_historial', JSON.stringify(historial));
    localStorage.setItem('alke_saldo', saldo);
  };

  // ==========================================
  // 3. LÓGICA DE LOGIN (VALIDACIÓN JQUERY)
  // ==========================================

  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    const email = $('#userEmail').val();
    const pass = $('#userPass').val();

    // Regex para validar formato de correo
    const filtroEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!filtroEmail.test(email)) {
      alert('Error: Ingrese un correo electrónico válido.');
      return;
    }

    if (email === 'admin@alke.com' && pass === '123456') {
      window.location.href = 'menu.html';
    } else {
      alert('Credenciales incorrectas. (admin@alke.com / 123456)');
    }
  });

  // ==========================================
  // 4. LÓGICA DE DEPÓSITO
  // ==========================================

  $('#depositForm').on('submit', function (e) {
    e.preventDefault();
    let monto = parseFloat($('#amount').val());
    if (monto > 0) {
      saldo += monto;
      registrarMovimiento('Depósito de Fondos', monto, 'ingreso');
      alert('Depósito exitoso');
      window.location.href = 'menu.html';
    }
  });

  // ==========================================
  // 5. LÓGICA DE SENDMONEY (CONTACTOS)
  // ==========================================

  // A. Agregar nuevo contacto
  $('#btnGuardarContacto').on('click', function () {
    const nombre = $('#newName').val();
    if (nombre.trim() !== '') {
      const nuevo = {
        nombre: nombre,
        foto: `https://i.pravatar.cc/150?u=${Math.random()}`,
      };
      contactos.push(nuevo);
      localStorage.setItem('alke_contactos', JSON.stringify(contactos));
      alert('Contacto guardado');
      $('#newName').val('');
      $('.collapse').collapse('hide'); // Cerrar formulario de contacto
    }
  });

  // B. Buscador de contactos con jQuery (Lección 6)
  $('#contactSearch').on('keyup', function () {
    let busqueda = $(this).val().toLowerCase();
    let lista = $('#contactResults').empty();

    if (busqueda.length > 0) {
      let filtrados = contactos.filter((c) => c.nombre.toLowerCase().includes(busqueda));
      filtrados.forEach((c) => {
        lista.append(`
                    <li class="list-group-item bg-dark text-white d-flex align-items-center contact-item border-secondary" style="cursor:pointer">
                        <img src="${c.foto}" class="rounded-circle mr-3" width="35" height="35">
                        <span>${c.nombre}</span>
                    </li>
                `);
      });
    }
  });

  // C. Seleccionar contacto de la lista
  $(document).on('click', '.contact-item', function () {
    let nombre = $(this).find('span').text();
    $('#contactSearch').val(nombre);
    $('#contactResults').empty();
  });

  // D. Procesar transferencia
  $('#sendMoneyForm').on('submit', function (e) {
    e.preventDefault();
    let monto = parseFloat($('#sendAmount').val());
    let destinatario = $('#contactSearch').val();

    if (monto > 0 && monto <= saldo) {
      saldo -= monto;
      registrarMovimiento(`Envío a ${destinatario}`, monto, 'egreso');
      alert('Transferencia completada');
      window.location.href = 'menu.html';
    } else {
      alert('Error: Saldo insuficiente.');
    }
  });

  // ==========================================
  // 6. RENDERIZAR HISTORIAL (PANTALLA TRANSACCIONES)
  // ==========================================

  const renderizarHistorial = () => {
    const tabla = $('#transactionTableBody');
    if (tabla.length) {
      tabla.empty();
      historial.forEach((t) => {
        const claseMonto = t.tipo === 'ingreso' ? 'text-success' : 'text-danger';
        const signo = t.tipo === 'ingreso' ? '+' : '-';
        tabla.append(`
                    <tr class="border-bottom border-secondary">
                        <td>${t.fecha}</td>
                        <td>${t.desc}</td>
                        <td class="text-right ${claseMonto}">${signo} $${t.monto.toLocaleString(
          'es-CL'
        )}</td>
                    </tr>
                `);
      });
    }
  };

  // Inicializar vistas al cargar
  actualizarVistaSaldo();
  renderizarHistorial();
});
