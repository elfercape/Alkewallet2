$(document).ready(function () {
  // Saldo inicial
  let saldo = 21050;

  // Validación Login
  $('#formLogin').on('submit', function (e) {
    e.preventDefault();
    window.location.href = 'menu.html';
  });

  // Lógica de Depósito
  $('#btnConfirmDeposit').click(function () {
    let monto = parseFloat($('#inputMonto').val());
    if (monto > 0) {
      alert('Depósito exitoso de ₹' + monto);
      window.location.href = 'menu.html';
    }
  });

  // Efecto de carga suave (jQuery)
  $('.container').hide().fadeIn(600);
});
