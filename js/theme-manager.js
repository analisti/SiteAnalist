/* ============================================================================
   THEME MANAGER - REFACTORED (SEM DEPENDÊNCIAS)
   Objetivos: manter todas as funções originais, melhorar legibilidade,
   encapsular seletores/constantes, tratar erros de storage, usar APIs modernas.
   ============================================================================ */

class ThemeManager {
  constructor() {
    // Constantes imutáveis
    this._KEY = 'analist-theme';
    this._THEMES = { LIGHT: 'light', DARK: 'dark' };
    this._META_NAME = 'theme-color';
    this._TRANSITION_CLASS = 'theme-transitioning';
    this._TRANSITION_TIMEOUT_MS = 500;

    // Elementos principais
    this._html = document.documentElement;
    this._toggleSelector = '[data-theme-toggle]';

    console.log('🎨 Inicializando Theme Manager');
    this.init();
  }

  // Inicialização principal (mantém ordem original de operações)
  init() {
    try {
      this.detectTheme();
      this.setupToggle();
      this.observeSystemPreference();
      console.log('✅ Theme Manager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Theme Manager:', error);
    }
  }

  /* ============================
     DETECTAR E APLICAR TEMA
     ============================ */

  detectTheme() {
    try {
      const saved = this._safeGetItem(this._KEY);
      if (saved) {
        console.log(`📌 Tema salvo encontrado: ${saved}`);
        this.setTheme(saved, false);
        return;
      }

      // Preferência do sistema
      const prefersDark = this._prefersDark();
      const theme = prefersDark ? this._THEMES.DARK : this._THEMES.LIGHT;
      console.log(`📌 Usando preferência do sistema: ${theme}`);
      this.setTheme(theme, false);
    } catch (error) {
      console.warn('⚠️ Erro ao detectar tema; usando light por segurança:', error);
      this.setTheme(this._THEMES.LIGHT, false);
    }
  }

  setTheme(theme, animate = true) {
    // Validação estrita do tema
    if (!this._isValidTheme(theme)) {
      console.warn(`⚠️ Tema inválido: ${theme}. Aplicando "${this._THEMES.LIGHT}"`);
      theme = this._THEMES.LIGHT;
    }

    // Aplicar classe de transição se solicitado
    if (animate) {
      document.body.classList.add(this._TRANSITION_CLASS);
    }

    // Aplicar atributo no root (HTML)
    this._html.setAttribute('data-theme', theme);
    console.log(`✨ data-theme setAttribute("data-theme", "${theme}")`);

    // Persistir preferência (tenta, mas falha silenciosa com log)
    try {
      this._safeSetItem(this._KEY, theme);
    } catch (e) {
      console.warn('⚠️ Não foi possível salvar tema em localStorage:', e);
    }

    // Remover classe de transição após timeout previsível
    if (animate) {
      // Usar setTimeout é aceitável para controle simples de classe
      setTimeout(() => {
        document.body.classList.remove(this._TRANSITION_CLASS);
      }, this._TRANSITION_TIMEOUT_MS);
    }

    // Atualizar meta tag de cor
    this.updateMetaTag(theme);

    console.log(`🎨 Tema aplicado: ${theme}`);
  }

  /* ============================
     TOGGLE DO BOTÃO
     ============================ */

  setupToggle() {
    const toggle = document.querySelector(this._toggleSelector);

    if (!toggle) {
      console.warn('⚠️ Theme toggle button não encontrado');
      return;
    }

    // Listener com prevenção mínima (não impede outros handlers)
    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleTheme();
    };

    toggle.addEventListener('click', onClick);

    // Atualiza estado/aria do toggle conforme tema atual
    const currentTheme = this._html.getAttribute('data-theme') || this._THEMES.LIGHT;
    this.updateToggleLabel(currentTheme);

    console.log('✅ Theme toggle configurado');
  }

  toggleTheme() {
    const current = this._html.getAttribute('data-theme') || this._THEMES.LIGHT;
    const newTheme = current === this._THEMES.LIGHT ? this._THEMES.DARK : this._THEMES.LIGHT;

    console.log(`🔄 Alternando tema de ${current} para ${newTheme}`);

    this.setTheme(newTheme, true);
    this.updateToggleLabel(newTheme);
  }

  updateToggleLabel(theme) {
    const toggle = document.querySelector(this._toggleSelector);
    if (!toggle) return;

    if (theme === this._THEMES.DARK) {
      toggle.setAttribute('aria-label', 'Ativar modo claro');
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      toggle.setAttribute('aria-label', 'Ativar modo escuro');
      toggle.setAttribute('aria-pressed', 'false');
    }
  }

  /* ============================
     META TAG (THEME-COLOR)
     ============================ */

  updateMetaTag(theme) {
    let meta = document.querySelector(`meta[name="${this._META_NAME}"]`);

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', this._META_NAME);
      document.head.appendChild(meta);
    }

    // Cores definidas explicitamente (mantidas do original)
    const color = theme === this._THEMES.DARK ? '#0f1923' : '#f9f7f5';
    meta.setAttribute('content', color);
  }

  /* ============================
     OBSERVAR PREFERÊNCIA DO SISTEMA
     ============================ */

  observeSystemPreference() {
    if (typeof window.matchMedia !== 'function') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler que só aplica mudança se usuário não tiver salvo preferência
    const onChange = (e) => {
      const saved = this._safeGetItem(this._KEY);
      if (!saved) {
        const theme = e.matches ? this._THEMES.DARK : this._THEMES.LIGHT;
        console.log(`🔄 Preferência do sistema mudou para: ${theme}`);
        this.setTheme(theme, true);
      }
    };

    // Modern API: addEventListener; fallback para addListener se necessário
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onChange);
    }
  }

  /* ============================
     HELPERS E UTILITÁRIOS PRIVADOS
     ============================ */

  _isValidTheme(theme) {
    return theme === this._THEMES.LIGHT || theme === this._THEMES.DARK;
  }

  _prefersDark() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) {
      // Em caso de erro, assumir light por segurança
      console.warn('⚠️ Erro ao verificar prefers-color-scheme:', e);
      return false;
    }
  }

  _safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('⚠️ localStorage.getItem falhou:', e);
      return null;
    }
  }

  _safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Propagar não é necessário; apenas logar para diagnóstico
      console.warn('⚠️ localStorage.setItem falhou:', e);
    }
  }
}

/* ============================
   INICIALIZAÇÃO IMEDIATA
   (aplica tema antes do render quando possível)
   ============================ */
(function bootstrapThemeManager() {
  // Instancia imediatamente para aplicar tema antes do paint
  // (comportamento idêntico ao original)
  new ThemeManager();
})();
