/**
 * ================================================
 * ANALIST.COM - MAIN JAVASCRIPT
 * ================================================
 * Arquivo principal com módulos bem organizados
 * - Navigation: Menu e scroll suave
 * - VisitorCounter: Contador de visitantes
 * - Performance: Otimizações gerais
 */

// ===== UTILIDADES GLOBAIS =====

const Utils = {
  /**
   * Throttle - limita a frequência de execução
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Debounce - aguarda antes de executar
   */
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  /**
   * Anima scroll suave para elemento
   */
  smoothScroll(element, offsetTop = 0, duration = 300) {
    const start = window.pageYOffset;
    const target = element.offsetTop - offsetTop;
    const distance = target - start;
    const startTime = Date.now();

    const scroll = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const ease = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, start + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  },

  /**
   * Encontra elemento
   */
  el(selector) {
    return document.querySelector(selector);
  },

  /**
   * Encontra múltiplos elementos
   */
  elAll(selector) {
    return document.querySelectorAll(selector);
  }
};

// ===== MÓDULO: NAVEGAÇÃO =====

const Navigation = {
  config: {
    navbarSelector: '.navbar',
    navbarCollapseSelector: '.navbar-collapse',
    navLinksSelector: '.navbar-nav .nav-item .nav-link',
    clickScrollSelector: '.click-scroll',
    smoothScrollSelector: '.smoothscroll',
    activeClass: 'active',
    inactiveClass: 'inactive',
    navbarOffset: 94,
    scrollDuration: 300
  },

  sections: [1, 2, 3, 4, 5],

  /**
   * Inicializa o módulo de navegação
   */
  init() {
    this.setupNavbarCollapse();
    this.setupSmoothScroll();
    this.setupScrollDetection();
    this.setupClickScroll();
    this.setInitialState();
  },

  /**
   * Fecha navbar ao clicar em um link
   */
  setupNavbarCollapse() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.navbar-collapse a');
      if (!link) return;

      const navbarCollapse = Utils.el(this.config.navbarCollapseSelector);
      if (navbarCollapse?.classList.contains('show')) {
        // Bootstrap collapse
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: true });
        bsCollapse.hide();
      }
    });
  },

  /**
   * Smooth scroll para links .smoothscroll
   */
  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest(this.config.smoothScrollSelector);
      if (!link) return;

      e.preventDefault();
      const href = link.getAttribute('href');
      const target = Utils.el(href);
      
      if (target) {
        const navHeight = Utils.el(this.config.navbarSelector).offsetHeight;
        Utils.smoothScroll(target, navHeight, this.config.scrollDuration);
      }
    });
  },

  /**
   * Deteta scroll e atualiza menu ativo
   */
  setupScrollDetection() {
    const handleScroll = Utils.throttle(() => {
      this.updateActiveNavLink();
    }, 100);

    window.addEventListener('scroll', handleScroll);
    // Executa uma vez na inicialização
    this.updateActiveNavLink();
  },

  /**
   * Atualiza qual link está ativo no menu
   */
  updateActiveNavLink() {
    const scrollTop = window.pageYOffset;
    const links = Utils.elAll(this.config.navLinksSelector);
    let activeIndex = 0;

    this.sections.forEach((sectionNum, index) => {
      const section = Utils.el(`#section_${sectionNum}`);
      if (!section) return;

      const offsetSection = section.offsetTop - this.config.navbarOffset;
      if (scrollTop + 1 >= offsetSection) {
        activeIndex = index;
      }
    });

    // Remove ativo de todos
    links.forEach(link => {
      link.classList.remove(this.config.activeClass);
      link.classList.add(this.config.inactiveClass);
    });

    // Adiciona ativo ao correto
    if (links[activeIndex]) {
      links[activeIndex].classList.add(this.config.activeClass);
      links[activeIndex].classList.remove(this.config.inactiveClass);
    }
  },

  /**
   * Click scroll para links .click-scroll
   */
  setupClickScroll() {
    const clickLinks = Utils.elAll(this.config.clickScrollSelector);
    
    clickLinks.forEach((link, index) => {
      if (this.sections[index]) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const section = Utils.el(`#section_${this.sections[index]}`);
          if (section) {
            const offsetClick = section.offsetTop - this.config.navbarOffset;
            window.scrollTo({ top: offsetClick, behavior: 'smooth' });
          }
        });
      }
    });
  },

  /**
   * Define estado inicial do menu
   */
  setInitialState() {
    const links = Utils.elAll(this.config.navLinksSelector);
    links.forEach((link, index) => {
      if (index === 0) {
        link.classList.add(this.config.activeClass);
        link.classList.remove(this.config.inactiveClass);
      } else {
        link.classList.add(this.config.inactiveClass);
      }
    });
  }
};

// ===== MÓDULO: CONTADOR DE VISITANTES =====

const VisitorCounter = {
  config: {
    storageKey: 'analist_visitas',
    messageElementId: 'mensagem',
    greetingElementId: 'saudacao',
    initialValue: 2025
  },

  /**
   * Inicializa o contador
   */
  init() {
    this.render();
  },

  /**
   * Obtém ou cria contador
   */
  getCount() {
    const stored = localStorage.getItem(this.config.storageKey);
    return stored ? parseInt(stored, 10) + 1 : this.config.initialValue;
  },

  /**
   * Salva contador
   */
  saveCount(count) {
    localStorage.setItem(this.config.storageKey, count);
  },

  /**
   * Obtém saudação baseada na hora
   */
  getGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return '☀️ Bom dia!';
    } else if (hour < 18) {
      return '🌤️ Boa tarde!';
    } else {
      return '🌙 Boa noite!';
    }
  },

  /**
   * Gera mensagem personalizada
   */
  getMessage(count) {
    if (count % 100 === 0) {
      return `🏆 UAU! Você é o visitante ${count}! Um número histórico!`;
    } else if (count % 10 === 0) {
      return `✨ Visitante ${count}! Número redondo dá sorte!`;
    } else {
      return `🎉 Você é o nosso ${count}º visitante!`;
    }
  },

  /**
   * Renderiza contador na página
   */
  render() {
    const count = this.getCount();
    this.saveCount(count);

    const greetingEl = Utils.el(`#${this.config.greetingElementId}`);
    const messageEl = Utils.el(`#${this.config.messageElementId}`);

    if (greetingEl) {
      greetingEl.textContent = this.getGreeting();
    }

    if (messageEl) {
      messageEl.textContent = this.getMessage(count);
    }
  }
};

// ===== MÓDULO: INICIALIZAÇÃO =====

const App = {
  /**
   * Inicializa aplicação
   */
  init() {
    // Aguarda DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  },

  /**
   * Inicia todos os módulos
   */
  start() {
    console.log('🚀 Iniciando Analist.com');
    
    Navigation.init();
    VisitorCounter.init();
    
    console.log('✅ Aplicação inicializada com sucesso');
  }
};

// Inicia a aplicação
App.init();