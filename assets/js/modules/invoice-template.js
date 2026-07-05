'use strict';

/**
 * InvoiceTemplate
 * Source UNIQUE de la mise en page d'une facture/proforma.
 * Utilisé par : la page facture (aperçu en direct), la page document
 * (aperçu dans l'historique) et l'export PDF (facture.html, historique).
 * Toute modification de mise en page ne doit être faite qu'ici pour que
 * les trois rendus restent identiques.
 */
window.InvoiceTemplate = (function () {

  function typeLabel(type) {
    if (type === 'proforma') return 'Facture Proforma';
    if (type === 'devis') return 'Devis';
    return 'Facture';
  }

  function formatConditionsHtml(text) {
    if (!text) return '';
    return escapeHtml(text)
      .replace(/D&#232;s l&#39;accord|Dès l'accord/gi, '<span class="hl-blue">Dès l\'accord</span>')
      .replace(/60%.*?livraison/gi, m => `<span class="hl-accent">${m}</span>`);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function calcTotals(doc) {
    const lines = (doc.lines && doc.lines.length) ? doc.lines : [{ qty: 1, pu: doc.montant || 0, remise: 0 }];
    const tvaRate = doc.tva != null ? doc.tva : 18;
    let ht = 0;
    lines.forEach(l => {
      const lineTotal = (l.qty || 0) * (l.pu || 0) * (1 - (l.remise || 0) / 100);
      l._total = lineTotal;
      ht += lineTotal;
    });
    ht = ht * (1 - (doc.remise || 0) / 100);
    const tva = ht * (tvaRate / 100);
    const ttc = ht + tva;
    return { ht, tva, ttc, tvaRate };
  }

  function linesRowsHtml(doc) {
    const lines = (doc.lines && doc.lines.length) ? doc.lines : [{ ref: '', desc: doc.objet, qty: 1, pu: doc.montant || 0, remise: 0, image: '' }];
    const withContent = lines.filter(l => l.desc || l.pu);

    if (!withContent.length) {
      return '<tr><td colspan="6" style="text-align:center;padding:16px;color:#94a3b8;font-size:8px">Aucune ligne — ajoutez des produits ou prestations</td></tr>';
    }

    return withContent.map(l => `
      <tr>
        <td>${escapeHtml(l.ref) || '—'}</td>
        <td>
          <div class="pdf-line-desc">
            ${l.image ? `<div class="pdf-line-img" style="background-image:url('${l.image}')"></div>` : ''}
            <span>${escapeHtml(l.desc) || '—'}</span>
          </div>
        </td>
        <td>${l.qty}</td>
        <td>${TT.formatNumber(l.pu)}</td>
        <td>${l.remise ? l.remise + '%' : '—'}</td>
        <td>${TT.formatNumber(Math.round(l._total || 0))}</td>
      </tr>
    `).join('');
  }

  /**
   * Retourne le HTML interne (contenu) d'une page .pdf-page pour le
   * document donné. L'appelant est responsable d'englober ce HTML
   * dans un conteneur portant la classe "pdf-page".
   */
  function render(doc, settings) {
    settings = settings || TT.getSettings();
    const totals = calcTotals(doc);
    const devise = doc.devise || settings.devise || 'FCFA';
    const fmt = n => TT.formatCurrency(Math.round(n), devise);

    const echeanceRow = doc.echeance
      ? `<div class="pdf-meta-line"><span class="pdf-meta-line__label">Échéance</span><span class="pdf-meta-line__value">${TT.formatDate(doc.echeance)}</span></div>`
      : '';

    const objetBand = doc.objet
      ? `<div class="pdf-section-band"><span>${escapeHtml(doc.objet)}</span></div>`
      : '';

    const conditionsBlock = doc.conditions
      ? `<div class="pdf-conditions">
           <div class="pdf-conditions-title">Conditions générales</div>
           <div class="pdf-conditions-text">${formatConditionsHtml(doc.conditions)}</div>
         </div>`
      : '<div></div>';

    const amountWords = totals.ttc > 0
      ? `<div class="pdf-amount-words">Arrêtée la présente facture à la somme de : <strong>${TT.amountToWords(totals.ttc)}</strong> TTC</div>`
      : '';

    const clientEmail = doc.email ? `<div class="pdf-meta-line" style="margin-top:2mm"><span class="pdf-meta-line__value" style="font-size:7px;font-weight:500">${escapeHtml(doc.email)}</span></div>` : '';
    const clientPhone = doc.telephone ? `<div class="pdf-meta-line"><span class="pdf-meta-line__value" style="font-size:7px;font-weight:500">${escapeHtml(doc.telephone)}</span></div>` : '';

    return `
      <div class="pdf-accent-bar"></div>

      <div class="pdf-top">
        <div class="pdf-brand-block">
          <div class="pdf-logo"><img src="${settings.logo || 'assets/img/logo-togotech.png'}" alt="Logo" /></div>
          <div class="pdf-company-info">
            <strong class="pdf-company-name">${escapeHtml(settings.company)}</strong>
            <span class="pdf-company-tagline">${escapeHtml(settings.tagline || '')}</span>
            <span>${escapeHtml(settings.address || '')}</span>
            <span>${escapeHtml(settings.phone || '')}</span>
            <span>${escapeHtml(settings.email || '')}</span>
            ${settings.rccm ? `<span>RCCM : ${escapeHtml(settings.rccm)}</span>` : ''}
            ${settings.nif ? `<span>NIF : ${escapeHtml(settings.nif)}</span>` : ''}
          </div>
        </div>
        <div class="pdf-tagline-block">
          <div class="pdf-tagline-main">Solutions informatiques &amp; télécoms</div>
          <div class="pdf-tagline-sub">Ingénierie · Consulting · Vente · Maintenance · Réseau · Formation</div>
        </div>
      </div>

      <div class="pdf-meta-grid">
        <div class="pdf-meta-box">
          <div class="pdf-meta-box__label">Client</div>
          <div class="pdf-meta-box__value">${escapeHtml(doc.client) || '—'}</div>
          ${clientEmail}
          ${clientPhone}
        </div>
        <div class="pdf-meta-box pdf-meta-box--center">
          <div class="pdf-meta-box__doc-type">${typeLabel(doc.type)}</div>
          <div class="pdf-meta-box__doc-num">${escapeHtml(doc.numero) || '—'}</div>
        </div>
        <div class="pdf-meta-box">
          <div class="pdf-meta-line"><span class="pdf-meta-line__label">Date</span><span class="pdf-meta-line__value">${TT.formatDate(doc.date)}</span></div>
          ${echeanceRow}
          <div class="pdf-meta-line"><span class="pdf-meta-line__label">Contact</span><span class="pdf-meta-line__value">${escapeHtml(settings.company)}</span></div>
        </div>
      </div>

      ${objetBand}

      <table class="pdf-table">
        <thead>
          <tr>
            <th class="pdf-th-ref">Réf.</th>
            <th class="pdf-th-desc">Description</th>
            <th class="pdf-th-qty">Qté</th>
            <th class="pdf-th-pu">P.U.</th>
            <th class="pdf-th-rem">R %</th>
            <th class="pdf-th-total">Montant</th>
          </tr>
        </thead>
        <tbody>${linesRowsHtml(doc)}</tbody>
      </table>

      <div class="pdf-bottom">
        ${conditionsBlock}
        <div class="pdf-totals">
          <div class="pdf-total-row"><span>Total H.T.</span><span>${fmt(totals.ht)}</span></div>
          <div class="pdf-total-row"><span>TVA (${totals.tvaRate}%)</span><span>${fmt(totals.tva)}</span></div>
          <div class="pdf-total-row pdf-total-final"><span>Total TTC</span><span>${fmt(doc.montant != null ? doc.montant : totals.ttc)}</span></div>
        </div>
      </div>

      ${amountWords}

      <div class="pdf-signatures">
        <div class="pdf-signature-block">
          <div class="pdf-signature-label">Pour accord</div>
          <div class="pdf-signature-box"></div>
        </div>
        <div class="pdf-signature-block">
          <div class="pdf-signature-label">Le Service Commercial</div>
          <div class="pdf-signature-box"></div>
        </div>
      </div>

      <div class="pdf-footer">
        <div><strong>${escapeHtml(settings.company)}</strong> — ${escapeHtml(settings.footer || 'Merci de votre confiance')}</div>
        <div class="pdf-footer-banks">
          <span>Banques :</span>
          <img src="assets/images/orabank.png" alt="Orabank" />
        </div>
      </div>
    `;
  }

  return { render };
})();
