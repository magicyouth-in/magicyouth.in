/**
 * assets/nav.js
 * Shared hamburger navigation logic for all public pages.
 */

(function () {
  'use strict';

  // ── Mark active link ────────────────────────────────────────────────────────
  function setActiveLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.my-nav-link').forEach(a => {
      const href = a.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        a.classList.add('my-nav-active');
      }
    });
  }

  // ── Toggle hamburger menu ───────────────────────────────────────────────────
  function initHamburger() {
    const btn     = document.getElementById('my-hamburger');
    const menu    = document.getElementById('my-nav-dropdown');
    const overlay = document.getElementById('my-nav-overlay');

    if (!btn || !menu) return;

    function openMenu() {
      menu.classList.add('my-nav-open');
      overlay.classList.add('my-nav-overlay-visible');
      btn.classList.add('my-ham-open');
      btn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      menu.classList.remove('my-nav-open');
      overlay.classList.remove('my-nav-overlay-visible');
      btn.classList.remove('my-ham-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });

    overlay.addEventListener('click', closeMenu);

    // Close on link click (mobile UX)
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  // ── Load announcements banner ───────────────────────────────────────────────
  async function loadAnnouncements() {
    try {
      const res  = await fetch('/api/announcements');
      const data = await res.json();
      if (!data.success || !data.data.length) return;

      const banner = document.getElementById('my-announcements-banner');
      const text   = document.getElementById('my-announcements-text');
      if (!banner || !text) return;

      text.innerHTML = data.data.slice(0, 3).map(a => `
        <span class="my-ann-item">
          ${a.priority === 'high' ? '🔴' : '📢'}
          <strong>${a.title}</strong>${a.content ? ` — ${a.content}` : ''}
        </span>
      `).join('<span class="my-ann-sep">|</span>');

      banner.classList.remove('my-ann-hidden');
    } catch { /* silent */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveLink();
    initHamburger();
    loadAnnouncements();
  });
})();
