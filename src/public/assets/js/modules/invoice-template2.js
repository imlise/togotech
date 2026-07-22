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
        const lines = (doc.lines && doc.lines.length)
            ? doc.lines
            : [{
                nom: '',
                description: doc.objet,
                quantite: 1,
                prixUnitaire: doc.montant || 0,
                reduction: 0,
                image: null,
                montant: doc.montant || 0
            }];

        // garder uniquement les lignes utiles
        const withContent = lines.filter(l => l.description || l.prixUnitaire);

        if (!withContent.length) {
            return `
            <tr>
                <td colspan="6" style="text-align:center;padding:16px;color:#94a3b8;font-size:8px">
                Aucune ligne — ajoutez des produits ou prestations
                </td>
            </tr>`;
        }

        return withContent.map(l => `
            <tr>
            <td>${escapeHtml(l.nom || '') || '—'}</td>

            <td>
                <div class="pdf-line-desc">
                ${l.image ? `<div class="pdf-line-img" style="background-image:url('${l.image}')"></div>` : ''}
                <span>${escapeHtml(l.description || '') || '—'}</span>
                </div>
            </td>

            <td>${l.quantite ?? 0}</td>

            <td>${TT.formatNumber(l.prixUnitaire ?? 0)}</td>

            <td>${l.reduction ? l.reduction + '%' : '—'}</td>

            <td>${TT.formatNumber(l.montant ?? 0)}</td>
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

 

    const suiviRow = doc.suiviPar
      ? `<div class="pdf-meta-line"><span class="pdf-meta-line__label">Dossier suivi par</span><span class="pdf-meta-line__value">${escapeHtml(doc.suiviPar)}</span></div>`
      : '';

    const objetBand = doc.objet
      ? `<div class="pdf-section-band"><span>${escapeHtml(doc.objet)}</span></div>`
      : '';

    const conditionsBlock = doc.condition
      ? `<div class="pdf-conditions">
           <div class="pdf-conditions-title">Conditions générales</div>
           <div class="pdf-conditions-text">${formatConditionsHtml(doc.condition)}</div>
         </div>`
      : '<div></div>';

    const amountWords = doc.totalTtc > 0
      ? `<div class="pdf-amount-words">Arrêtée la présente facture à la somme de : <strong>${TT.amountToWords(doc.totalTtc)}</strong> TTC</div>`
      : '';

    const clientEmail = doc.email ? `<div class="pdf-meta-line" style="margin-top:2mm"><span class="pdf-meta-line__value" style="font-size:7px;font-weight:500">${escapeHtml(doc.email)}</span></div>` : '';
    const clientPhone = doc.telephone ? `<div class="pdf-meta-line"><span class="pdf-meta-line__value" style="font-size:7px;font-weight:500">${escapeHtml(doc.telephone)}</span></div>` : '';

    return `
          <div class="pdf-scale-wrap">
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
                   ${suiviRow}
          <div class="pdf-meta-line"><span class="pdf-meta-line__label">Contact</span><span class="pdf-meta-line__value">${escapeHtml(doc.contact) || '—'}</span></div>
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
          <div class="pdf-total-row"><span>Total H.T.</span><span>${fmt(doc.totalHt)}</span></div>
          <div class="pdf-total-row"><span>TVA (${totals.tvaRate}%)</span><span>${fmt(doc.tva)}</span></div>
          <div class="pdf-total-row pdf-total-final"><span>Total TTC</span><span>${fmt(doc.totalTtc)}</span></div>
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
                ${(() => {
          const banks = (settings.banks || []).filter(b => b.logo || b.name || b.account);
          if (!banks.length) return '';
          return `
        <div class="pdf-footer-banks">
                  <span>${banks.length > 1 ? 'Banques :' : 'Banque :'}</span>
          ${banks.map(bank => `
          <span class="pdf-footer-bank">
            ${bank.logo ? `<img src="${bank.logo}" alt="${escapeHtml(bank.name || 'Banque')}" />` : ''}
            ${bank.name ? `<span class="pdf-footer-bank-name">${escapeHtml(bank.name)}</span>` : ''}
            ${bank.account ? `<span class="pdf-footer-bank-account">N° compte : ${escapeHtml(bank.account)}</span>` : ''}
          </span>`).join('')}
        </div>`;
        })()}
        ${(() => {
          // Le RCCM et le NIF sont des mentions légales obligatoires : elles
          // doivent apparaître au pied de page du document (en plus de
          // l'en-tête), comme sur les factures de référence de l'entreprise.
          const parts = [];
          if (settings.address) parts.push(escapeHtml(settings.address));
          if (settings.nif) parts.push(`NIF : ${escapeHtml(settings.nif)}`);
          if (settings.rccm) parts.push(`RCCM : ${escapeHtml(settings.rccm)}`);
          if (!parts.length) return '';
          return `<div class="pdf-footer-legal">${parts.join(' &nbsp;·&nbsp; ')}</div>`;
        })()}
      </div>
      </div>
    `;
  }

  
 /**
   * À appeler juste après avoir injecté render(...) dans un conteneur
   * .pdf-page (pageEl.innerHTML = InvoiceTemplate.render(...)). Mesure la
   * hauteur naturelle du contenu et choisit entre 3 comportements :
   *
   *  1. Contenu ≤ 1 page → classe .pdf-page--pinned : le pied de page est
   *     collé en bas d'une page pleine (effet "papier à en-tête"), comme
   *     actuellement pour une facture courte.
   *  2. Contenu entre 1 page et ~1,2 page → on réduit légèrement tout le
   *     bloc (transform: scale) pour le faire tenir sur une seule page.
   *     Sans ça, le léger dépassement fait basculer le pied de page tout
   *     seul sur une 2e page presque vide.
   *  3. Contenu très supérieur à 1 page (facture avec beaucoup de lignes)
   *     → on ne force rien : le document s'étale naturellement sur
   *     plusieurs pages, comme un vrai document imprimé de plusieurs
   *     feuilles ; le pied de page suit simplement le contenu.
   *
   * @param {HTMLElement} pageEl - le conteneur .pdf-page (dont le premier
   *   enfant est .pdf-scale-wrap, produit par render() ci-dessus)
   * @param {number} [targetMm=297] - hauteur de page visée, en mm. 297 par
   *   défaut (aperçu écran + génération PDF, où l'on maîtrise exactement
   *   les mm). Utiliser une valeur plus prudente (ex. 265) juste avant un
   *   VRAI window.print() navigateur : la plupart des navigateurs ajoutent
   *   ~12-13mm de marge haut/bas même avec @page{margin:0}, donc viser
   *   297mm y ferait systématiquement déborder le pied de page sur une 2e
   *   page presque vide — exactement le bug qu'on cherche à éviter.
   */
  function fitToPage(pageEl, targetMm) {
    const wrap = pageEl && pageEl.querySelector('.pdf-scale-wrap');
    if (!wrap) return;
    targetMm = targetMm || 297;

    // Toujours repartir d'un état neutre avant de mesurer : sinon on
    // mesurerait un contenu déjà réduit par un appel précédent (facture
    // qui vient de perdre des lignes après avoir été longue, ou bascule
    // entre la cible 297mm et la cible 265mm de l'impression, par ex.).
    wrap.style.transform = '';
    wrap.style.minHeight = '';
    pageEl.classList.remove('pdf-page--pinned');

    const pageStyles = getComputedStyle(pageEl);
    const paddingY = parseFloat(pageStyles.paddingTop || 0) + parseFloat(pageStyles.paddingBottom || 0);
    // Hauteur de CONTENU visée = hauteur de page cible - padding haut/bas
    // de .pdf-page (10mm + 8mm par défaut, voir facture.css).
    const oneSheetPx = pageEl.clientWidth * (targetMm / 210) - paddingY;
    const naturalPx = wrap.scrollHeight;
    if (!oneSheetPx || !naturalPx) return;

    if (naturalPx <= oneSheetPx) {
      wrap.style.minHeight = oneSheetPx + 'px';
      pageEl.classList.add('pdf-page--pinned');
      return;
    }

    const overflowRatio = naturalPx / oneSheetPx;
    if (overflowRatio <= 1.2) {
      const ratio = oneSheetPx / naturalPx;
      // Scale uniforme (X et Y), sans compenser la largeur : compenser la
      // largeur obligerait le contenu à se ré-agencer sur une largeur plus
      // grande (retours à la ligne différents dans les descriptions du
      // tableau, etc.), ce qui invaliderait le ratio calculé ci-dessus —
      // mesuré à la largeur normale. On accepte donc une marge résiduelle
      // à droite/en bas, imperceptible pour un ratio aussi proche de 1.
      wrap.style.transform = `scale(${ratio})`;
    }
    // au-delà de 1.2 : vraie facture longue, flux multi-pages naturel,
    // on ne touche à rien de plus.
  }

  return { render, fitToPage };
})();
