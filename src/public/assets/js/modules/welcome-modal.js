/* ═══════════════════════════════════════════════════════════════
   TOGOTECH GROUP — Modale de bienvenue
   Affichée une seule fois, à la toute première connexion.
   Persistée dans localStorage (comme le thème), ne revient jamais
   après avoir été vue ou fermée.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

window.WelcomeModal = (function () {
  const STORAGE_KEY = 'tt_welcome_seen';

  const HIGHLIGHTS = [
    {
      accent: 'blue',
      icon: '<path d="M4 3h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 7h4M6 9.5h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
      title: 'Facturation en temps réel',
      text: 'Créez factures et proformas avec un aperçu qui se met à jour à chaque frappe.',
    },
    {
      accent: 'coral',
      icon: '<circle cx="8" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5.5v3l2 1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
      title: 'Historique centralisé',
      text: 'Retrouvez, filtrez et retéléchargez tous vos documents à tout moment.',
    },
    {
      accent: 'mint',
      icon: '<circle cx="6.3" cy="5.8" r="2.4" stroke="currentColor" stroke-width="1.4"/><path d="M2.2 13.5c0-2.3 1.9-4.1 4.1-4.1s4.1 1.8 4.1 4.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="6.6" r="1.8" stroke="currentColor" stroke-width="1.3"/><path d="M10.4 13.5c.2-1.8 1.4-3.1 3-3.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
      title: 'Vos clients, organisés',
      text: 'Un carnet de contacts pour accélérer la création de vos prochains documents.',
    },
    {
      accent: 'amber',
      icon: '<path d="M8 4.5a3.5 3.5 0 1 0 3.5 3.5A3.505 3.505 0 0 0 8 4.5Z" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.5v1.4M8 13.1v1.4M2.4 8h1.4M12.2 8h1.4M4.1 4.1l1 1M10.9 4.1l-1 1M4.1 11.9l1-1M10.9 11.9l-1-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
      title: 'À votre image',
      text: 'Basculez entre thème clair et sombre — vos documents restent, eux, toujours lisibles à l\'impression.',
    },
  ];

  function hasSeen() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  }

  function markSeen() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  }

  function firstName() {
    try {
      const name = window.TT?.getProfile?.()?.name;
      return name ? name.split(' ')[0] : '';
    } catch { return ''; }
  }

  function build() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay welcome-modal-overlay';
    overlay.innerHTML = `
      <div class="modal welcome-modal" role="dialog" aria-modal="true" aria-labelledby="welcomeModalTitle">
        <div class="welcome-modal__hero">
          <div class="welcome-modal__badge">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3 4 8v10l9 5 9-5V8l-9-5Z" stroke="white" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 3v20M4 8l9 5 9-5" stroke="white" stroke-width="1.6" stroke-linejoin="round"/></svg>
          </div>
        </div>
        <div class="modal__body welcome-modal__body">
          <h2 class="welcome-modal__title" id="welcomeModalTitle">Bienvenue${firstName() ? ', ' + firstName() : ''} 👋</h2>
          <p class="welcome-modal__intro">Votre espace de facturation TogoTech est prêt. Un tour rapide de l'essentiel avant de commencer :</p>
          <div class="welcome-modal__list">
            ${HIGHLIGHTS.map(h => `
              <div class="welcome-modal__item">
                <span class="welcome-modal__icon welcome-modal__icon--${h.accent}">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">${h.icon}</svg>
                </span>
                <div>
                  <div class="welcome-modal__item-title">${h.title}</div>
                  <div class="welcome-modal__item-text">${h.text}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal__footer welcome-modal__footer">
          <button type="button" class="btn btn--primary" id="welcomeModalStart">Commencer</button>
        </div>
      </div>
    `;
    return overlay;
  }

  function close(overlay) {
    overlay.classList.remove('is-open');
    markSeen();
    setTimeout(() => overlay.remove(), 250);
  }

  function show() {
    const overlay = build();
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-open'));

    overlay.querySelector('#welcomeModalStart').addEventListener('click', () => close(overlay));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(overlay); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { close(overlay); document.removeEventListener('keydown', onEsc); }
    });
  }

  function startIfFirstVisit() {
    if (hasSeen()) return;
    window.setTimeout(show, 500);
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  document.addEventListener('DOMContentLoaded', startIfFirstVisit);

  return { show, reset, hasSeen };
})();
