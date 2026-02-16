/* ============================================================================
   THEME MANAGER - GERENCIADOR DE TEMA
   ============================================================================ */

class ThemeManager {
  constructor() {
    this.THEME_KEY = 'analist-theme';
    this.LIGHT = 'light';
    this.DARK = 'dark';
    console.log('🎨 Inicializando Theme Manager');
    this.init();
  }

  init() {
    try {
      this.detectTheme();
      this.setupToggle();
      console.log('✅ Theme Manager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Theme Manager:', error);
    }
  }

  detectTheme() {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      if (saved) {
        this.setTheme(saved, false);
      } else {
        const prefersLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersLight ? this.LIGHT : this.DARK, false);
      }
    } catch (error) {
      console.warn('⚠️ localStorage não disponível:', error);
      this.setTheme(this.LIGHT, false);
    }
  }

  setTheme(theme, animate = true) {
    if (animate) {
      document.body.classList.add('theme-transitioning');
    }

    document.documentElement.setAttribute('data-theme', theme);

    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (e) {
      console.warn('⚠️ Não foi possível salvar tema');
    }

    if (animate) {
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 500);
    }

    console.log(`🎨 Tema: ${theme}`);
  }

  setupToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) {
      console.warn('⚠️ Theme toggle não encontrado');
      return;
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || this.LIGHT;
      const newTheme = current === this.LIGHT ? this.DARK : this.LIGHT;
      this.setTheme(newTheme, true);
    });
  }
}

// Executar imediatamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
  });
} else {
  new ThemeManager();
}
