$(document).ready(function () {
  // --- 1. ESTADO Y PERSISTENCIA ---
  let saldo = parseFloat(localStorage.getItem('alke_saldo')) || 21050;
  let historial = JSON.parse(localStorage.getItem('alke_historial')) || [
    { fecha: '10/01/2026', desc: 'Saldo Inicial', monto: 21050, tipo: 'ingreso' },
  ];
  let contactos = JSON.parse(localStorage.getItem('alke_contactos')) || [
    {
      nombre: 'Juan Pérez',
      telefono: '+56912345678',
      cbu: '0000012345678901234567',
      foto: 'https://i.pravatar.cc/150?u=1',
    },
  ];

  // --- 2. FUNCIONES GLOBALES ---
  const actualizarInterfaz = () => {
    if ($('#currentBalance').length)
      $('#currentBalance').text(`$ ${saldo.toLocaleString('es-CL')}`);
    renderizarTabla();
  };

  const registrarMovimiento = (desc, monto, tipo) => {
    historial.unshift({ fecha: new Date().toLocaleDateString(), desc, monto, tipo });
    localStorage.setItem('alke_historial', JSON.stringify(historial));
    localStorage.setItem('alke_saldo', saldo);
  };

  // --- 3. LOGIN (Validación Correo con jQuery) ---
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    const email = $('#userEmail').val();
    const pass = $('#userPass').val();
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!regexEmail.test(email)) {
      alert('Por favor, ingrese un correo válido.');
      return;
    }

    if (email === 'admin@alke.com' && pass === '123456') {
      window.location.href = 'menu.html';
    } else {
      alert('Credenciales incorrectas (admin@alke.com / 123456)');
    }
  });

  // --- 4. DEPÓSITO ---
  $('#depositForm').on('submit', function (e) {
    e.preventDefault();
    let monto = parseFloat($('#amount').val());
    if (monto > 0) {
      saldo += monto;
      registrarMovimiento('Depósito recibido', monto, 'ingreso');
      alert('Dinero cargado con éxito');
      window.location.href = 'menu.html';
    }
  });

  // --- 5. SEND MONEY (Contactos con Nombre, Tel, CBU) ---
  $('#btnGuardarContacto').on('click', function () {
    const nombre = $('#newName').val();
    const tel = $('#newPhone').val();
    const cbu = $('#newCBU').val();

    if (nombre && cbu) {
      contactos.push({
        nombre,
        telefono: tel,
        cbu,
        foto: `https://i.pravatar.cc/150?u=${Math.random()}`,
      });
      localStorage.setItem('alke_contactos', JSON.stringify(contactos));
      alert('Contacto guardado');
      $('#newName, #newPhone, #newCBU').val('');
      $('.collapse').collapse('hide');
    } else {
      alert('Nombre y CBU son obligatorios');
    }
  });

  $('#contactSearch').on('keyup', function () {
    let b = $(this).val().toLowerCase();
    let l = $('#contactResults').empty();
    if (b.length > 0) {
      contactos
        .filter((c) => c.nombre.toLowerCase().includes(b))
        .forEach((c) => {
          l.append(`
                    <li class="list-group-item bg-dark text-white d-flex align-items-center contact-item border-secondary">
                        <img src="${c.foto}" class="rounded-circle mr-3" width="40">
                        <div><strong>${c.nombre}</strong><br><small class="text-muted">CBU: ${c.cbu}</small></div>
                    </li>`);
        });
    }
  });

  $(document).on('click', '.contact-item', function () {
    $('#contactSearch').val($(this).find('strong').text());
    $('#contactResults').empty();
  });

  $('#sendMoneyForm').on('submit', function (e) {
    e.preventDefault();
    let m = parseFloat($('#sendAmount').val());
    let c = $('#contactSearch').val();
    if (m > 0 && m <= saldo) {
      saldo -= m;
      registrarMovimiento(`Envío a ${c}`, m, 'egreso');
      alert('Transferencia realizada');
      window.location.href = 'menu.html';
    } else {
      alert('Fondos insuficientes');
    }
  });

  function renderizarTabla() {
    let t = $('#transactionTableBody');
    if (t.length) {
      t.empty();
      historial.forEach((h) => {
        t.append(`<tr class="border-bottom border-secondary">
                    <td>${h.fecha}</td><td>${h.desc}</td>
                    <td class="text-right ${h.tipo === 'ingreso' ? 'text-success' : 'text-danger'}">
                    ${h.tipo === 'ingreso' ? '+' : '-'} $${h.monto.toLocaleString()}</td></tr>`);
      });
    }
  }
  actualizarInterfaz();
});
