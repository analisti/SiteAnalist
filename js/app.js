/* ============================================================================
   APP.JS - REFACTORED (SEM THEME MANAGER)
   Boas práticas: encapsulamento, caching de seletores, helpers reutilizáveis,
   event delegation onde aplicável, tratamento de erros e logs consistentes.
   ============================================================================ */

class App {
  constructor() {
    // Mensagem inicial e inicialização
    console.log('🚀 Inicializando analist.com');
    this._initConstants();
    this.init();
  }

  // ---------- CONFIGURAÇÕES E CONSTANTES ----------
  _initConstants() {
    // Seletores usados pela aplicação (centralizados para fácil manutenção)
    this.SELECTORS = {
      NAV_TOGGLE: '[data-nav-toggle]',
      NAV_MENU: '[data-nav-menu]',
      NAV_LINKS: '[data-nav-link]',
      DROPDOWN_TRIGGER: '[data-dropdown-trigger]',
      NAVBAR: '.navbar',
      VISITOR_COUNTER: '[data-visitor-counter]',
      SMOOTH_SCROLL: '[data-smooth-scroll]',
      SECTION: '[data-section]',
      MARQUEE: '[data-marquee]',
      MARQUEE_CONTENT: '.marquee-content',
      HERO_WORD: '.hero__word'
    };

    // Chaves e valores reutilizáveis
    this.STORAGE_KEY = 'analist_visitors';
    this.MOBILE_BREAKPOINT = 768; // px
    this.SCROLL_OBSERVER_OPTIONS = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    // Cache de elementos que serão usados frequentemente
    this._cache = new Map();
  }

  // ---------- UTILITÁRIOS ----------
  _qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  _qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  _isMobile() {
    return window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  _safeParseInt(value, fallback = 0) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? fallback : n;
  }

  _setAttr(el, name, value) {
    if (!el) return;
    el.setAttribute(name, String(value));
  }

  _addClass(el, className) {
    if (!el) return;
    el.classList.add(className);
  }

  _removeClass(el, className) {
    if (!el) return;
    el.classList.remove(className);
  }

  _toggleClass(el, className, force) {
    if (!el) return;
    el.classList.toggle(className, force);
  }

  // ---------- INICIALIZAÇÃO ----------
  init() {
    try {
      this.setupNavigation();
      console.log('✅ Navigation inicializado');

      this.setupSmoothScroll();
      console.log('✅ Smooth Scroll inicializado');

      this.setupVisitorCounter();
      console.log('✅ Visitor Counter inicializado');

      this.setupScrollAnimations();
      console.log('✅ Scroll Animations inicializado');

      this.setupMarquee();
      console.log('✅ Marquee inicializado');

      this._applyHeroAnimationDelays();
      console.log('✅ Hero animation delays aplicados');

      console.log('✅ Aplicação inicializada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
    }
  }

  // ========== NAVIGATION ==========
  setupNavigation() {
    console.log('🔧 Configurando Navigation...');

    const toggle = this._qs(this.SELECTORS.NAV_TOGGLE);
    const menu = this._qs(this.SELECTORS.NAV_MENU);
    const links = this._qsa(this.SELECTORS.NAV_LINKS);
    const dropdownTriggers = this._qsa(this.SELECTORS.DROPDOWN_TRIGGER);

    console.log('📍 Toggle encontrado:', !!toggle);
    console.log('📍 Menu encontrado:', !!menu);
    console.log('📍 Links encontrados:', links.length);
    console.log('📍 Dropdowns encontrados:', dropdownTriggers.length);

    if (!toggle || !menu) {
      console.error('❌ Navbar toggle ou menu não encontrado!');
      return;
    }

    // Função para fechar menu (reutilizável)
    const closeMenu = () => {
      this._setAttr(toggle, 'aria-expanded', 'false');
      this._removeClass(menu, 'active');
    };

    // Função para abrir menu
    const openMenu = () => {
      this._setAttr(toggle, 'aria-expanded', 'true');
      this._addClass(menu, 'active');
    };

    // Toggle menu mobile
    const onToggleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      console.log('📱 Menu clicado. Novo estado:', newState);

      this._setAttr(toggle, 'aria-expanded', newState);

      this._toggleClass(menu, 'active', newState);
    };

    toggle.addEventListener('click', onToggleClick);

    // Fechar menu ao clicar em link
    links.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        console.log('🔗 Link clicado:', index);
        closeMenu();
      });
    });

    // Dropdown toggle (somente mobile) - usar event delegation por performance
    // Observação: mantemos a função de dropdown para cada trigger conforme original,
    // mas com lógica mais clara e sem código duplicado.
    dropdownTriggers.forEach((trigger, index) => {
      trigger.addEventListener('click', (e) => {
        if (!this._isMobile()) return;

        e.preventDefault();
        e.stopPropagation();

        console.log('🔽 Dropdown clicado (mobile):', index);

        const wrapper = trigger.closest('.dropdown-wrapper');
        if (!wrapper) return;

        const isActive = wrapper.classList.contains('active');

        // Fechar outros dropdowns
        this._qsa('.dropdown-wrapper.active').forEach(w => {
          if (w !== wrapper) {
            w.classList.remove('active');
          }
        });

        // Toggle dropdown atual
        if (isActive) {
          wrapper.classList.remove('active');
        } else {
          wrapper.classList.add('active');
        }

        console.log('✓ Dropdown toggled (mobile)');
      });
    });

    // Fechar menu ao clicar fora (delegation)
    document.addEventListener('click', (e) => {
      const isNavbar = e.target.closest(this.SELECTORS.NAVBAR);
      const isMenu = e.target.closest(this.SELECTORS.NAV_MENU);
      const isToggle = e.target.closest(this.SELECTORS.NAV_TOGGLE);

      if (!isNavbar && !isMenu && !isToggle) {
        closeMenu();
        // Também fechar dropdowns abertos
        this._qsa('.dropdown-wrapper.active').forEach(w => w.classList.remove('active'));
      }
    });

    // Fechar dropdowns ao redimensionar para desktop (evita estados inconsistentes)
    window.addEventListener('resize', () => {
      if (!this._isMobile()) {
        // Remove todos os estados mobile
        this._qsa('.dropdown-wrapper.active').forEach(w => w.classList.remove('active'));
      }
    });

    console.log('✅ Navigation configurado com sucesso');
  }

  // ========== SMOOTH SCROLL ==========
  setupSmoothScroll() {
    const smoothScrollLinks = this._qsa(this.SELECTORS.SMOOTH_SCROLL);
    console.log('📍 Links com smooth scroll encontrados:', smoothScrollLinks.length);

    if (!smoothScrollLinks.length) return;

    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) {
          console.warn('⚠️ Smooth scroll ignorado (href inválido):', href);
          return;
        }

        const target = document.querySelector(href);

        console.log('📍 Smooth scroll para:', href, '| Alvo encontrado:', !!target);

        if (target) {
          // Fechar menu se aberto
          const menu = this._qs(this.SELECTORS.NAV_MENU);
          const toggle = this._qs(this.SELECTORS.NAV_TOGGLE);
          if (menu && toggle) {
            this._setAttr(toggle, 'aria-expanded', 'false');
            this._removeClass(menu, 'active');
          }

          // Scroll suave
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========== VISITOR COUNTER ==========
  setupVisitorCounter() {
    const counter = this._qs(this.SELECTORS.VISITOR_COUNTER);

    if (!counter) {
      console.warn('⚠️ Elemento [data-visitor-counter] não encontrado');
      return;
    }

    const getCount = () => {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        // Se existir, incrementa; caso contrário, usa baseline 2025
        return stored ? this._safeParseInt(stored, 2025) + 1 : 2025;
      } catch (e) {
        console.warn('⚠️ localStorage erro:', e);
        return 2025;
      }
    };

    const saveCount = (count) => {
      try {
        localStorage.setItem(this.STORAGE_KEY, String(count));
      } catch (e) {
        console.warn('⚠️ Não foi possível salvar contador:', e);
      }
    };

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return '☀️ Bom dia!';
      if (hour < 18) return '🌤️ Boa tarde!';
      return '🌙 Boa noite!';
    };

    const count = getCount();
    saveCount(count);

    // Render minimal markup; estilos inline mantidos conforme original
    counter.innerHTML = `
      <div style="margin-bottom: 8px; font-size: var(--font-size-sm);">${getGreeting()}</div>
      <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary);">
        👋 Bem-vindo! Você é o ${count.toLocaleString('pt-BR')}º visitante.
      </div>
    `;
  }

  // ========== SCROLL ANIMATIONS ==========
  setupScrollAnimations() {
    const sections = this._qsa(this.SELECTORS.SECTION);

    if (!sections.length) {
      console.warn('⚠️ Nenhuma seção com [data-section] encontrada');
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, this.SCROLL_OBSERVER_OPTIONS);

    sections.forEach(section => observer.observe(section));
  }

  // ========== MARQUEE ANIMATION ==========
  setupMarquee() {
    const marqueeWrapper = this._qs(this.SELECTORS.MARQUEE);

    if (!marqueeWrapper) {
      console.warn('⚠️ Marquee wrapper não encontrado');
      return;
    }

    const marqueeContent = marqueeWrapper.querySelector(this.SELECTORS.MARQUEE_CONTENT);

    if (!marqueeContent) {
      console.warn('⚠️ Marquee content não encontrado');
      return;
    }

    // Pause/Play ao hover (desktop)
    marqueeWrapper.addEventListener('mouseenter', () => {
      marqueeContent.style.animationPlayState = 'paused';
    });

    marqueeWrapper.addEventListener('mouseleave', () => {
      marqueeContent.style.animationPlayState = 'running';
    });

    // Mobile: garantir que continue rodando (touch events mantêm running)
    marqueeWrapper.addEventListener('touchstart', () => {
      marqueeContent.style.animationPlayState = 'running';
    }, { passive: true });

    marqueeWrapper.addEventListener('touchend', () => {
      marqueeContent.style.animationPlayState = 'running';
    }, { passive: true });
  }

  // ========== HERO ANIMATION DELAYS ==========
  _applyHeroAnimationDelays() {
    // Aplica delays nas palavras do hero (mantendo comportamento original)
    const heroWords = this._qsa(this.SELECTORS.HERO_WORD);
    heroWords.forEach((word, index) => {
      word.style.animationDelay = `${index * 3}s`;
    });
  }
}

/* ========== INICIALIZAÇÃO ÚNICA E DETERMINÍSTICA ========== */
(function bootstrap() {
  const start = () => new App();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
