// ============================================================================
// MOBILE ANIMATIONS DIAGNOSTIC - Verifica por que animações não funcionam
// ============================================================================

(function() {
  'use strict';

  console.log('=== MOBILE ANIMATIONS DIAGNOSTIC ===');
  console.log('Screen width:', window.innerWidth);
  console.log('Is mobile:', window.innerWidth < 768);
  console.log('User agent:', navigator.userAgent);

  // ========== TESTE 1: VERIFICAR SE ANIMAÇÕES CSS ESTÃO DEFINIDAS ==========
  
  function testCSSAnimations() {
    console.log('\n--- TESTE 1: CSS Animations ---');
    
    const heroWord = document.querySelector('.hero__word');
    const marqueeContent = document.querySelector('.marquee-content');
    const heroBg = document.querySelector('.hero__bg');

    if (heroWord) {
      const styles = window.getComputedStyle(heroWord);
      console.log('Hero Word animation:', styles.animationName);
      console.log('Hero Word animation-duration:', styles.animationDuration);
      console.log('Hero Word animation-play-state:', styles.animationPlayState);
      console.log('Hero Word visibility:', styles.visibility);
      console.log('Hero Word display:', styles.display);
    } else {
      console.error('❌ .hero__word não encontrado no DOM');
    }

    if (marqueeContent) {
      const styles = window.getComputedStyle(marqueeContent);
      console.log('Marquee animation:', styles.animationName);
      console.log('Marquee animation-duration:', styles.animationDuration);
      console.log('Marquee transform:', styles.transform);
    } else {
      console.error('❌ .marquee-content não encontrado no DOM');
    }

    if (heroBg) {
      const styles = window.getComputedStyle(heroBg);
      console.log('Hero BG animation:', styles.animationName);
      console.log('Hero BG animation-duration:', styles.animationDuration);
    } else {
      console.error('❌ .hero__bg não encontrado no DOM');
    }
  }

  // ========== TESTE 2: VERIFICAR INTERSECTION OBSERVER ==========
  
  function testIntersectionObserver() {
    console.log('\n--- TESTE 2: Intersection Observer ---');
    
    if ('IntersectionObserver' in window) {
      console.log('✅ IntersectionObserver suportado');
      
      const animatedElements = document.querySelectorAll('[data-animate]');
      console.log('Elementos com [data-animate]:', animatedElements.length);
      
      animatedElements.forEach((el, index) => {
        console.log(`Elemento ${index}:`, {
          hasClass: el.classList.contains('in-view'),
          opacity: window.getComputedStyle(el).opacity,
          transform: window.getComputedStyle(el).transform
        });
      });
    } else {
      console.error('❌ IntersectionObserver NÃO suportado neste navegador');
    }
  }

  // ========== TESTE 3: VERIFICAR OVERFLOW ==========
  
  function testOverflow() {
    console.log('\n--- TESTE 3: Overflow Settings ---');
    
    const hero = document.querySelector('.hero');
    const heroContainer = document.querySelector('.hero__container');
    const heroWords = document.querySelector('.hero__words');
    
    if (hero) {
      const styles = window.getComputedStyle(hero);
      console.log('Hero overflow:', styles.overflow);
      console.log('Hero overflow-x:', styles.overflowX);
      console.log('Hero overflow-y:', styles.overflowY);
    }
    
    if (heroContainer) {
      const styles = window.getComputedStyle(heroContainer);
      console.log('Hero Container overflow:', styles.overflow);
    }
    
    if (heroWords) {
      const styles = window.getComputedStyle(heroWords);
      console.log('Hero Words overflow:', styles.overflow);
    }
  }

  // ========== TESTE 4: VERIFICAR PREFERS-REDUCED-MOTION ==========
  
  function testReducedMotion() {
    console.log('\n--- TESTE 4: Reduced Motion ---');
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    console.log('Prefers reduced motion:', prefersReducedMotion.matches);
    
    if (prefersReducedMotion.matches) {
      console.warn('⚠️ Usuário prefere animações reduzidas');
    } else {
      console.log('✅ Animações normais permitidas');
    }
  }

  // ========== TESTE 5: FORÇAR ANIMAÇÃO MANUALMENTE ==========
  
  function forceAnimations() {
    console.log('\n--- TESTE 5: Forçando Animações ---');
    
    // Forçar hero words
    const heroWords = document.querySelectorAll('.hero__word');
    heroWords.forEach((word, index) => {
      word.style.animation = `wordRotate 9s infinite ease-in-out`;
      word.style.animationDelay = `${index * 3}s`;
      word.style.willChange = 'opacity, transform';
      console.log(`Forçado animação em palavra ${index}`);
    });

    // Forçar marquee
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
      marqueeContent.style.animation = 'marquee 30s linear infinite';
      marqueeContent.style.willChange = 'transform';
      console.log('Forçado animação no marquee');
    }

    // Forçar hero bg
    const heroBg = document.querySelector('.hero__bg');
    if (heroBg) {
      heroBg.style.animation = 'float 6s ease-in-out infinite';
      heroBg.style.willChange = 'transform';
      console.log('Forçado animação no hero bg');
    }
  }

  // ========== TESTE 6: VERIFICAR ARQUIVOS CSS CARREGADOS ==========
  
  function testCSSFiles() {
    console.log('\n--- TESTE 6: CSS Files Loaded ---');
    
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(sheet => {
      if (sheet.href) {
        const filename = sheet.href.split('/').pop();
        console.log('CSS carregado:', filename);
        
        if (filename.includes('mobile-fixes') || filename.includes('animations')) {
          console.log('  → Arquivo de animações detectado:', filename);
        }
      }
    });
  }

  // ========== EXECUTAR TODOS OS TESTES ==========
  
  function runAllTests() {
    testCSSFiles();
    testCSSAnimations();
    testIntersectionObserver();
    testOverflow();
    testReducedMotion();
    
    console.log('\n--- AÇÃO: Tentando forçar animações ---');
    forceAnimations();
    
    console.log('\n=== FIM DO DIAGNÓSTICO ===');
    console.log('Se após "forçar animações" elas não funcionarem, o problema é:');
    console.log('1. Arquivos CSS não estão carregando');
    console.log('2. Conflito com outro CSS');
    console.log('3. Problema no navegador mobile específico');
  }

  // Executar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }

  // Disponibilizar globalmente para testes manuais
  window.animationDiagnostic = {
    testCSSAnimations,
    testIntersectionObserver,
    testOverflow,
    testReducedMotion,
    forceAnimations,
    testCSSFiles,
    runAllTests
  };

  console.log('\n💡 TIP: Execute window.animationDiagnostic.runAllTests() novamente a qualquer momento');

})();