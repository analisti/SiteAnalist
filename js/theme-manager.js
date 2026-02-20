/* ============================================================================
   THEME-MANAGER.JS — ANALIST.COM
   
   ARQUITETURA:
   ├── snippet.js        → Script inline para o <head> (anti-flash, zero deps)
   └── theme-manager.js  → Classe completa para carregar antes do </body>
   
   Este arquivo exporta ThemeManager e o snippet separado.
   Copie o conteúdo de INLINE_SNIPPET para um <script> no <head>.
   ============================================================================ */

'use strict';

/* ─────────────────────────────────────────────────
   INLINE SNIPPET — cole no <head>, antes do CSS
   
   Responsabilidade ÚNICA: aplicar data-theme antes
   do primeiro paint. Zero dependências. Zero classe.
   Minificável para ~180 bytes.
   
   <head>
     <script>
       // Conteúdo de INLINE_SNIPPET aqui
     </script>
     <link rel="stylesheet" href="base.css">
     ...
   </head>
───────────────────────────────────────────────── */
export const INLINE_SNIPPET = `(function(){
  var k='analist-theme';
  var t;
  try { t=localStorage.getItem(k); } catch(e){}
  if(!t) t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  document.documentElement.dataset.theme=t;
})();`;

/* ─────────────────────────────────────────────────
   CONSTANTES — fonte única da verdade
   Sincronizadas com dark-mode.css
───────────────────────────────────────────────── */
const STORAGE_KEY       = 'analist-theme';
const THEME_LIGHT       = 'light';
const THEME_DARK        = 'dark';
const TRANSITION_CLASS  = 'is-transitioning';    /* css: html.is-transitioning */
const TRANSITION_MS     = 500;
const EVENT_CHANGED     = 'analist:themechanged'; /* evento customizado */

/* Meta theme-color sincronizados com dark-mode.css */
const META_COLORS = {
  [THEME_LIGHT]: '#f5f0e8',   /* --analist-paper */
  [THEME_DARK]:  '#111111',   /* --analist-near-black */
};

/* ─────────────────────────────────────────────────
   LOGGER — zero logs em produção
───────────────────────────────────────────────── */
const isDev = typeof process !== 'undefined'
  ? process.env?.NODE_ENV !== 'production'
  : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const log = {
  info:  (...a) => isDev && console.info ('[ThemeManager]', ...a),
  warn:  (...a) => isDev && console.warn ('[ThemeManager]', ...a),
  error: (...a) =>          console.error('[ThemeManager]', ...a),
};

/* ─────────────────────────────────────────────────
   STORAGE — abstrai localStorage com fallback
───────────────────────────────────────────────── */
const storage = {
  get(key) {
    try { return localStorage.getItem(key); }
    catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch { return false; }
  },
  remove(key) {
    try { localStorage.removeItem(key); return true; }
    catch { return false; }
  },
};

/* ─────────────────────────────────────────────────
   THEME MANAGER
───────────────────────────────────────────────── */
export class ThemeManager {

  /** @type {string} Tema ativo no momento */
  #current = THEME_LIGHT;

  /** @type {HTMLElement} */
  #html = document.documentElement;

  /** @type {AbortController} para remover listeners ao destruir */
  #abort = new AbortController();

  /** @type {boolean} View Transition API disponível */
  #supportsViewTransition = typeof document.startViewTransition === 'function';

  /** @type {boolean} Usuário prefere movimento reduzido */
  #prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    this.#init();
  }

  /* ── API Pública ──────────────────────────────── */

  /** Retorna o tema ativo */
  get theme() { return this.#current; }

  /** Retorna true se dark mode ativo */
  get isDark() { return this.#current === THEME_DARK; }

  /** Alterna entre light e dark */
  async toggle() {
    await this.#applyTheme(this.isDark ? THEME_LIGHT : THEME_DARK, true);
  }

  /** Define um tema específico */
  async set(theme) {
    if (!this.#isValid(theme)) {
      log.warn(`Tema inválido: "${theme}". Use "light" ou "dark".`);
      return;
    }
    await this.#applyTheme(theme, true);
  }

  /** Remove preferência salva e volta a seguir o sistema */
  reset() {
    storage.remove(STORAGE_KEY);
    const systemTheme = this.#systemTheme();
    this.#applyTheme(systemTheme, false);
    log.info('Preferência removida. Seguindo sistema:', systemTheme);
  }

  /** Remove todos os listeners (para SPAs com unmount) */
  destroy() {
    this.#abort.abort();
    log.info('ThemeManager destruído.');
  }

  /* ── Inicialização ────────────────────────────── */

  #init() {
    try {
      this.#detectAndApply();
      this.#bindToggles();
      this.#watchSystem();
      this.#watchReducedMotion();
      this.#initScrollObserver();
      this.#initCursorSpotlight();
      log.info('Pronto. Tema:', this.#current);
    } catch (err) {
      log.error('Falha na inicialização:', err);
    }
  }

  /* ── Detecção e Aplicação ─────────────────────── */

  #detectAndApply() {
    /* O INLINE_SNIPPET já aplicou data-theme no HTML.
       Lemos de lá para garantir consistência — não do storage. */
    const fromHtml    = this.#html.dataset.theme;
    const fromStorage = storage.get(STORAGE_KEY);

    const resolved = this.#isValid(fromHtml)    ? fromHtml
                   : this.#isValid(fromStorage) ? fromStorage
                   : this.#systemTheme();

    /* Aplica sem animação — é o carregamento inicial */
    this.#applyTheme(resolved, false);
  }

  async #applyTheme(theme, animate) {
    if (theme === this.#current && this.#html.dataset.theme === theme) {
      return; /* sem mudança, sem trabalho */
    }

    log.info(`${this.#current} → ${theme}`);

    this.#current = theme;

    /* Persiste antes de animar — evita inconsistência se animação falhar */
    storage.set(STORAGE_KEY, theme);

    /* Anima ou aplica diretamente */
    if (animate && !this.#prefersReducedMotion) {
      await this.#animateTransition(theme);
    } else {
      this.#html.dataset.theme = theme;
    }

    /* Efeitos colaterais */
    this.#updateMeta(theme);
    this.#updateToggles(theme);
    this.#dispatch(theme);
  }

  /* ── Transição ────────────────────────────────── */

  async #animateTransition(theme) {
    if (this.#supportsViewTransition) {
      await this.#viewTransition(theme);
    } else {
      await this.#classTransition(theme);
    }
  }

  /** View Transition API — Chrome 111+ */
  async #viewTransition(theme) {
    try {
      const transition = document.startViewTransition(() => {
        this.#html.dataset.theme = theme;
      });
      await transition.finished;
    } catch (err) {
      /* Fallback se a transição for interrompida */
      log.warn('View Transition interrompida. Aplicando diretamente.', err);
      this.#html.dataset.theme = theme;
    }
  }

  /** Fallback: classe CSS + setTimeout */
  #classTransition(theme) {
    return new Promise((resolve) => {
      this.#html.classList.add(TRANSITION_CLASS);
      this.#html.dataset.theme = theme;

      /* Usa transitionend se possível — mais preciso que timeout */
      const onEnd = () => {
        this.#html.classList.remove(TRANSITION_CLASS);
        resolve();
      };

      /* Ouve a transição do body ou html */
      const el = document.body;
      const handler = () => {
        el.removeEventListener('transitionend', handler);
        clearTimeout(fallback);
        onEnd();
      };

      el.addEventListener('transitionend', handler, { once: true });

      /* Garantia: remove a classe mesmo sem transitionend */
      const fallback = setTimeout(() => {
        el.removeEventListener('transitionend', handler);
        onEnd();
      }, TRANSITION_MS);
    });
  }

  /* ── Toggles ──────────────────────────────────── */

  #bindToggles() {
    /* Suporta múltiplos toggles na mesma página */
    const { signal } = this.#abort;

    document.addEventListener('click', async (e) => {
      const toggle = e.target.closest('[data-theme-toggle]');
      if (!toggle) return;
      /* Sem stopPropagation — outros listeners continuam funcionando */
      await this.toggle();
    }, { signal });

    /* Suporte a teclado (Enter / Space) */
    document.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const toggle = e.target.closest('[data-theme-toggle]');
      if (!toggle) return;
      e.preventDefault();
      await this.toggle();
    }, { signal });

    /* Estado inicial */
    this.#updateToggles(this.#current);
  }

  #updateToggles(theme) {
    const isDark = theme === THEME_DARK;

    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      el.setAttribute('aria-label',
        isDark ? 'Ativar modo claro' : 'Ativar modo escuro'
      );
      el.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      /* data-current-theme usado pelo CSS para tooltips */
      el.dataset.currentTheme = theme;
    });
  }

  /* ── Meta Theme-Color ─────────────────────────── */

  #updateMeta(theme) {
    const color = META_COLORS[theme] ?? META_COLORS[THEME_LIGHT];

    /* Atualiza todas as meta[name="theme-color"] */
    const metas = document.querySelectorAll('meta[name="theme-color"]');

    if (metas.length === 0) {
      /* Cria uma se não existir */
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
      return;
    }

    metas.forEach(meta => {
      /* Respeita metas com media query — só atualiza a genérica */
      if (!meta.media) {
        meta.content = color;
      }
    });
  }

  /* ── Observadores ─────────────────────────────── */

  #watchSystem() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const { signal } = this.#abort;

    const onChange = ({ matches }) => {
      /* Só aplica se o usuário não tiver salvo uma preferência */
      if (storage.get(STORAGE_KEY)) return;

      const theme = matches ? THEME_DARK : THEME_LIGHT;
      log.info('Sistema mudou para:', theme);
      this.#applyTheme(theme, true);
    };

    mq.addEventListener('change', onChange, { signal });
  }

  #watchReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const { signal } = this.#abort;

    mq.addEventListener('change', ({ matches }) => {
      this.#prefersReducedMotion = matches;
    }, { signal });
  }

  /* ── Scroll Observer — header[data-scrolled] ──── */
  /*
     Quando o usuário rola a página, adiciona data-scrolled
     ao .header. O dark-mode.css e layout.css usam esse atributo
     para aplicar backdrop-filter e escurecer a borda.
  */
  #initScrollObserver() {
    const header = document.querySelector('.header');
    if (!header) return;

    const { signal } = this.#abort;
    const THRESHOLD = 60; /* px antes de "scrolled" ativar */

    /* IntersectionObserver é mais performático que scroll listener */
    const sentinel = document.createElement('div');
    sentinel.style.cssText = `
      position: absolute;
      top: ${THRESHOLD}px;
      left: 0;
      width: 1px;
      height: 1px;
      pointer-events: none;
    `;
    sentinel.setAttribute('aria-hidden', 'true');

    /* Insere antes do header ou no início do body */
    document.body.insertBefore(sentinel, document.body.firstChild);

    const observer = new IntersectionObserver(
      ([entry]) => {
        /* isIntersecting = true → estamos no topo (sem scroll) */
        if (entry.isIntersecting) {
          header.removeAttribute('data-scrolled');
        } else {
          header.setAttribute('data-scrolled', '');
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    /* Remove observer ao destruir */
    signal.addEventListener('abort', () => {
      observer.disconnect();
      sentinel.remove();
    });
  }

  /* ── Cursor Spotlight — .card--spotlight ─────── */
  /*
     Passa --card-light-x e --card-light-y para cards
     com a classe .card--spotlight. O CSS usa essas
     variáveis para o radial-gradient interno.
  */
  #initCursorSpotlight() {
    const { signal } = this.#abort;

    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.card--spotlight');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';

      card.style.setProperty('--card-light-x', x);
      card.style.setProperty('--card-light-y', y);
    }, { signal, passive: true });

    /* Reseta ao sair do card */
    document.addEventListener('mouseleave', (e) => {
      const card = e.target.closest('.card--spotlight');
      if (!card) return;
      card.style.removeProperty('--card-light-x');
      card.style.removeProperty('--card-light-y');
    }, { signal, capture: true });
  }

  /* ── CustomEvent ──────────────────────────────── */
  /*
     Dispara 'analist:themechanged' no document.
     app.js e outros módulos podem escutar:
     
     document.addEventListener('analist:themechanged', ({ detail }) => {
       console.log(detail.theme, detail.isDark);
     });
  */
  #dispatch(theme) {
    document.dispatchEvent(new CustomEvent(EVENT_CHANGED, {
      bubbles: true,
      detail: {
        theme,
        isDark: theme === THEME_DARK,
        previous: this.#current === theme
          ? (theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
          : this.#current,
      },
    }));
  }

  /* ── Helpers ──────────────────────────────────── */

  #isValid(theme) {
    return theme === THEME_LIGHT || theme === THEME_DARK;
  }

  #systemTheme() {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEME_DARK
        : THEME_LIGHT;
    } catch {
      return THEME_LIGHT;
    }
  }
}

/* ─────────────────────────────────────────────────
   INICIALIZAÇÃO
   
   Exporta a instância singleton para uso no app.js:
   import { themeManager } from './theme-manager.js';
───────────────────────────────────────────────── */
export const themeManager = new ThemeManager();

/* Expõe na window para scripts legados não-modulares */
window.__themeManager = themeManager;