'use strict';

let rowsCount ;
document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'corbeille', title: 'Corbeille' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard' }, { label: 'Corbeille' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  renderTrash();

  document.getElementById('emptyTrash')?.addEventListener('click', () => {
    if (!rowsCount) { Toast.info('Corbeille déjà vide.'); return; }
    TTComponents.confirm({ title: 'Vider la corbeille', message: 'Supprimer définitivement tous les documents ?', danger: true }).then(async ok => {
      if (!ok) return;
      await AA.emptyTrash();
      Toast.success('Corbeille vidée.');
      renderTrash();
    });
  });
});

async function clientName(id){
  const client = await AA.getClient(id);
  return client.nom;
}

async function renderTrash() {
  const trash = await AA.getFactures('deleted');
  const tbody = document.getElementById('trashBody');
  const empty = document.getElementById('trashEmpty');

  if (!trash.length) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  async function buildRows(data) {
  const rows = await Promise.all(
    data.map(async (d) => {
      const client = await clientName(d.client);

      return `
    <tr>
      <td class="td-mono">${d.reference}</td>
      <td><span class="badge badge--deleted">${d.isProforma ? 'Proforma' : 'Facture'}</span></td>
      <td>${client}</td>
      <td class="text-secondary">${TT.formatDateTime(d.deletedAt)}</td>
      <td>
        <div class="row-actions" style="opacity:1">
          <button class="btn btn--secondary btn--sm" data-restore="${d.id}">Restaurer</button>
          <button class="action-btn action-btn--danger" data-purge="${d.id}"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>
        </div>
      </td>
    </tr>
  `;
    })
  );

  rowsCount = rows.length;

  return rows.join('');
}


tbody.innerHTML = await buildRows(trash);


  tbody.querySelectorAll('[data-restore]').forEach(btn => {
    btn.addEventListener('click', async () => {
      // TT.restoreFromTrash(btn.dataset.restore);
      const id = btn.dataset.restore;
      const data = {"facture":{
        "status":""
      }}
      await AA.updateFacture(id, data);
      Toast.success('Document restauré.');
      renderTrash();
    });
  });

  tbody.querySelectorAll('[data-purge]').forEach(btn => {
    btn.addEventListener('click', async () => {
      TTComponents.confirm({ title: 'Suppression définitive', message: 'Ce document ne pourra pas être récupéré.', danger: true }).then( async ok => {
        if (!ok) return;
        await AA.deleteFacture(btn.dataset.purge);
        Toast.success('Document supprimé définitivement.');
        renderTrash();
      });
    });
  });
}
