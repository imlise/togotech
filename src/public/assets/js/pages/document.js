'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  TTLayout.initShell({ page: 'historique', title: 'Document' });

  const container = document.getElementById('docContent');
  const id = new URLSearchParams(location.search).get('id');
  // const doc = id ? TT.getDocById(id) : null;
  let doc = null;
  let lines = [];

if (id) {
  try {
    const result = await AA.getFacture(id);

    doc = result;
   
    // 🔥 récupérer les lignes ici
    const lignesResult = await AA.getFactureLignes(doc.id);

    lines = lignesResult.data ?? lignesResult;

    console.log(doc);
    console.log(lines);
  } catch (error) {
    console.error('Erreur lors du chargement de la facture :', error);
    Toast.error('Impossible de charger la facture.');
  }
}


  if (!doc) {
    container.innerHTML = `<div class="empty-state"><h2 class="empty-state__title">Document introuvable</h2><a href="historique.html" class="btn btn--secondary" style="margin-top:var(--space-4)">Retour à l'historique</a></div>`;
    return;
  }

// seulement maintenant doc existe
let client = null;

try {
  client = await AA.getClient(doc.client);
} catch (error) {
  console.error('Erreur chargement client :', error);
  Toast.error('Client introuvable.');

  client = {
    nom: 'Client inconnu'
  };
}





  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [
      { label: 'Dashboard', href: 'dashboard.html' },
      { label: 'Historique', href: 'historique.html' },
      { label: doc.reference },
    ],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  let doc_send = {
    numero : doc.reference,
    date : doc.createdAt,
    // contact : doc.contact,
    client : client.nom,
    email:client.email,
    telephone:client.phone,
    adresse:client.adresse,
    objet:doc.objet,
    condition: doc.condition,
    lines:lines,
    ...doc
  };

const typeLabel = doc.isProforma ? 'Proforma' : 'Facture';

  container.innerHTML = `
    <div class="page-head">
      <div class="page-head__text">
        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)">
          <h1 class="page-head__title">${doc.reference}</h1>
          <span class="badge badge--${doc.type}">${typeLabel}</span>
          <span class="badge badge--${doc.status || 'sent'}">${doc.status === 'paid' ? 'Payée' : doc.status === 'draft' ? 'Brouillon' : 'Envoyée'}</span>
        </div>
        <p class="page-head__sub">${doc.objet} — ${client.nom}</p>
      </div>
      <div class="page-head__actions">
        <button class="btn btn--danger btn--sm" id="deleteDoc">Supprimer</button>
        <button class="btn btn--secondary btn--sm" id="duplicateDoc">Dupliquer</button>
        <button class="btn btn--secondary btn--sm" id="printDoc">Imprimer</button>
        <button class="btn btn--navy btn--sm" id="downloadPdfDoc">Télécharger PDF</button>
        <a href="facture.html?id=${doc.id}&edit=1" class="btn btn--primary btn--sm">Modifier</a>
      </div>
    </div>

    <div class="doc-detail-grid">
      <div class="card">
        <div class="card__header"><h2 class="card__title">Aperçu</h2></div>
        <div class="card__body" style="padding:var(--space-4);background:var(--color-bg-muted);display:flex;justify-content:center;justify-content:safe center;overflow:auto">
          <div class="preview-page-wrap" style="flex:none">
            <div class="pdf-page" id="docPdfPage" style="box-shadow:var(--shadow-lg);transform:scale(0.65);transform-origin:top left">
            ${InvoiceTemplate.render(doc_send, TT.getSettings())}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:var(--space-4)">
          <div class="card__header"><h2 class="card__title">Informations</h2></div>
          <div class="card__body">
            <div class="doc-meta-list">
              <div class="doc-meta-item"><span class="doc-meta-label">Client</span><span class="doc-meta-value">${client.nom}</span></div>
              <div class="doc-meta-item"><span class="doc-meta-label">Montant TTC</span><span class="doc-meta-value text-mono">${TT.formatCurrency(doc.totalHt, doc.devise)}</span></div>
              <div class="doc-meta-item"><span class="doc-meta-label">Date d'émission</span><span class="doc-meta-value">${TT.formatDate(doc.createdAt)}</span></div>
                            <div class="doc-meta-item"><span class="doc-meta-label">Dossier suivi par</span><span class="doc-meta-value">${doc.suiviPar || '—'}</span></div>
              <div class="doc-meta-item"><span class="doc-meta-label">Contact</span><span class="doc-meta-value">${doc.contact || '—'}</span></div>
              <div class="doc-meta-item"><span class="doc-meta-label">TVA</span><span class="doc-meta-value">${doc.tva || 18}%</span></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__header"><h2 class="card__title">Historique</h2></div>
          <div class="card__body">
            <div class="doc-timeline">
              <div class="doc-timeline__item">
                <div class="text-body-sm"><strong>Document créé</strong></div>
                <div class="text-caption">${TT.formatDateTime(doc.createdAt || doc.date)}</div>
              </div>
              <div class="doc-timeline__item">
                <div class="text-body-sm"><strong>Dernière modification</strong></div>
                <div class="text-caption">${TT.formatDateTime(doc.updatedAt || doc.date)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Imprime le DOM live (le même noeud #docPdfPage déjà affiché dans la
  // carte "Aperçu") via window.print(). Le CSS @media print masque le
  // reste de la page et neutralise le zoom (transform:scale) de la carte.
   //
  // Filet de sécurité : la carte "Aperçu" (.card__body) a un fond bleu
  // pâle (--color-bg-muted) et un overflow:auto à l'écran (zoom réduit à
  // 65%). Le CSS @media print le repasse en transparent/visible, mais
  // certains moteurs d'impression (notamment "Enregistrer en PDF" de
  // Chrome) appliquent ça de façon peu fiable sur un conteneur qui était
  // scrollable à l'écran, laissant un résidu bleuté sous le pied de page.
  // On force donc aussi ce style en JS, le temps strict de l'impression.
  let printCardBackup = null;
  function prepareForPrint() {
    const cardBody = document.querySelector('.doc-detail-grid .card__body');
    printCardBackup = cardBody ? cardBody.getAttribute('style') : null;
    if (cardBody) { cardBody.style.background = '#ffffff'; cardBody.style.padding = '0'; cardBody.style.overflow = 'visible'; }
    // Cible prudente (265mm, pas 297mm) : voir le commentaire dans le
    // bloc @media print de facture.css pour l'explication complète.
    InvoiceTemplate.fitToPage(document.getElementById('docPdfPage'), 265);
  }
  function restoreAfterPrint() {
    const cardBody = document.querySelector('.doc-detail-grid .card__body');
    if (cardBody) { printCardBackup != null ? cardBody.setAttribute('style', printCardBackup) : cardBody.removeAttribute('style'); }
    InvoiceTemplate.fitToPage(document.getElementById('docPdfPage')); // retour à la cible normale (297mm)
  }
  window.addEventListener('beforeprint', prepareForPrint);
  window.addEventListener('afterprint', restoreAfterPrint);
  document.getElementById('printDoc')?.addEventListener('click', () => printDocument(doc));
  document.getElementById('downloadPdfDoc')?.addEventListener('click', () => downloadPdf(doc));

  // .pdf-page est en position:absolute avec transform-origin:top left
  // (voir facture.css, partagée avec l'éditeur de facture) : c'est
  // .preview-page-wrap, son parent, qui doit porter la taille PIXEL déjà
  // réduite pour que la mise en page sache combien de place occupe la
  // version réduite. Sans ça le wrapper n'a aucune taille propre (son
  // unique enfant est absolute, il ne compte plus dans le calcul de
  // taille automatique) et l'aperçu entier disparaît.
  (function fitDocPreview() {
    const page = document.getElementById('docPdfPage');
    const wrap = page?.closest('.preview-page-wrap');
    if (!page || !wrap) return;
    InvoiceTemplate.fitToPage(page);
    const zoom = 0.65;
    wrap.style.width = (page.offsetWidth * zoom) + 'px';
    wrap.style.height = (page.offsetHeight * zoom) + 'px';
  })();
  document.getElementById('duplicateDoc')?.addEventListener('click', () => {
    window.location.href = `facture.html?id=${doc.id}&edit=1`;
    Toast.info('Dupliquez et modifiez le document.');
  });
  document.getElementById('deleteDoc')?.addEventListener('click', async () => {
    TTComponents.confirm({ title: 'Supprimer', message: `Déplacer ${doc.reference} vers la corbeille ?`, danger: true }).then(async ok => {
      if (!ok) return;
      
  try {
    console.log(doc)
    await AA.deleteFacture(doc.id);

    Toast.success('Facture supprimée avec succès.');

    // setTimeout(() => {
    //   location.href = 'historique.html';
    // }, 600);

  } catch (err) {
    console.error(err);
    Toast.error('Erreur lors de la suppression.');
  }
    });
  });

  // On génère le PDF/impression à partir d'une copie non réduite (échelle 1)
  // du même template que l'aperçu, pour un rendu net et strictement fidèle.
  function getExportNode(docData) {
    let exportNode = document.getElementById('pdfExportNode');
    if (!exportNode) {
      exportNode = document.createElement('div');
      exportNode.id = 'pdfExportNode';
      exportNode.className = 'pdf-page';
      exportNode.style.position = 'fixed';
      exportNode.style.left = '-9999px';
      exportNode.style.top = '0';
      document.body.appendChild(exportNode);
    }
    exportNode.innerHTML = InvoiceTemplate.render(docData, TT.getSettings());
    InvoiceTemplate.fitToPage(exportNode);
    return exportNode;
  }
  
   // Imprime le même rendu PDF que downloadPdf() (voir pdf-export.js:
  // print()), au lieu de window.print() sur la carte "Aperçu" réduite à
  // 65 %. Évite l'espace blanc résiduel en bas de page lié à la hauteur
  // de page "cible" en CSS d'impression (voir facture.js: printPreview()
  // pour le détail).
  async function printDocument(docData) {
    const btn = document.getElementById('printDoc');

    if (!window.PdfExport || !PdfExport.librariesReady()) {
      window.print();
      return;
    }

    const label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Préparation…'; }

    const exportNode = getExportNode(docData);

    try {
      await PdfExport.print(exportNode);
    } catch (err) {
      console.error(err);
      Toast.error('Impression via le PDF impossible, ouverture de l\'aperçu classique.');
      window.print();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    }
  }

  async function downloadPdf(docData) {
    const btn = document.getElementById('downloadPdfDoc');
    if (!window.PdfExport || !PdfExport.librariesReady()) {
      Toast.error('La génération du PDF n\'a pas pu être chargée. Vérifiez votre connexion et réessayez.');
      return;
    }

    const label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }

    const exportNode = getExportNode(docData);

    try {
      await PdfExport.download(exportNode, `${docData.numero}.pdf`);
      Toast.success('PDF téléchargé.');
    } catch (err) {
      console.error(err);
      Toast.error(err?.message || 'Erreur lors de la génération du PDF.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    }
  }

});
