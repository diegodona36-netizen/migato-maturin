(function () {
  'use strict';

  // Eliminar cualquier estado residual de alto contraste que distorsione los colores
  try {
    localStorage.removeItem('migato-a11y-high-contrast');
    if (document.body) {
      document.body.classList.remove('high-contrast-mode');
    }
  } catch (e) {}

  function init() {
    // Si existe algún botón de contraste residual en la página, removerlo del DOM
    const residualBtn = document.getElementById('btn-toggle-contrast');
    if (residualBtn) {
      residualBtn.remove();
    }
  }

  function trapFocus(containerElement) {
    if (!containerElement) return;

    lastFocusedElement = document.activeElement;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    function getFocusableElements() {
      return Array.from(containerElement.querySelectorAll(focusableSelectors));
    }

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    containerElement.addEventListener('keydown', handleKeyDown);

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    containerElement._trapFocusCleanup = function () {
      containerElement.removeEventListener('keydown', handleKeyDown);
    };
  }

  function restoreFocus() {
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  }

  window.migatoA11y = {
    toggleHighContrast: toggleHighContrast,
    isHighContrast: isHighContrast,
    init: init,
    trapFocus: trapFocus,
    restoreFocus: restoreFocus,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
