/**
 * APP.JS — ANALIST.COM
 *
 * DEPENDÊNCIAS:
 *   theme-manager.js deve ser carregado antes deste arquivo.
 *   import { themeManager } from './theme-manager.js';
 *
 * MÓDULOS:
 *   Navigation     — drawer mobile com aria, dropdown, overlay
 *   SmoothScroll   — scroll para âncoras com offset do header
 *   StaggerIndex   — atribui --stagger-index aos filhos de .stagger-reveal
 *   ScrollFallback — IntersectionObserver para browsers sem scroll-driven CSS
 *   Ticker         — pausa/resume do marquee (enhancement do CSS)
 *   HeroWords      — aplica --word-delay nas palavras do hero
 *   VisitorGreet   — saudação por hora do dia (sem contador fake)
 *   CursorTracker  — move .cursor-dot e .cursor-ring com requestAnimationFrame
 *   MagneticEffect — efeito magnético em elementos [data-magnetic]
 *   ThemeSync      — reage ao CustomEvent do ThemeManager
 */

'use strict';

/* ─────────────────────────────────────────────────
   LOGGER — zero ruído em produção
───────────────────────────────────────────────── */
const isDev = window.location.hostname === 'localhost'
           || window.location.hostname === '127.0.0.1'
           || window.location.hostname === '';

const log = {
  info:  (...a) => isDev && console.info ('[App]', ...a),
  warn:  (...a) => isDev && console.warn ('[App]', ...a),
  error: (...a) =>          console.error('[App]', ...a),
};

/* ─────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Debounce — evita chamadas excessivas em resize/scroll */
function debounce(fn, ms = 150) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

/** Atribui --stagger-index aos filhos diretos de um elemento */
function assignStaggerIndex(parent, base = 0) {
  if (!parent) return;
  Array.from(parent.children).forEach((child, i) => {
    child.style.setProperty('--stagger-index', base + i);
  });
}

/* ─────────────────────────────────────────────────
   MÓDULO: NAVIGATION
   
   Alinhado com layout.css:
   - Drawer usa aria-hidden / clip-path (não .active)
   - Overlay usa .is-visible
   - Toggle usa aria-expanded
   - Dropdown: hover no desktop (CSS), click no mobile (JS)
───────────────────────────────────────────────── */
function initNavigation(signal) {

  const toggle  = qs('[data-nav-toggle]');
  const drawer  = qs('.navbar__drawer');
  const overlay = qs('.navbar__overlay');
  const header  = qs('.header');

  if (!toggle || !drawer) {
    log.warn('Navigation: toggle ou drawer não encontrado.');
    return;
  }

  const isOpen = () => drawer.getAttribute('aria-hidden') === 'false';

  const openDrawer = () => {
    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    overlay?.classList.add('is-visible');
    document.body.style.overflow = 'hidden'; /* trava scroll do body */
    toggle.setAttribute('aria-label', 'Fechar menu');
  };

  const closeDrawer = () => {
    drawer.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    overlay?.classList.remove('is-visible');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-label', 'Abrir menu');
    /* Fecha todos os dropdowns mobile */
    qsa('.dropdown-wrapper.is-open', drawer).forEach(w => closeDropdown(w));
  };

  /* ── Toggle ────────────────────────────────────── */
  toggle.addEventListener('click', () => {
    isOpen() ? closeDrawer() : openDrawer();
  }, { signal });

  /* ── Overlay fecha o drawer ─────────────────────── */
  overlay?.addEventListener('click', closeDrawer, { signal });

  /* ── Tecla Escape fecha o drawer ───────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      closeDrawer();
      toggle.focus();
    }
  }, { signal });

  /* ── Links do drawer fecham ao clicar ─────────── */
  drawer.addEventListener('click', (e) => {
    const link = e.target.closest('.navbar__drawer-link');
    if (link && !link.dataset.dropdownTrigger) {
      closeDrawer();
    }
  }, { signal });

  /* ── Dropdowns ─────────────────────────────────── */
  const openDropdown = (wrapper) => {
    wrapper.classList.add('is-open');
    const btn = qs('[data-dropdown-trigger]', wrapper);
    btn?.setAttribute('aria-expanded', 'true');
    const sub = qs('.navbar__submenu', wrapper);
    sub?.removeAttribute('hidden');
  };

  const closeDropdown = (wrapper) => {
    wrapper.classList.remove('is-open');
    const btn = qs('[data-dropdown-trigger]', wrapper);
    btn?.setAttribute('aria-expanded', 'false');
    const sub = qs('.navbar__submenu', wrapper);
    sub?.setAttribute('hidden', '');
  };

  /* Clique em trigger abre/fecha no mobile.
     No desktop, o CSS cuida via :hover / :focus-within. */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-dropdown-trigger]');
    if (!trigger) return;

    /* Só JS no mobile — desktop usa CSS hover */
    if (window.innerWidth > 700) return;

    const wrapper = trigger.closest('.dropdown-wrapper');
    if (!wrapper) return;

    const opened = wrapper.classList.contains('is-open');

    /* Fecha outros dropdowns abertos */
    qsa('.dropdown-wrapper.is-open').forEach(w => {
      if (w !== wrapper) closeDropdown(w);
    });

    opened ? closeDropdown(wrapper) : openDropdown(wrapper);
  }, { signal });

  /* ── Click fora fecha dropdowns desktop ───────── */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-wrapper')) {
      qsa('.dropdown-wrapper.is-open').forEach(closeDropdown);
    }
  }, { signal });

  /* ── Resize: fecha drawer e dropdowns ─────────── */
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 700) {
      closeDrawer();
      qsa('.dropdown-wrapper.is-open').forEach(closeDropdown);
    }
  }, 200), { signal });

  /* ── Aria-current na página atual ─────────────── */
  const current = window.location.pathname;
  qsa('.navbar__link, .navbar__drawer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === current || href === current.replace(/\/$/, ''))) {
      link.setAttribute('aria-current', 'page');
    }
  });

  log.info('Navigation pronto.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: SMOOTH SCROLL
   
   Respeita o offset do header fixo.
   Usa `scrollIntoView` com comportamento nativo.
───────────────────────────────────────────────── */
function initSmoothScroll(signal) {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-smooth-scroll], a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#' || !href.startsWith('#')) return;

    const target = qs(href);
    if (!target) return;

    e.preventDefault();

    /* Fecha drawer mobile se estiver aberto */
    const drawer = qs('.navbar__drawer');
    if (drawer?.getAttribute('aria-hidden') === 'false') {
      drawer.setAttribute('aria-hidden', 'true');
      drawer.classList.remove('is-open');
      qs('[data-nav-toggle]')?.setAttribute('aria-expanded', 'false');
      qs('.navbar__overlay')?.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    /* Offset do header sticky */
    const header = qs('.header');
    const offset = header ? header.offsetHeight + 8 : 0;

    const top = target.getBoundingClientRect().top
              + window.scrollY
              - offset;

    window.scrollTo({ top, behavior: 'smooth' });

    /* Foca o alvo para acessibilidade */
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

  }, { signal });

  log.info('Smooth scroll pronto.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: STAGGER INDEX
   
   Atribui --stagger-index a filhos de:
   - .stagger-reveal
   - .stagger-list
   - .cards-grid (para reveal sequencial)
   - service cards
───────────────────────────────────────────────── */
function initStaggerIndex() {
  /* Grupos com stagger automático */
  qsa('.stagger-reveal, .stagger-list').forEach(parent => {
    assignStaggerIndex(parent);
  });

  /* Cards de serviço: stagger no index para reveal via scroll-driven */
  qsa('.service-card, .stat-card, .feature-card').forEach((card, i) => {
    card.style.setProperty('--stagger-index', i);
  });

  /* Cards no bento grid */
  qsa('.bento__item').forEach((item, i) => {
    item.style.setProperty('--stagger-index', i);
  });

  log.info('Stagger index atribuído.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: SCROLL FALLBACK
   
   Para browsers sem suporte a scroll-driven animations
   (Firefox sem flag, Safari < 18).
   
   NÃO substitui o CSS — é enhancement progressivo.
   Só ativa quando @supports não passa.
───────────────────────────────────────────────── */
function initScrollFallback(signal) {
  /* Detecta suporte a scroll-driven animations */
  const supportsScrollDriven = CSS.supports('animation-timeline', 'scroll()');

  if (supportsScrollDriven) {
    log.info('Scroll-driven CSS nativo ativo. Fallback JS desnecessário.');
    return;
  }

  log.info('Sem suporte a scroll-driven. Ativando IntersectionObserver fallback.');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('in-view');

      /* Para stagger: aplica com delay baseado no --stagger-index */
      const idx = parseInt(el.style.getPropertyValue('--stagger-index') || '0', 10);
      if (idx > 0) {
        el.style.animationDelay = `${idx * 80}ms`;
      }

      observer.unobserve(el);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });

  /* Observa todos os elementos com classes de reveal */
  const revealSelectors = [
    '.reveal', '.reveal-wipe', '.reveal-right', '.reveal-left',
    '.reveal-emerge', '.card-reveal', '.stat-reveal',
    '.stagger-reveal > *', '.stagger-list > *',
  ].join(', ');

  qsa(revealSelectors).forEach(el => observer.observe(el));

  /* Cleanup ao destruir */
  signal.addEventListener('abort', () => observer.disconnect());

  log.info('Scroll fallback ativo.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: TICKER
   
   O CSS já pausa via:
   .ticker-container:hover .ticker-track { animation-play-state: paused }
   
   Este módulo só adiciona suporte a toque e
   resolve o gap de browsers que ignoram :hover no mobile.
───────────────────────────────────────────────── */
function initTicker(signal) {
  qsa('.ticker-container').forEach(container => {
    const track = qs('.ticker-track', container);
    if (!track) return;

    /* Touch: pausa ao segurar, resume ao soltar */
    container.addEventListener('touchstart', () => {
      track.style.animationPlayState = 'paused';
    }, { signal, passive: true });

    container.addEventListener('touchend', () => {
      track.style.animationPlayState = 'running';
    }, { signal, passive: true });

    container.addEventListener('touchcancel', () => {
      track.style.animationPlayState = 'running';
    }, { signal, passive: true });
  });

  log.info('Ticker pronto.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: HERO WORDS
   
   Atribui --word-delay em cada .hero__word.
   Alinhado com o @keyframes word-cycle do animate.css:
   cada palavra tem duration de 9s / (total de palavras).
   O delay é index * (9s / total).
───────────────────────────────────────────────── */
function initHeroWords() {
  const words = qsa('.hero__word');
  if (!words.length) return;

  const total    = words.length;
  const duration = 9; /* segundos — sincronizado com word-cycle no animate.css */

  words.forEach((word, i) => {
    /* --word-duration: duração total do ciclo */
    word.style.setProperty('--word-duration', `${total * duration}s`);
    /* --word-delay: offset do início de cada palavra */
    word.style.setProperty('--word-delay', `${i * duration}s`);
    /* Stagger index para compatibilidade */
    word.style.setProperty('--stagger-index', i);
  });

  log.info(`Hero words: ${total} palavras, ciclo de ${total * duration}s.`);
}

/* ─────────────────────────────────────────────────
   MÓDULO: VISITOR GREET
   
   Substituímos o "contador de visitantes falso"
   por uma saudação por hora do dia — mais honesto
   e sem manipulação de expectativa do usuário.
   
   Se o elemento [data-visitor-greet] existir no HTML,
   insere a saudação com as classes do sistema.
───────────────────────────────────────────────── */
function initVisitorGreet() {
  const el = qs('[data-visitor-greet]');
  if (!el) return;

  const hour = new Date().getHours();

  const greet = hour < 12 ? 'Bom dia'
              : hour < 18 ? 'Boa tarde'
              :              'Boa noite';

  /* Usa as classes do sistema — zero inline style */
  el.innerHTML = `
    <span class="label text-muted">${greet}</span>
    <span class="hero__kicker" style="--stagger-index:0">
      Análise que transforma dados em decisão
    </span>
  `;

  log.info('Visitor greet renderizado:', greet);
}

/* ─────────────────────────────────────────────────
   MÓDULO: CURSOR TRACKER
   
   Move .cursor-dot e .cursor-ring via CSS vars.
   Usa requestAnimationFrame para performance.
   Desativa em dispositivos touch.
   O CSS em microinteraction já define os elementos.
───────────────────────────────────────────────── */
function initCursorTracker(signal) {
  const dot  = qs('.cursor-dot');
  const ring = qs('.cursor-ring');

  /* Se não existirem no HTML, nada a fazer */
  if (!dot && !ring) return;

  /* Só ativa em dispositivos com mouse */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dot?.remove();
    ring?.remove();
    return;
  }

  let mx = -100, my = -100; /* fora da tela inicialmente */
  let rx = -100, ry = -100;
  let rafId;

  const update = () => {
    /* Dot: segue imediatamente */
    if (dot) {
      dot.style.setProperty('--cx', `${mx}px`);
      dot.style.setProperty('--cy', `${my}px`);
    }

    /* Ring: interpola suavemente (lerp) */
    if (ring) {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.setProperty('--cx', `${rx}px`);
      ring.style.setProperty('--cy', `${ry}px`);
    }

    rafId = requestAnimationFrame(update);
  };

  /* Inicia o loop */
  rafId = requestAnimationFrame(update);

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { signal, passive: true });

  /* Esconde ao sair da janela */
  document.addEventListener('mouseleave', () => {
    mx = my = -100;
  }, { signal });

  /* Scale no hover de elementos interativos */
  document.addEventListener('mouseover', (e) => {
    const interactive = e.target.closest('a, button, [role="button"], .card, .service-card');
    if (ring) {
      ring.style.scale = interactive ? '2' : '1';
      ring.style.borderColor = interactive ? 'var(--brand-accent)' : '';
    }
    if (dot) {
      dot.style.scale = interactive ? '0.5' : '1';
    }
  }, { signal });

  /* Cleanup: cancela RAF */
  signal.addEventListener('abort', () => {
    cancelAnimationFrame(rafId);
  });

  log.info('Cursor tracker ativo.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: MAGNETIC EFFECT
   
   Elementos com [data-magnetic] são atraídos
   levemente pelo cursor.
   Intensidade configurável via data-magnetic="0.3".
───────────────────────────────────────────────── */
function initMagneticEffect(signal) {
  /* Só em dispositivos com mouse */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  /* Respeita prefers-reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = qsa('[data-magnetic]');
  if (!elements.length) return;

  elements.forEach(el => {
    const strength = parseFloat(el.dataset.magnetic || '0.3');

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * strength;
      const dy   = (e.clientY - cy) * strength;

      el.style.translate = `${dx}px ${dy}px`;
    }, { signal, passive: true });

    el.addEventListener('mouseleave', () => {
      el.style.translate = '';
    }, { signal });
  });

  log.info(`Magnetic effect ativo em ${elements.length} elemento(s).`);
}

/* ─────────────────────────────────────────────────
   MÓDULO: THEME SYNC
   
   Reage ao CustomEvent 'analist:themechanged'
   disparado pelo ThemeManager.
   
   Responsabilidade: atualizar partes do DOM que
   o CSS não consegue (ex: canvas, SVG inline,
   atributos data, bibliotecas externas).
───────────────────────────────────────────────── */
function initThemeSync(signal) {
  document.addEventListener('analist:themechanged', ({ detail }) => {
    const { theme, isDark } = detail;

    log.info('Tema alterado:', theme);

    /* Exemplo: atualiza meta OG se existir */
    const ogImage = qs('meta[property="og:image"]');
    if (ogImage) {
      const base = ogImage.content.replace(/-(light|dark)\./, '-');
      ogImage.content = base.replace(/\.(\w+)$/, `-${theme}.$1`);
    }

    /* Emite evento para uso externo (analytics, etc.) */
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme, isDark },
    }));

  }, { signal });

  log.info('Theme sync pronto.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: ACTIVE NAV ON SCROLL
   
   Marca o link da navbar como aria-current="page"
   conforme a seção visível no scroll.
───────────────────────────────────────────────── */
function initActiveNavOnScroll(signal) {
  const sections = qsa('[data-section]');
  const navLinks = qsa('.navbar__link[href^="#"], .navbar__drawer-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const header  = qs('.header');
  const offset  = (header?.offsetHeight ?? 60) + 32;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id   = entry.target.id;
      const href = `#${id}`;

      navLinks.forEach(link => {
        const isCurrent = link.getAttribute('href') === href;
        link.setAttribute('aria-current', isCurrent ? 'page' : 'false');
        link.toggleAttribute('data-active', isCurrent);
      });
    });
  }, {
    rootMargin: `-${offset}px 0px -60% 0px`,
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
  signal.addEventListener('abort', () => observer.disconnect());

  log.info('Active nav on scroll pronto.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: DATA BARS
   
   Anima --data-fill nas .data-bar__fill quando
   entram na viewport. CSS já faz a animação —
   o JS apenas dispara o valor correto.
───────────────────────────────────────────────── */
function initDataBars(signal) {
  const bars = qsa('.data-bar__fill[data-value]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar   = entry.target;
      const value = bar.dataset.value ?? '0';
      bar.style.setProperty('--data-fill', `${value}%`);
      observer.unobserve(bar);
    });
  }, { threshold: 0.2 });

  bars.forEach(b => observer.observe(b));
  signal.addEventListener('abort', () => observer.disconnect());

  log.info('Data bars prontas.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: TABS
   
   Gerencia aria-selected e [hidden] nos painéis.
   O CSS em componente.css usa esses atributos.
───────────────────────────────────────────────── */
function initTabs(signal) {
  qsa('.tabs').forEach(tabGroup => {
    const buttons = qsa('.tabs__btn', tabGroup);
    const panels  = qsa('.tabs__panel', tabGroup);

    if (!buttons.length || !panels.length) return;

    const activate = (index) => {
      buttons.forEach((btn, i) => {
        const active = i === index;
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });

      panels.forEach((panel, i) => {
        if (i === index) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    };

    /* Click */
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => activate(i), { signal });
    });

    /* Teclado: setas navegam entre tabs */
    tabGroup.addEventListener('keydown', (e) => {
      const current = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
      if (current === -1) return;

      let next = current;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = (current + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        next = (current - 1 + buttons.length) % buttons.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        next = buttons.length - 1;
      }

      if (next !== current) {
        activate(next);
        buttons[next].focus();
      }
    }, { signal });

    /* Estado inicial */
    activate(0);
  });

  log.info('Tabs prontas.');
}

/* ─────────────────────────────────────────────────
   MÓDULO: ACCORDION
   
   O base.css já estiliza <details>/<summary>.
   Este módulo adiciona acessibilidade e
   fecha outros accordions do mesmo grupo.
───────────────────────────────────────────────── */
function initAccordion(signal) {
  qsa('.accordion').forEach(group => {
    group.addEventListener('toggle', (e) => {
      if (!e.target.open) return;

      /* Fecha outros details no mesmo .accordion */
      qsa('details', group).forEach(detail => {
        if (detail !== e.target) {
          detail.open = false;
        }
      });
    }, { signal, capture: true });
  });

  log.info('Accordion pronto.');
}

/* ─────────────────────────────────────────────────
   APP — Orquestrador Principal
───────────────────────────────────────────────── */
class App {

  #abort = new AbortController();

  constructor() {
    this.#init();
  }

  #init() {
    const { signal } = this.#abort;

    try {
      /* Sem esperar DOMContentLoaded — bootstrap já garante isso */
      initNavigation(signal);
      initSmoothScroll(signal);
      initStaggerIndex();
      initScrollFallback(signal);
      initTicker(signal);
      initHeroWords();
      initVisitorGreet();
      initCursorTracker(signal);
      initMagneticEffect(signal);
      initThemeSync(signal);
      initActiveNavOnScroll(signal);
      initDataBars(signal);
      initTabs(signal);
      initAccordion(signal);

      log.info('App pronto.');
    } catch (err) {
      log.error('Falha na inicialização:', err);
    }
  }

  /** Destrói o app e remove todos os listeners (SPAs) */
  destroy() {
    this.#abort.abort();
    log.info('App destruído.');
  }
}

/* ─────────────────────────────────────────────────
   BOOTSTRAP — aguarda DOM, instancia uma vez
───────────────────────────────────────────────── */
let app;

function bootstrap() {
  if (app) return; /* singleton */
  app = new App();
  window.__app = app; /* expõe para debug em dev */
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}

export { App, app };