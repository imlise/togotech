'use strict';


let clientsCache = [];
let docsCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  TTLayout.initShell({ page: 'historique', title: 'Historique' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard' }, { label: 'Historique' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  await loadData();

  DocumentsTable.init({
    getData: () => docsCache,
    onDelete: (doc) => AA.deleteFacture(doc.id),
    exportHandlers: bindExportHandlers,
  });

  document.getElementById('bulkExport')?.addEventListener('click', exportSelectedCSV);
  document.getElementById('bulkDelete')?.addEventListener('click', bulkDeleteSelected);
});

// --- Chargement des données ---

async function loadData() {
  try {
    const [factures, clients] = await Promise.all([AA.getFactures(), AA.getClients()]);
    clientsCache = clients;
    docsCache = factures.map(mapFactureToDoc);
  } catch (err) {
    console.error(err);
    Toast.error("Impossible de charger l'historique.");
    docsCache = [];
  }
}




// --- Adaptation vers le format attendu par DocumentsTable ---

function mapFactureToDoc(f) {
  const client = clientsCache.find(c => c.id === f.client);
  return {
    id: f.id,
    numero: f.reference,
    type: f.isProforma ? 'proforma' : 'facture',
    client: client ? client.nom : '—',
    objet: f.objet,
    montant: f.totalTtc,
    devise: 'FCFA',
    date: f.dateDePaiement ? new Date(f.createdAt) : null,
    status: f.dateDePaiement ? 'paid' : 'sent',
  };
}

// --- Suppression ---



async function bulkDeleteSelected() {
  const selected = DocumentsTable.getSelected();
  if (!selected.length) return;

  const ok = await TTComponents.confirm({
    title: 'Supprimer',
    message: `Supprimer ${selected.length} document(s) sélectionné(s) ?`,
    danger: true,
  });
  if (!ok) return;

  try {
    await Promise.all(selected.map(doc => AA.deleteFacture(doc.id)));
    const ids = new Set(selected.map(d => d.id));
    docsCache = docsCache.filter(d => !ids.has(d.id));
    DocumentsTable.refresh();
    Toast.success(`${selected.length} document(s) supprimé(s).`);
  } catch (err) {
    console.error(err);
    Toast.error('Erreur lors de la suppression groupée.');
  }
}

// --- Export ---

function exportSelectedCSV() {
  const selected = DocumentsTable.getSelected();
  if (!selected.length) return Toast.error('Aucun document sélectionné.');
  exportCSV(selected, 'export-selection.csv');
}

function bindExportHandlers() {
  document.getElementById('exportCSV')?.addEventListener('click', () => exportCSV(docsCache, 'historique.csv'));
  document.getElementById('exportPrint')?.addEventListener('click', () => DocumentsTable.print());
}

function exportCSV(docs, filename) {
  const headers = ['N°', 'Type', 'Client', 'Objet', 'Montant', 'Date', 'Statut'];
  const rows = docs.map(d => [
    d.numero, d.type, d.client, d.objet, d.montant,
    d.date ? d.date.toLocaleDateString('fr-FR') : '', d.status,
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}