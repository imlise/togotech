/* TOGOTECH GROUP — UI Components (Modal, Confirm) */

'use strict';

window.TTComponents = (function () {

  let modalOverlay;

  function ensureModalOverlay() {
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.id = 'ttModalOverlay';
      modalOverlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true" id="ttModal"></div>';
      document.body.appendChild(modalOverlay);

      modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeModal();
      });
    }
    return modalOverlay;
  }

  function openModal({ title, body, footer, onClose }) {
    const overlay = ensureModalOverlay();
    const modal = overlay.querySelector('#ttModal');

    modal.innerHTML = `
      <div class="modal__header">
        <h2 class="modal__title">${title}</h2>
        <button class="btn btn--ghost btn--icon btn--sm" id="modalCloseBtn" aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal__body">${body}</div>
      ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
    `;

    overlay._onClose = onClose;
    overlay.querySelector('#modalCloseBtn').addEventListener('click', closeModal);
    requestAnimationFrame(() => overlay.classList.add('is-open'));
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    if (modalOverlay._onClose) modalOverlay._onClose();
  }

  function confirm({ title = 'Confirmer', message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', danger = false }) {
    return new Promise(resolve => {
      openModal({
        title,
        body: `<p class="text-body text-secondary">${message}</p>`,
        footer: `
          <button class="btn btn--secondary" id="modalCancel">${cancelLabel}</button>
          <button class="btn ${danger ? 'btn--danger' : 'btn--primary'}" id="modalConfirm">${confirmLabel}</button>
        `,
        onClose: () => resolve(false),
      });

      document.getElementById('modalCancel').addEventListener('click', () => {  resolve(false); closeModal();});
      document.getElementById('modalConfirm').addEventListener('click', () => { resolve(true); closeModal(); });
    });
  }

  return { openModal, closeModal, confirm };
})();
