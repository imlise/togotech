'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'corbeille', title: 'Corbeille' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Corbeille' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  renderTrash();

  document.getElementById('emptyTrash')?.addEventListener('click', () => {
    if (!TT.getTrash().length) { Toast.info('Corbeille déjà vide.'); return; }
    TTComponents.confirm({ title: 'Vider la corbeille', message: 'Supprimer définitivement tous les documents ?', danger: true }).then(ok => {
      if (!ok) return;
      TT.saveTrash([]);
      Toast.success('Corbeille vidée.');
      renderTrash();
    });
  });
});

function renderTrash() {
  const trash = TT.getTrash();
  const tbody = document.getElementById('trashBody');
  const empty = document.getElementById('trashEmpty');

  if (!trash.length) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = trash.map(d => `
    <tr>
      <td class="td-mono">${d.numero}</td>
      <td><span class="badge badge--deleted">${d.type}</span></td>
      <td>${d.client}</td>
      <td class="text-secondary">${TT.formatDateTime(d.deletedAt)}</td>
      <td>
        <div class="row-actions" style="opacity:1">
          <button class="btn btn--secondary btn--sm" data-restore="${d.id}">Restaurer</button>
          <button class="action-btn action-btn--danger" data-purge="${d.id}"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-restore]').forEach(btn => {
    btn.addEventListener('click', () => {
      TT.restoreFromTrash(btn.dataset.restore);
      Toast.success('Document restauré.');
      renderTrash();
    });
  });

  tbody.querySelectorAll('[data-purge]').forEach(btn => {
    btn.addEventListener('click', () => {
      TTComponents.confirm({ title: 'Suppression définitive', message: 'Ce document ne pourra pas être récupéré.', danger: true }).then(ok => {
        if (!ok) return;
        TT.saveTrash(TT.getTrash().filter(d => d.id !== btn.dataset.purge));
        Toast.success('Document supprimé définitivement.');
        renderTrash();
      });
    });
  });
}
