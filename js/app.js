/* ============================================================================
   APP.JS - APLICAÇÃO MINIMALISTA
   ============================================================================ */

class App {
  constructor() {
    console.log('🚀 Inicializando analist.com');
    this.init();
  }

  init() {
    try {
      this.setupNavigation();
      this.setupSmoothScroll();
      this.setupVisitorCounter();
      this.setupScrollAnimations();
      this.setupMarquee();
      this.setupThemeToggle();
      
      console.log('✅ Aplicação inicializada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
    }
  }

  // ========== NAVIGATION ==========
  setupNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    const links = document.querySelectorAll('[data-nav-link]');
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');

    if (!toggle || !menu) return;

    // Toggle menu mobile
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      menu.classList.toggle('active');
    });

    // Fechar menu ao clicar em link
    links.forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
      });
    });

    // Dropdown
    dropdownTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const wrapper = trigger.closest('.dropdown-wrapper');
        if (wrapper) {
          wrapper.classList.toggle('active');
        }
      });
    });
  }

  // ========== SMOOTH SCROLL ==========
  setupSmoothScroll() {
    document.querySelectorAll('[data-smooth-scroll]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========== VISITOR COUNTER ==========
  setupVisitorCounter() {
    const STORAGE_KEY = 'analist_visitors';
    const counter = document.querySelector('[data-visitor-counter]');
    
    if (!counter) return;

    const getCount = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseInt(stored, 10) + 1 : 2025;
      } catch (e) {
        return 2025;
      }
    };

    const saveCount = (count) => {
      try {
        localStorage.setItem(STORAGE_KEY, count);
      } catch (e) {
        console.warn('⚠️ localStorage não disponível');
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

    counter.innerHTML = `
      <div style="margin-bottom: 8px; font-size: var(--font-size-sm);">${getGreeting()}</div>
      <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary);">
        👋 Bem-vindo! Você é o ${count.toLocaleString('pt-BR')}º visitante.
      </div>
    `;
  }

  // ========== SCROLL ANIMATIONS ==========
  setupScrollAnimations() {
    const sections = document.querySelectorAll('[data-section]');
    
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  // ========== MARQUEE ANIMATION ==========
  setupMarquee() {
    const marqueeWrapper = document.querySelector('[data-marquee]');
    
    if (!marqueeWrapper) return;

    const marqueeContent = marqueeWrapper.querySelector('.marquee-content');
    
    if (!marqueeContent) return;

    // Pause/Play ao hover (desktop)
    marqueeWrapper.addEventListener('mouseenter', () => {
      marqueeContent.style.animationPlayState = 'paused';
    });

    marqueeWrapper.addEventListener('mouseleave', () => {
      marqueeContent.style.animationPlayState = 'running';
    });

    // Mobile: sempre rodando
    marqueeWrapper.addEventListener('touchstart', () => {
      marqueeContent.style.animationPlayState = 'running';
    });

    marqueeWrapper.addEventListener('touchend', () => {
      marqueeContent.style.animationPlayState = 'running';
    });
  }

  // ========== THEME TOGGLE ==========
  setupThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = current === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      
      try {
        localStorage.setItem('analist-theme', newTheme);
      } catch (e) {
        console.warn('⚠️ localStorage não disponível');
      }

      this.syncVismeTheme(newTheme);
    });
  }

  // ========== SINCRONIZAR VISME COM TEMA ==========
  syncVismeTheme(theme) {
    const vismeFrames = document.querySelectorAll('.visme_d iframe');
    
    vismeFrames.forEach(frame => {
      try {
        if (frame.contentDocument) {
          const bgColor = theme === 'dark' ? '#131d2a' : '#ffffff';
          const textColor = theme === 'dark' ? '#f0ebe6' : '#1a1a1a';
          
          frame.contentDocument.body.style.backgroundColor = bgColor;
          frame.contentDocument.body.style.color = textColor;
        }
      } catch (e) {
        console.warn('⚠️ Não é possível acessar iframe do Visme');
      }
    });
  }
}

// ========== INICIALIZAÇÃO ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}
