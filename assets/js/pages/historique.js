'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'historique', title: 'Historique' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Historique' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  DocumentsTable.init({ getData: () => TT.getDocs() });

  document.getElementById('exportCSV')?.addEventListener('click', () => {
    const data = DocumentsTable.getSelected().length ? DocumentsTable.getSelected() : TT.getDocs();
    if (!data.length) { Toast.error('Aucune donnée.'); return; }
    const rows = data.map(d => [d.numero, d.type, d.client, d.objet, d.montant, d.date].join(','));
    TT.downloadFile(['N°,Type,Client,Objet,Montant,Date', ...rows].join('\n'), 'historique-togotech.csv', 'text/csv');
    Toast.success('Export CSV téléchargé.');
  });

  document.getElementById('exportPrint')?.addEventListener('click', () => DocumentsTable.print());
});
