/* ============================================================================
   THEME MANAGER - GERENCIADOR DE TEMA DARK/LIGHT
   ============================================================================ */

class ThemeManager {
  constructor() {
    this.THEME_KEY = 'analist-theme';
    this.LIGHT = 'light';
    this.DARK = 'dark';
    this.isDarkModeSupported = this.checkDarkModeSupport();
    this.init();
  }

  checkDarkModeSupport() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  init() {
    console.log('🎨 Inicializando Theme Manager');
    
    // Detectar tema salvo ou preferência do sistema
    this.detectSystemPreference();
    
    // Configurar botão toggle
    this.setupThemeToggle();
    
    // Ouvir mudanças no sistema
    this.observeSystemPreference();
    
    console.log('✅ Theme Manager inicializado');
  }

  detectSystemPreference() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    if (savedTheme) {
      console.log(`📌 Tema salvo encontrado: ${savedTheme}`);
      this.setTheme(savedTheme, false);
    } else {
      const systemTheme = this.isDarkModeSupported ? this.DARK : this.LIGHT;
      console.log(`📌 Usando preferência do sistema: ${systemTheme}`);
      this.setTheme(systemTheme, false);
    }
  }

  setTheme(theme, animate = true) {
    if (animate) {
      document.body.classList.add('theme-transitioning');
    }

    // Aplicar tema ao html
    document.documentElement.setAttribute('data-theme', theme);
    
    // Salvar no localStorage
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Atualizar ícone do botão
    this.updateThemeIcon(theme);
    
    // Atualizar meta tag
    this.updateMetaTag(theme);
    
    console.log(`🎨 Tema alterado para: ${theme}`);

    if (animate) {
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 500);
    }
  }

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || this.LIGHT;
    const newTheme = currentTheme === this.LIGHT ? this.DARK : this.LIGHT;
    this.setTheme(newTheme, true);
  }

  updateThemeIcon(theme) {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    // Atualizar aria-label
    toggle.setAttribute('aria-label', 
      theme === this.DARK ? 'Ativar modo claro' : 'Ativar modo escuro'
    );
    
    // Atualizar aria-pressed
    toggle.setAttribute('aria-pressed', theme === this.DARK);
  }

  updateMetaTag(theme) {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }

    // Cores conforme o tema
    const color = theme === this.DARK ? '#0f1923' : '#f9f7f5';
    metaTheme.setAttribute('content', color);
  }

  setupThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    
    if (!toggle) {
      console.warn('⚠️ Botão de toggle de tema não encontrado');
      return;
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Atualizar ícone ao carregar
    const currentTheme = document.documentElement.getAttribute('data-theme') || this.LIGHT;
    this.updateThemeIcon(currentTheme);
  }

  observeSystemPreference() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addListener((e) => {
      // Só mudar se o usuário não tiver setado manualmente
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (!savedTheme) {
        this.setTheme(e.matches ? this.DARK : this.LIGHT);
      }
    });
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
  });
} else {
  new ThemeManager();
}