
(function ($) {

  "use strict";

  // MENU
  $('.navbar-collapse a').on('click', function () {
    $(".navbar-collapse").collapse('hide');
  });

  // CUSTOM LINK
  $('.smoothscroll').click(function () {
    var el = $(this).attr('href');
    var elWrapped = $(el);
    var header_height = $('.navbar').height();

    scrollToDiv(elWrapped, header_height);
    return false;

    function scrollToDiv(element, navheight) {
      var offset = element.offset();
      var offsetTop = offset.top;
      var totalScroll = offsetTop - navheight;

      $('body,html').animate({
        scrollTop: totalScroll
      }, 300);
    }
  });

})(window.jQuery);

// Contador

document.addEventListener('DOMContentLoaded', function () {
      let contador = parseInt(localStorage.getItem('visitas')) || 2025;
      const mensagemElemento = document.getElementById('mensagem');

      function saudacao() {
        const hora = new Date().getHours();
        if (hora < 12) return "☀️ Bom dia";
        if (hora < 18) return "🌤️ Boa tarde";
        return "🌙 Boa noite";
      }

      function gerarMensagem(numero) {
        if (numero % 100 === 0) {
          return `🏆 UAU! Você é o visitante ${numero}! Um número histórico!`;
        } else if (numero % 10 === 0) {
          return `✨ Visitante ${numero}! Número redondo dá sorte!`;
        } else {
          return `🎉 Você é o nosso ${numero}º visitante!`;
        }
      }

      function atualizarContador() {
        contador++;
        localStorage.setItem('visitas', contador);

        const mensagemFinal = `
          ${saudacao()}!<br><br>
          ${gerarMensagem(contador)}
        `;

        mensagemElemento.innerHTML = mensagemFinal;
      }

      atualizarContador();
    });




