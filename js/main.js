/* ============================================================================
   MAIN.JS - ORQUESTRADOR DE APLICAÇÃO (SEM THEME MANAGER)
   ============================================================================ */

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
    console.log('📱 Inicializando Navigation Manager');
    this.setupMobileToggle();
    this.setupNavLinks();
    this.setupDropdowns();
    this.setupSmoothScroll();
  }

  setupMobileToggle() {
    if (!this.navToggle) return;

    this.navToggle.addEventListener('click', () => {
      const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
      this.navToggle.setAttribute('aria-expanded', !isExpanded);
      this.navMenu.classList.toggle('active');
    });
  }

  setupNavLinks() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });
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
    if (this.navToggle && window.innerWidth < 768) {
      this.navToggle.setAttribute('aria-expanded', 'false');
      this.navMenu.classList.remove('active');
    }
  }
}

// ========== SCROLL ANIMATION MANAGER ==========
class ScrollAnimationManager {
  constructor() {
    console.log('✨ Inicializando Scroll Animation Manager');
    this.init();
  }

  init() {
    this.observeElements();
  }

  observeElements() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    document.querySelectorAll('[data-section]').forEach(section => {
      if (!section.classList.contains('in-view')) {
        observer.observe(section);
      }
    });
  }
}

// ========== VISITOR COUNTER ==========
class VisitorCounter {
  constructor() {
    this.STORAGE_KEY = 'analist_visitors';
    console.log('👥 Inicializando Visitor Counter');
    this.init();
  }

  init() {
    this.render();
  }

  getCount() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? parseInt(stored, 10) + 1 : 2025;
  }

  saveCount(count) {
    localStorage.setItem(this.STORAGE_KEY, count);
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Bom dia!';
    if (hour < 18) return '🌤️ Boa tarde!';
    return '🌙 Boa noite!';
  }

  getMessage(count) {
    if (count % 100 === 0) {
      return `🏆 Você é o visitante número ${count.toLocaleString('pt-BR')}! Que marco!`;
    }
    return `👋 Bem-vindo! Você é o ${count.toLocaleString('pt-BR')}º visitante.`;
  }

  render() {
    const counter = document.querySelector('[data-visitor-counter]');
    if (!counter) {
      console.warn('⚠️ Elemento [data-visitor-counter] não encontrado');
      return;
    }

    const count = this.getCount();
    this.saveCount(count);

    counter.innerHTML = `
      <div style="margin-bottom: 8px; font-size: var(--font-size-sm);">${this.getGreeting()}</div>
      <div style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary);">
        ${this.getMessage(count)}
      </div>
    `;
  }
}

// ========== FORM HANDLER ==========
class FormHandler {
  constructor() {
    this.form = document.querySelector('[data-contact-form]');
    if (this.form) {
      console.log('📝 Inicializando Form Handler');
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    console.log('📧 Formulário enviado:', data);
    
    // Aqui você enviaria para um backend
    // fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })

    this.form.reset();
    this.showSuccess();
  }

  showSuccess() {
    const message = document.createElement('div');
    message.textContent = '✓ Mensagem enviada com sucesso!';
    message.style.cssText = `
      background: var(--color-success);
      color: white;
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
      animation: slideInUp 0.4s ease-out;
    `;
    
    this.form.parentElement.insertBefore(message, this.form);
    
    setTimeout(() => {
      message.style.animation = 'slideInDown 0.4s ease-out';
      setTimeout(() => message.remove(), 400);
    }, 3000);
  }
}

// ========== 3D TILT EFFECT ==========
class TiltEffect {
  constructor() {
    this.elements = document.querySelectorAll('[data-3d-element]');
    if (this.elements.length > 0) {
      console.log('🎯 Inicializando Tilt Effect');
      this.init();
    }
  }

  init() {
    this.elements.forEach(element => {
      element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      element.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    });
  }

  handleMouseMove(e) {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / centerY * 8;
    const rotateY = (centerX - x) / centerX * 8;

    element.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;
  }

  handleMouseLeave(e) {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  }
}

// ========== APP INITIALIZATION ==========
function initializeApp() {
  console.log('🚀 Inicializando analist.com');

  new NavigationManager();
  new ScrollAnimationManager();
  new VisitorCounter();
  new FormHandler();
  new TiltEffect();

  console.log('✅ Aplicação inicializada com sucesso');
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// ========== PERFORMANCE - LAZY LOAD ==========
window.addEventListener('load', () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  }
});