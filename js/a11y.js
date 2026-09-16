(function () {
  'use strict';

  const STORAGE_KEY = 'migato-a11y-high-contrast';
  const TOGGLE_ID = 'btn-toggle-contrast';
  let lastFocusedElement = null;

  function isHighContrast() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function applyHighContrast(enabled) {
    if (enabled) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }

  function updateToggleButtonState() {
    const btn = document.getElementById(TOGGLE_ID);
    if (!btn) return;

    const enabled = isHighContrast();
    if (enabled) {
      btn.classList.add('bg-amber-500', 'text-black');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('title', 'Desactivar modo alto contraste');
      btn.setAttribute('aria-label', 'Desactivar modo alto contraste');
    } else {
      btn.classList.remove('bg-amber-500', 'text-black');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('title', 'Activar modo alto contraste');
      btn.setAttribute('aria-label', 'Activar modo alto contraste');
    }
  }

  function toggleHighContrast() {
    const current = isHighContrast();
    const next = !current;
    localStorage.setItem(STORAGE_KEY, String(next));
    applyHighContrast(next);
    updateToggleButtonState();
    return next;
  }

  function init() {
    if (isHighContrast()) {
      applyHighContrast(true);
    }
    updateToggleButtonState();

    const btn = document.getElementById(TOGGLE_ID);
    if (btn) {
      btn.addEventListener('click', function () {
        toggleHighContrast();
      });
    }

    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function (e) {
        const targetId = skipLink.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
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
