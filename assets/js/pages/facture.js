'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'facture', title: 'Nouvelle facture' });

  const header = document.getElementById('app-header');
  if (header) {
    header.innerHTML = TTLayout.renderHeader({
      breadcrumb: [
        { label: 'Dashboard', href: 'dashboard.html' },
        { label: 'Nouvelle facture' },
      ],
    }).replace(/^<header class="app-header">|<\/header>$/g, '');
  }

  InvoiceEditor.init();
});

const InvoiceEditor = (function () {
  let docType = 'facture';
  let zoom = 1;
  let userSetZoom = false;
  let editId = null;
  let lines = [];
  const settings = TT.getSettings();

  const $ = id => document.getElementById(id);

  function init() {
    const params = new URLSearchParams(location.search);
    editId = params.get('id');
    docType = params.get('type') || (params.get('edit') ? null : 'facture') || 'facture';

    if (params.get('type') === 'proforma') setType('proforma');

    loadSettings();
    populateClients();
    bindEvents();

    const clientParam = params.get('client');
    if (editId) {
      loadDocument(editId);
    } else {
      resetForm(false);
      if (clientParam) {
        $('fClient').value = decodeURIComponent(clientParam);
        autofillClient();
      }
    }

    addLine();
    syncAll();
    requestAnimationFrame(fitZoomToContainer);
  }

  function loadSettings() {
    $('fConditions').value = settings.conditions;
    $('fTva').value = settings.tva || 18;
  }

  function populateClients() {
    const dl = $('clientList');
    dl.innerHTML = TT.getClients().map(c => `<option value="${c.name}">`).join('');
  }

  function bindEvents() {
    document.querySelectorAll('.segmented__btn').forEach(btn => {
      btn.addEventListener('click', () => setType(btn.dataset.type));
    });

    ['fNumero','fDate','fEcheance','fObjet','fClient','fEmail','fTelephone','fAdresse','fTva','fRemise','fConditions','fDevise'].forEach(id => {
      $(id)?.addEventListener('input', syncAll);
      $(id)?.addEventListener('change', syncAll);
    });

    $('fClient')?.addEventListener('change', autofillClient);

    $('addLineBtn')?.addEventListener('click', () => { addLine(); syncAll(); });
    $('resetBtn')?.addEventListener('click', () => TTComponents.confirm({ title: 'Réinitialiser', message: 'Effacer toutes les données du formulaire ?', danger: true }).then(ok => { if (ok) resetForm(true); }));
    $('duplicateBtn')?.addEventListener('click', duplicateDoc);
    $('saveDraftBtn')?.addEventListener('click', () => saveDocument('draft'));
    $('invoiceForm')?.addEventListener('submit', e => { e.preventDefault(); saveDocument('sent'); });
    $('downloadPdfBtn')?.addEventListener('click', exportPdf);
    $('printBtn')?.addEventListener('click', printPreview);
    $('zoomIn')?.addEventListener('click', () => setZoom(zoom + 0.1, true));
    $('zoomOut')?.addEventListener('click', () => setZoom(zoom - 0.1, true));

    // Réajuste automatiquement le zoom dès que la taille RÉELLE du panneau
    // d'aperçu change, quelle qu'en soit la cause (sidebar qui se replie/
    // déplie, police qui finit de charger, redimensionnement de fenêtre…).
    // Un ResizeObserver est fiable dans tous ces cas, contrairement à un
    // simple listener 'resize' + 'transitionend' qui pouvait rater le bon
    // moment et laisser l'aperçu calculé sur une largeur provisoire
    // (symptôme : la facture dépasse / semble décalée vers la droite).
    const previewScrollEl = $('previewScroll');
    if (previewScrollEl && 'ResizeObserver' in window) {
      const ro = new ResizeObserver(() => { if (!userSetZoom) fitZoomToContainer(); });
      ro.observe(previewScrollEl);
    } else {
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (!userSetZoom) fitZoomToContainer(); }, 120);
      });
    }
  }

  function setType(type) {
    docType = type;
    document.querySelectorAll('.segmented__btn').forEach(b => b.classList.toggle('is-active', b.dataset.type === type));
    $('editorTitle').textContent = type === 'proforma' ? 'Nouvelle proforma' : 'Nouvelle facture';
    if (!editId) $('fNumero').value = TT.nextNumero(type);
    const label = type === 'proforma' ? 'Facture Proforma' : 'Facture';
    if ($('pdfDocTypeLabel')) $('pdfDocTypeLabel').textContent = label;
    syncAll();
  }

  function formatConditionsHtml(text) {
    if (!text) return '';
    return text
      .replace(/Dès l'accord/gi, '<span class="hl-blue">Dès l\'accord</span>')
      .replace(/60%.*?livraison/gi, m => `<span class="hl-red">${m}</span>`);
  }

  function autofillClient() {
    const name = $('fClient').value;
    const client = TT.getClients().find(c => c.name === name);
    if (client) {
      $('fEmail').value = client.email || '';
      $('fTelephone').value = client.phone || '';
      $('fAdresse').value = client.address || '';
      syncAll();
    }
  }

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 220) + 'px';
  }

  function addLine(data = {}) {
    const id = TT.genId();
    lines.push({ id, ref: data.ref || '', desc: data.desc || '', qty: data.qty || 1, pu: data.pu || 0, remise: data.remise || 0, image: data.image || '' });
    renderLines();
  }

  function renderLines() {
    const container = $('linesContainer');
    container.innerHTML = lines.map((line, idx) => `
      <div class="line-row" data-id="${line.id}">
        <input type="text" class="field__input line-ref text-mono" placeholder="Réf." value="${line.ref || ''}" aria-label="Référence / N° de série" />
        <textarea class="field__textarea line-desc" placeholder="Description" rows="1">${line.desc}</textarea>
        <label class="line-img-upload" title="Ajouter une image">
          ${line.image ? `<img src="${line.image}" alt="">` : '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'}
          <input type="file" accept="image/*" hidden class="line-img-input" />
        </label>
        <input type="number" class="field__input line-qty" value="${line.qty}" min="1" step="1" aria-label="Quantité" />
        <input type="number" class="field__input line-pu" value="${line.pu}" min="0" step="100" aria-label="Prix unitaire" />
        <input type="number" class="field__input line-rem" value="${line.remise}" min="0" max="100" step="0.5" aria-label="Remise %" />
        <input type="text" class="field__input line-total text-mono" readonly tabindex="-1" aria-label="Total ligne" />
        <button type="button" class="line-del" aria-label="Supprimer la ligne" ${lines.length <= 1 ? 'disabled style="opacity:.3"' : ''}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.line-row').forEach(row => {
      const id = row.dataset.id;
      const descEl = row.querySelector('.line-desc');
      if (descEl) {
        autoGrow(descEl);
        descEl.addEventListener('input', e => { autoGrow(e.target); updateLine(id, 'desc', e.target.value); });
      }
      row.querySelector('.line-ref')?.addEventListener('input', e => { updateLine(id, 'ref', e.target.value); });
      row.querySelector('.line-qty')?.addEventListener('input', e => { updateLine(id, 'qty', +e.target.value); });
      row.querySelector('.line-pu')?.addEventListener('input', e => { updateLine(id, 'pu', +e.target.value); });
      row.querySelector('.line-rem')?.addEventListener('input', e => { updateLine(id, 'remise', +e.target.value); });
      row.querySelector('.line-img-input')?.addEventListener('change', e => handleImage(id, e));
      row.querySelector('.line-del')?.addEventListener('click', () => { if (lines.length > 1) { lines = lines.filter(l => l.id !== id); renderLines(); syncAll(); } });
    });
  }

  function updateLine(id, key, val) {
    const line = lines.find(l => l.id === id);
    if (line) { line[key] = val; syncAll(); }
  }

  function handleImage(id, e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const line = lines.find(l => l.id === id);
      if (line) { line.image = ev.target.result; renderLines(); syncAll(); }
    };
    reader.readAsDataURL(file);
  }

  function calcTotals() {
    const globalRemise = parseFloat($('fRemise')?.value) || 0;
    const tvaRate = parseFloat($('fTva')?.value) || 0;
    const devise = $('fDevise')?.value || 'FCFA';

    let ht = 0;
    lines.forEach(line => {
      const lineTotal = line.qty * line.pu * (1 - (line.remise || 0) / 100);
      line._total = lineTotal;
      ht += lineTotal;
    });

    ht = ht * (1 - globalRemise / 100);
    const tva = ht * (tvaRate / 100);
    const ttc = ht + tva;

    return { ht, tva, ttc, tvaRate, devise };
  }

  function syncAll() {
    const totals = calcTotals();
    const fmt = n => TT.formatCurrency(Math.round(n), totals.devise);

    $('totalHT').textContent = fmt(totals.ht);
    $('totalTVA').textContent = fmt(totals.tva);
    $('totalTTC').textContent = fmt(totals.ttc);
    $('tvaRateLabel').textContent = totals.tvaRate;

    document.querySelectorAll('.line-row').forEach(row => {
      const line = lines.find(l => l.id === row.dataset.id);
      if (line) row.querySelector('.line-total').value = TT.formatNumber(Math.round(line._total || 0));
    });

    // Aperçu PDF — rendu par la même fonction que la page "Voir" et l'export PDF,
    // afin que les trois affichages soient toujours strictement identiques.
    $('pdfPage').innerHTML = InvoiceTemplate.render(getFormData(), TT.getSettings());
    // Le contenu peut changer de hauteur (ajout/suppression de lignes) :
    // on resynchronise la taille du wrapper avec le zoom courant.
    applyZoom(zoom);

    // "Dupliquer" n'a de sens que sur un document déjà existant : sur une
    // facture pas encore créée, il n'y a rien à dupliquer.
    const dupBtn = $('duplicateBtn');
    if (dupBtn) dupBtn.hidden = !editId;
  }

  function getFormData() {
    const totals = calcTotals();
    return {
      id: editId || TT.genId(),
      numero: $('fNumero').value,
      type: docType,
      client: $('fClient').value,
      email: $('fEmail').value,
      telephone: $('fTelephone').value,
      adresse: $('fAdresse').value,
      objet: $('fObjet').value,
      date: $('fDate').value,
      echeance: $('fEcheance').value,
      devise: $('fDevise').value,
      tva: parseFloat($('fTva').value) || 0,
      remise: parseFloat($('fRemise').value) || 0,
      conditions: $('fConditions').value,
      montant: Math.round(totals.ttc),
      lines: TT.clone(lines),
      status: 'sent',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  function saveDocument(status) {
    if (!$('fClient').value || !$('fObjet').value) {
      Toast.error('Veuillez renseigner le client et l\'objet.');
      return;
    }

    const data = getFormData();
    data.status = status;

    if (status === 'draft') {
      const drafts = TT.getDrafts().filter(d => d.id !== data.id);
      drafts.unshift(data);
      TT.saveDrafts(drafts);
      Toast.success('Brouillon enregistré.');
      TT.addNotification('draft', `Brouillon ${data.numero} enregistré.`);
      return;
    }

    let docs = TT.getDocs();
    if (editId) {
      docs = docs.map(d => d.id === editId ? { ...d, ...data, createdAt: d.createdAt } : d);
    } else {
      docs.unshift(data);
      TT.incrementNumero();
    }
    TT.saveDocs(docs);
    TT.addNotification('create', `${docType === 'proforma' ? 'Proforma' : 'Facture'} ${data.numero} enregistrée.`);
    Toast.success('Document enregistré avec succès.');
    setTimeout(() => { window.location.href = `document.html?id=${data.id}`; }, 800);
  }

  function duplicateDoc() {
    editId = null;
    $('fNumero').value = TT.nextNumero(docType);
    Toast.info('Document dupliqué — modifiez et enregistrez.');
  }

  function resetForm(showToast) {
    editId = null;
    setType(docType);
    $('fDate').value = TT.todayISO();
    $('fEcheance').value = TT.addDaysISO(30);
    $('fClient').value = '';
    $('fEmail').value = '';
    $('fTelephone').value = '';
    $('fAdresse').value = '';
    $('fObjet').value = '';
    $('fRemise').value = '0';
    $('fDevise').value = settings.devise || 'FCFA';
    $('fConditions').value = settings.conditions;
    lines = [];
    addLine();
    if (showToast) Toast.info('Formulaire réinitialisé.');
    syncAll();
  }

  function loadDocument(id) {
    const doc = TT.getDocById(id) || TT.getDrafts().find(d => d.id === id);
    if (!doc) { Toast.error('Document introuvable.'); return; }

    editId = id;
    setType(doc.type || 'facture');
    $('fNumero').value = doc.numero;
    $('fDate').value = doc.date;
    $('fEcheance').value = doc.echeance || '';
    $('fClient').value = doc.client || '';
    $('fEmail').value = doc.email || '';
    $('fTelephone').value = doc.telephone || '';
    $('fAdresse').value = doc.adresse || '';
    $('fObjet').value = doc.objet || '';
    $('fTva').value = doc.tva || settings.tva;
    $('fRemise').value = doc.remise || 0;
    $('fDevise').value = doc.devise || 'FCFA';
    $('fConditions').value = doc.conditions || settings.conditions;
    $('editorTitle').textContent = 'Modifier — ' + doc.numero;

    lines = doc.lines?.length ? TT.clone(doc.lines) : [{ id: TT.genId(), ref: '', desc: doc.objet, qty: 1, pu: doc.montant || 0, remise: 0, image: '' }];
    renderLines();
    syncAll();
  }

  // Point unique qui applique le zoom : transform visuel sur .pdf-page,
  // ET taille pixel réelle (déjà mise à l'échelle) sur .preview-page-wrap.
  // C'est ce deuxième point qui manquait avant — sans lui, le navigateur
  // réserve l'espace de mise en page à la taille non réduite (794px),
  // créant un vide fantôme et un mauvais centrage/débordement.
  function applyZoom(z) {
    const page = $('pdfPage');
    const wrap = $('previewWrap');
    if (!page || !wrap) return;
    page.style.transform = `scale(${z})`;
    wrap.style.width = (page.offsetWidth * z) + 'px';
    wrap.style.height = (page.offsetHeight * z) + 'px';
  }

  function setZoom(z, isUserAction) {
    if (isUserAction) userSetZoom = true;
    zoom = Math.max(0.3, Math.min(1.5, z));
    applyZoom(zoom);
    $('zoomLevel').textContent = Math.round(zoom * 100) + '%';
  }

  // Calcule automatiquement un zoom qui fait tenir la page A4 (210mm)
  // dans la largeur disponible du panneau d'aperçu, pour que l'aperçu
  // en direct n'ait jamais besoin de scroll horizontal par défaut.
  // L'utilisateur garde la main : dès qu'il zoome manuellement, cette
  // fonction ne touche plus au zoom (voir userSetZoom).
  function fitZoomToContainer() {
    if (userSetZoom) return;
    const scroll = $('previewScroll');
    const page = $('pdfPage');
    if (!scroll || !page || !page.offsetWidth) return;

    const styles = getComputedStyle(scroll);
    const paddingX = parseFloat(styles.paddingLeft || 0) + parseFloat(styles.paddingRight || 0);
    const available = scroll.clientWidth - paddingX;
    if (available <= 0) return;

    const fitted = Math.min(1, available / page.offsetWidth);
    zoom = Math.max(0.3, Math.floor(fitted * 20) / 20); // arrondi au 1/20 (5%) vers le bas : ne dépasse jamais
    applyZoom(zoom);
    $('zoomLevel').textContent = Math.round(zoom * 100) + '%';
  }

  async function exportPdf() {
    const btn = $('downloadPdfBtn');
    const previousZoom = zoom;
    const previousLabel = btn ? btn.textContent : '';

    if (!PdfExport.librariesReady()) {
      Toast.error('La génération du PDF n\'a pas pu être chargée. Vérifiez votre connexion et réessayez.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }
    // Le PDF doit refléter fidèlement la mise en page réelle : on capture
    // toujours la page à échelle 1, quel que soit le zoom d'aperçu affiché.
    applyZoom(1);

    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const filename = `${$('fNumero')?.value || (docType === 'proforma' ? 'proforma' : 'facture')}.pdf`;
      await PdfExport.download($('pdfPage'), filename);
      Toast.success('PDF téléchargé.');
    } catch (err) {
      console.error(err);
      Toast.error(err?.message || 'Erreur lors de la génération du PDF.');
    } finally {
      applyZoom(previousZoom);
      if (btn) { btn.disabled = false; btn.textContent = previousLabel; }
    }
  }

  // Imprime le DOM live directement (window.print()) : le CSS @media print
  // ci-dessous s'occupe de masquer l'éditeur, neutraliser le zoom et forcer
  // les couleurs de fond. On évite volontairement le passage par
  // html2canvas + iframe, qui échouait silencieusement (le clic ne
  // déclenchait aucune boîte de dialogue d'impression sur certains
  // navigateurs) et n'apportait rien que le CSS d'impression ne fasse déjà.
  function printPreview() {
    window.print();
  }

  return { init };
})();
