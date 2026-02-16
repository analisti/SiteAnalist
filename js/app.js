/* ============================================================================
   APP.JS - APLICAÇÃO MINIMALISTA (SEM DEPENDÊNCIAS)
   ============================================================================ */

class App {
  constructor() {
    this.init();
  }

  // ================= INIT =================
  init() {
    this.setupMarquee();
    console.log('🚀 Inicializando analist.com');
    
    this.setupNavigation();
    this.setupSmoothScroll();
    this.setupVisitorCounter();
    this.setupScrollAnimations();
    this.setupThemeToggle();
    
    console.log('✅ Aplicação inicializada com sucesso');
  }

  // ================= MARQUEE =================
  setupMarquee() {
    const marqueeWrapper = document.querySelector('[data-marquee]');
    if (!marqueeWrapper) return;

    const marqueeContent = marqueeWrapper.querySelector('.marquee-content');
    if (!marqueeContent) return;

    // Pause/Play ao hover
    marqueeWrapper.addEventListener('mouseenter', () => {
      marqueeContent.style.animationPlayState = 'paused';
    });
    marqueeWrapper.addEventListener('mouseleave', () => {
      marqueeContent.style.animationPlayState = 'running';
    });

    // Mobile: manter rodando no touch
    marqueeWrapper.addEventListener('touchstart', () => {
      marqueeContent.style.animationPlayState = 'running';
    });
    marqueeWrapper.addEventListener('touchend', () => {
      marqueeContent.style.animationPlayState = 'running';
    });
  }

  // ================= NAVIGATION =================
  setupNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    const links = document.querySelectorAll('[data-nav-link]');
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        menu.classList.toggle('active');
      });

      links.forEach(link => {
        link.addEventListener('click', () => {
          toggle.setAttribute('aria-expanded', 'false');
          menu.classList.remove('active');
        });
      });
    }

    dropdownTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const wrapper = trigger.closest('.dropdown-wrapper');
        if (wrapper) wrapper.classList.toggle('active');
      });
    });
  }

  // ================= SMOOTH SCROLL =================
  setupSmoothScroll() {
    document.querySelectorAll('[data-smooth-scroll]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ================= VISITOR COUNTER =================
  setupVisitorCounter() {
    const STORAGE_KEY = 'analist_visitors';
    const counter = document.querySelector('[data-visitor-counter]');
    if (!counter) return;

    let count = localStorage.getItem(STORAGE_KEY);
    count = count ? parseInt(count, 10) + 1 : 2025;
    localStorage.setItem(STORAGE_KEY, count);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? '☀️ Bom dia!' : hour < 18 ? '🌤️ Boa tarde!' : '🌙 Boa noite!';

    counter.innerHTML = `
      <div style="margin-bottom: 8px; font-size: var(--font-size-sm);">${greeting}</div>
      <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary);">
        👋 Bem-vindo! Você é o ${count.toLocaleString('pt-BR')}º visitante.
      </div>
    `;
  }

  // ================= SCROLL ANIMATIONS =================
  setupScrollAnimations() {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(section => observer.observe(section));
  }

  // ================= THEME TOGGLE =================
  setupThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = current === 'light' ? 'dark' : 'light';

      // Adicionar transição suave
      document.body.classList.add('theme-transitioning');
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 500);

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('analist-theme', newTheme);

      // Sincronizar visme, se houver
      this.syncVismeTheme(newTheme);
    });
  }

  syncVismeTheme(theme) {
    const vismeFrames = document.querySelectorAll('.visme_d iframe');
    vismeFrames.forEach(frame => {
      if (frame.contentDocument) {
        const bgColor = theme === 'dark' ? '#131d2a' : '#ffffff';
        const textColor = theme === 'dark' ? '#f0ebe6' : '#1a1a1a';
        frame.contentDocument.body.style.backgroundColor = bgColor;
        frame.contentDocument.body.style.color = textColor;
      }
    });
  }
}

// ================= INICIALIZAÇÃO =================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
