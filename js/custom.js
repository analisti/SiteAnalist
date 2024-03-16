
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
  let contador = localStorage.getItem('visitas') || 0;
  const mensagemElemento = document.getElementById('mensagem');

  function atualizarContador() {
    mensagemElemento.textContent = `Você é o nosso ${++contador}º visitante!`;
    localStorage.setItem('visitas', contador);
  }

  atualizarContador();
});




