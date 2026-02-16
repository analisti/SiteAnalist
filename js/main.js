/* ============================================================================
   MAIN.JS - ORQUESTRADOR DE APLICAÇÃO
   ============================================================================ */

// ========== THEME MANAGER ==========
class ThemeManager {
  constructor() {
    this.THEME_KEY = 'analist-theme';
    this.LIGHT = 'light';
    this.DARK = 'dark';
    this.init();
  }

  init() {
    this.detectSystemPreference();
    this.setupThemeToggle();
  }

  detectSystemPreference() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    if (savedTheme) {
      this.setTheme(savedTheme, false);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme(this.DARK, false);
    } else {
      this.setTheme(this.LIGHT, false);
    }
  }

  setTheme(theme, withTransition = true) {
    if (withTransition) this.triggerTransition();
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.updateThemeIcon(theme);
  }

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || this.LIGHT;
    const newTheme = currentTheme === this.LIGHT ? this.DARK : this.LIGHT;
    this.setTheme(newTheme);
  }

  updateThemeIcon(theme) {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) toggle.setAttribute('aria-pressed', theme === this.DARK);
  }

  setupThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', () => this.toggle());
  }

  triggerTransition() {
    document.body.classList.add('theme-transitioning');
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 500);
  }
}

// ========== NAVIGATION MANAGER ==========
class NavigationManager {
  constructor() {
    this.navToggle = document.querySelector('[data-nav-toggle]');
    this.navMenu = document.querySelector('[data-nav-menu]');
    this.navLinks = document.querySelectorAll('[data-nav-link]');
    this.dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');
    this.init();
  }

  init() {
    this.setupMobileToggle();
    this.setupNavLinks();
    this.setupDropdowns();
    this.setupSmoothScroll();
  }

  setupMobileToggle() {
    if (!this.navToggle || !this.navMenu) return;
    this.navToggle.addEventListener('click', () => {
      const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
      this.navToggle.setAttribute('aria-expanded', !isExpanded);
      this.navMenu.classList.toggle('active');
    });
  }

  setupNavLinks() {
    this.navLinks.forEach(link => link.addEventListener('click', () => this.closeMenu()));
  }

  setupDropdowns() {
    this.dropdownTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', !isExpanded);
        trigger.parentElement.classList.toggle('active');
      });
    });
  }

  setupSmoothScroll() {
    document.querySelectorAll('[data-smooth-scroll]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          this.closeMenu();
        }
      });
    });
  }

  closeMenu() {
    if (this.navToggle && this.navMenu && window.innerWidth < 768) {
      this.navToggle.setAttribute('aria-expanded', 'false');
      this.navMenu.classList.remove('active');
    }
  }
}

// ========== SCROLL ANIMATION ==========
class ScrollAnimationManager {
  constructor() {
    this.wordInterval = null;
    this.init();
  }

  init() {
    this.observeElements();
    this.observeWordAnimation();
  }

  observeElements() {
    const options = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, options);

    document.querySelectorAll('[data-section]').forEach(section => {
      section.classList.add('fade-in');
      observer.observe(section);
    });
  }

  observeWordAnimation() {
    const headline = document.querySelector('[data-animated-headline]');
    if (!headline) return;

    const words = headline.querySelectorAll('[data-word]');
    if (!words.length) return;

    let currentIndex = 0;
    this.wordInterval = setInterval(() => {
      words.forEach(word => word.classList.remove('active'));
      words[currentIndex].classList.add('active');
      currentIndex = (currentIndex + 1) % words.length;
    }, 3000);
  }

  destroy() {
    if (this.wordInterval) clearInterval(this.wordInterval);
  }
}

// ========== VISITOR COUNTER ==========
class VisitorCounter {
  constructor() {
    this.STORAGE_KEY = 'analist_visitors';
    this.init();
  }

  init() {
    this.render();
  }

  getCount() {
    let stored = localStorage.getItem(this.STORAGE_KEY);
    let count = stored ? parseInt(stored, 10) + 1 : 2025;
    localStorage.setItem(this.STORAGE_KEY, count);
    return count;
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Bom dia!';
    if (hour < 18) return '🌤️ Boa tarde!';
    return '🌙 Boa noite!';
  }

  getMessage(count) {
    if (count % 100 === 0) return `🏆 Você é o visitante número ${count.toLocaleString('pt-BR')}! Que marco!`;
    return `👋 Bem-vindo! Você é o ${count.toLocaleString('pt-BR')}º visitante.`;
  }

  render() {
    const counter = document.querySelector('[data-visitor-counter]');
    if (!counter) return;

    const count = this.getCount();

    counter.innerHTML = `
      <div style="margin-bottom: 8px;">${this.getGreeting()}</div>
      <div style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary);">
        ${this.getMessage(count)}
      </div>
    `;
  }
}

// ========== FORM HANDLER ==========
class FormHandler {
  constructor() {
    this.form = document.querySelector('[data-contact-form]');
    this.activeMessage = null;
    if (this.form) this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    console.log('Mensagem:', data);

    // Simular envio para backend
    // fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })

    this.form.reset();
    this.showSuccess();
  }

  showSuccess() {
    if (this.activeMessage) this.activeMessage.remove();

    const message = document.createElement('div');
    this.activeMessage = message;
    message.textContent = '✓ Mensagem enviada com sucesso!';
    message.style.cssText = `
      background: var(--color-success);
      color: white;
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
    `;
    this.form.parentElement.insertBefore(message, this.form);

    setTimeout(() => {
      message.remove();
      this.activeMessage = null;
    }, 3000);
  }
}

// ========== 3D TILT EFFECT ==========
class TiltEffect {
  constructor() {
    this.elements = document.querySelectorAll('[data-3d-element]');
    this.init();
  }

  init() {
    this.elements.forEach(el => {
      el.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      el.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    });
  }

  handleMouseMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * 10;
    const rotateY = ((rect.width / 2 - x) / (rect.width / 2)) * 10;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  handleMouseLeave(e) {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  }
}

// ========== APP INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando analist.com');

  new ThemeManager();
  new NavigationManager();
  new ScrollAnimationManager();
  new VisitorCounter();
  new FormHandler();
  new TiltEffect();

  console.log('✅ Aplicação inicializada com sucesso');
});

// ========== PERFORMANCE ==========
window.addEventListener('load', () => {
  // Lazy load images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          obs.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  }
});
