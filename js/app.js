/* ============================================================================
   APP.JS - APLICAÇÃO COM NAVBAR CORRIGIDA (SEM THEME MANAGER)
   ============================================================================ */

class App {
  constructor() {
    console.log('🚀 Inicializando analist.com');
    this.init();
  }

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

      console.log('✅ Aplicação inicializada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
    }
  }

  // ========== NAVIGATION ==========
  setupNavigation() {
    console.log('🔧 Configurando Navigation...');

    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    const links = document.querySelectorAll('[data-nav-link]');
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');

    console.log('📍 Toggle encontrado:', !!toggle);
    console.log('📍 Menu encontrado:', !!menu);
    console.log('📍 Links encontrados:', links.length);
    console.log('📍 Dropdowns encontrados:', dropdownTriggers.length);

    if (!toggle || !menu) {
      console.error('❌ Navbar toggle ou menu não encontrado!');
      return;
    }

    // Toggle menu mobile
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      console.log('📱 Menu clicado. Novo estado:', newState);

      toggle.setAttribute('aria-expanded', newState);

      if (newState) {
        menu.classList.add('active');
      } else {
        menu.classList.remove('active');
      }
    });

    // Fechar menu ao clicar em link
    links.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        console.log('🔗 Link clicado:', index);

        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
      });
    });

    /*// Dropdown toggle
    dropdownTriggers.forEach((trigger, index) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔽 Dropdown clicado:', index);
        
        const wrapper = trigger.closest('.dropdown-wrapper');
        if (wrapper) {
          const isActive = wrapper.classList.contains('active');
          */

    // Dropdown toggle (somente mobile)
    dropdownTriggers.forEach((trigger, index) => {
      trigger.addEventListener('click', (e) => {
        // Detecta se está em mobile (largura < 768px)
        if (window.innerWidth >= 768) return;

        e.preventDefault();
        e.stopPropagation();

        console.log('🔽 Dropdown clicado (mobile):', index);

        const wrapper = trigger.closest('.dropdown-wrapper');
        if (wrapper) {
          const isActive = wrapper.classList.contains('active');

          // Fechar outros dropdowns
          document.querySelectorAll('.dropdown-wrapper.active').forEach(w => {
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
        }
      });
    });


    // Fechar outros dropdowns
    document.querySelectorAll('.dropdown-wrapper.active').forEach(w => {
      if (w !== wrapper) {
        w.classList.remove('active');
      }
    });

    /*// Toggle dropdown atual
    if (isActive) {
      wrapper.classList.remove('active');
    } else {
      wrapper.classList.add('active');
    }
    
    console.log('✓ Dropdown toggled');
  }
});
});*/

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      const isNavbar = e.target.closest('.navbar');
      const isMenu = e.target.closest('[data-nav-menu]');
      const isToggle = e.target.closest('[data-nav-toggle]');

      if (!isNavbar && !isMenu && !isToggle) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
      }
    });

    console.log('✅ Navigation configurado com sucesso');
  }

  // ========== SMOOTH SCROLL ==========
  setupSmoothScroll() {
    const smoothScrollLinks = document.querySelectorAll('[data-smooth-scroll]');
    console.log('📍 Links com smooth scroll encontrados:', smoothScrollLinks.length);

    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const href = link.getAttribute('href');
        const target = document.querySelector(href);

        console.log('📍 Smooth scroll para:', href, '| Alvo encontrado:', !!target);

        if (target) {
          // Fechar menu se aberto
          const menu = document.querySelector('[data-nav-menu]');
          const toggle = document.querySelector('[data-nav-toggle]');
          if (menu && toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            menu.classList.remove('active');
          }

          // Scroll suave
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========== VISITOR COUNTER ==========
  setupVisitorCounter() {
    const STORAGE_KEY = 'analist_visitors';
    const counter = document.querySelector('[data-visitor-counter]');

    if (!counter) {
      console.warn('⚠️ Elemento [data-visitor-counter] não encontrado');
      return;
    }

    const getCount = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseInt(stored, 10) + 1 : 2025;
      } catch (e) {
        console.warn('⚠️ localStorage erro:', e);
        return 2025;
      }
    };

    const saveCount = (count) => {
      try {
        localStorage.setItem(STORAGE_KEY, count);
      } catch (e) {
        console.warn('⚠️ Não foi possível salvar contador');
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

    if (!sections.length) {
      console.warn('⚠️ Nenhuma seção com [data-section] encontrada');
      return;
    }

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

    if (!marqueeWrapper) {
      console.warn('⚠️ Marquee wrapper não encontrado');
      return;
    }

    const marqueeContent = marqueeWrapper.querySelector('.marquee-content');

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

    // Mobile: sempre rodando
    marqueeWrapper.addEventListener('touchstart', () => {
      marqueeContent.style.animationPlayState = 'running';
    });

    marqueeWrapper.addEventListener('touchend', () => {
      marqueeContent.style.animationPlayState = 'running';
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

// Garantir animation delays nas palavras do hero
document.addEventListener('DOMContentLoaded', function () {
  const heroWords = document.querySelectorAll('.hero__word');
  heroWords.forEach((word, index) => {
    word.style.animationDelay = `${index * 3}s`;
  });
  console.log('✅ Hero animation delays aplicados');
});