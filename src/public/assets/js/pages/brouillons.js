'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'brouillons', title: 'Brouillons' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Brouillons' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  const drafts = TT.getDrafts();
  const tbody = document.getElementById('draftsBody');
  const empty = document.getElementById('draftsEmpty');

  if (!drafts.length) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }

  tbody.innerHTML = drafts.map(d => `
    <tr>
      <td class="td-mono">${d.numero}</td>
      <td><span class="badge badge--${d.type}">${d.type === 'proforma' ? 'Proforma' : 'Facture'}</span></td>
      <td>${d.client || '—'}</td>
      <td class="text-secondary">${d.objet || '—'}</td>
      <td class="text-secondary">${TT.formatDateTime(d.updatedAt)}</td>
      <td>
        <div class="row-actions" style="opacity:1">
          <a href="facture.html?id=${d.id}&edit=1" class="btn btn--secondary btn--sm">Reprendre</a>
          <button class="action-btn action-btn--danger" data-id="${d.id}" aria-label="Supprimer"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('[data-id]');
    if (!btn || btn.tagName === 'A') return;
    TTComponents.confirm({ title: 'Supprimer le brouillon', message: 'Cette action est irréversible.', danger: true }).then(ok => {
      if (!ok) return;
      TT.saveDrafts(TT.getDrafts().filter(d => d.id !== btn.dataset.id));
      Toast.success('Brouillon supprimé.');
      location.reload();
    });
  });
});
