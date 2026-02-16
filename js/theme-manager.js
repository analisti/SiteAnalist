/* ============================================================================
   THEME MANAGER - GERENCIADOR DE TEMA
   ============================================================================ */

class ThemeManager {
  constructor() {
    this.THEME_KEY = 'analist-theme';
    this.LIGHT = 'light';
    this.DARK = 'dark';
    this.init();
  }

  init() {
    console.log('🎨 Inicializando Theme Manager');
    this.detectTheme();
    this.setupToggle();
    console.log('✅ Theme Manager inicializado');
  }

  detectTheme() {
    const saved = localStorage.getItem(this.THEME_KEY);
    
    if (saved) {
      this.setTheme(saved, false);
    } else {
      const prefersLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersLight ? this.LIGHT : this.DARK, false);
    }
  }

  setTheme(theme, animate = true) {
    if (animate) {
      document.body.classList.add('theme-transitioning');
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);

    if (animate) {
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 500);
    }

    console.log(`🎨 Tema: ${theme}`);
  }

  setupToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-theme') || this.LIGHT;
        const newTheme = current === this.LIGHT ? this.DARK : this.LIGHT;
        this.setTheme(newTheme, true);
      });
    }
  }
}

// Executar imediatamente (antes do DOMContentLoaded)
new ThemeManager();