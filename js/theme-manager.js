/* ============================================================================
   THEME MANAGER - GERENCIADOR DE TEMA DARK/LIGHT
   ============================================================================ */

class ThemeManager {
  constructor() {
    this.THEME_KEY = 'analist-theme';
    this.LIGHT = 'light';
    this.DARK = 'dark';
    this.html = document.documentElement;
    
    console.log('🎨 Inicializando Theme Manager');
    this.init();
  }

  init() {
    try {
      // 1. Detectar tema salvo ou preferência do sistema
      this.detectTheme();
      
      // 2. Configurar botão toggle
      this.setupToggle();
      
      // 3. Observar mudanças do sistema
      this.observeSystemPreference();
      
      console.log('✅ Theme Manager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Theme Manager:', error);
    }
  }

  detectTheme() {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      
      if (saved) {
        console.log(`📌 Tema salvo encontrado: ${saved}`);
        this.setTheme(saved, false);
      } else {
        // Detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? this.DARK : this.LIGHT;
        console.log(`📌 Usando preferência do sistema: ${theme}`);
        this.setTheme(theme, false);
      }
    } catch (error) {
      console.warn('⚠️ localStorage não disponível, usando light mode:', error);
      this.setTheme(this.LIGHT, false);
    }
  }

  setTheme(theme, animate = true) {
    // Validar tema
    if (theme !== this.LIGHT && theme !== this.DARK) {
      console.warn(`⚠️ Tema inválido: ${theme}, usando light`);
      theme = this.LIGHT;
    }

    // Adicionar classe de transição
    if (animate) {
      document.body.classList.add('theme-transitioning');
    }

    // Aplicar tema ao HTML
    this.html.setAttribute('data-theme', theme);
    console.log(`✨ data-theme setAttribute("data-theme", "${theme}")`);

    // Salvar preferência
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (e) {
      console.warn('⚠️ Não foi possível salvar tema em localStorage');
    }

    // Remover classe de transição após animação
    if (animate) {
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 500);
    }

    // Log
    console.log(`🎨 Tema: ${theme}`);
    
    // Atualizar meta tag
    this.updateMetaTag(theme);
  }

  setupToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    
    if (!toggle) {
      console.warn('⚠️ Theme toggle button não encontrado');
      return;
    }

    // Adicionar listener
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleTheme();
    });

    // Atualizar aria-label inicial
    const currentTheme = this.html.getAttribute('data-theme') || this.LIGHT;
    this.updateToggleLabel(currentTheme);

    console.log('✅ Theme toggle configurado');
  }

  toggleTheme() {
    const current = this.html.getAttribute('data-theme') || this.LIGHT;
    const newTheme = current === this.LIGHT ? this.DARK : this.LIGHT;
    
    console.log(`🔄 Alternando tema de ${current} para ${newTheme}`);
    
    this.setTheme(newTheme, true);
    this.updateToggleLabel(newTheme);
  }

  updateToggleLabel(theme) {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    if (theme === this.DARK) {
      toggle.setAttribute('aria-label', 'Ativar modo claro');
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      toggle.setAttribute('aria-label', 'Ativar modo escuro');
      toggle.setAttribute('aria-pressed', 'false');
    }
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

  observeSystemPreference() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Usar addEventListener em vez de addListener (deprecated)
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', (e) => {
        // Só mudar se o usuário não tiver setado manualmente
        const saved = localStorage.getItem(this.THEME_KEY);
        if (!saved) {
          const theme = e.matches ? this.DARK : this.LIGHT;
          console.log(`🔄 Preferência do sistema mudou para: ${theme}`);
          this.setTheme(theme, true);
        }
      });
    }
  }
}

// ========== INICIALIZAÇÃO ========== 
// Executar IMEDIATAMENTE (não esperar DOMContentLoaded)
// Para que o tema seja aplicado antes do render
if (document.readyState === 'loading') {
  // DOM ainda está carregando
  const manager = new ThemeManager();
} else {
  // DOM já carregou
  const manager = new ThemeManager();
}