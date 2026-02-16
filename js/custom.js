/**
 * custom.js
 * Scripts específicos ou experimentais
 * NÃO colocar lógica principal aqui
 */
const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
  const trigger = window.innerHeight * 0.85;

  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < trigger) {
      el.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
