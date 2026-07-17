'use strict';

window.DocumentsTable = (function () {

  let config = {};
  let state = {};

  function init(options) {
    config = {
      tbodyId:       'tableBody',
      searchId:      'tableSearch',
      filterContainer: 'filterPills',
      paginationInfo: 'paginationInfo',
      paginationControls: 'paginationControls',
      perPageId:     'perPage',
      checkAllId:    'checkAll',
      bulkBarId:     'bulkBar',
      emptyId:       'tableEmpty',
      getData:       () => TT.getDocs(),
      // getData:       () => AA.getFactures(),
      onDelete:      (doc) => TT.moveToTrash(doc),
      ...options,
    };

    state = {
      all: config.getData(),
      filtered: [],
      sortCol: 'date',
      sortDir: 'desc',
      page: 1,
      perPage: 10,
      filterType: 'all',
      filterStatus: 'all',
      search: '',
      selected: new Set(),
    };

    bindEvents();
    applyFilter();
  }

  function bindEvents() {
    document.getElementById(config.searchId)?.addEventListener('input', TT.debounce(e => {
      state.search = e.target.value.trim();
      applyFilter();
    }, 250));

    document.getElementById(config.perPageId)?.addEventListener('change', e => {
      state.perPage = parseInt(e.target.value, 10);
      applyFilter();
    });

    document.querySelectorAll('[data-filter-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-type]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.filterType = btn.dataset.filterType;
        applyFilter();
      });
    });

    document.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (state.sortCol === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortCol = col; state.sortDir = 'asc'; }
        document.querySelectorAll('th.sortable').forEach(h => h.classList.remove('is-sorted'));
        th.classList.add('is-sorted');
        applyFilter();
      });
    });

    document.getElementById(config.checkAllId)?.addEventListener('change', e => {
      const page = getPageData();
      page.forEach(d => e.target.checked ? state.selected.add(d.id) : state.selected.delete(d.id));
      render();
    });



    config.exportHandlers?.();
  }

  function applyFilter() {
    state.filtered = state.all.filter(d => {
      if (state.filterType !== 'all' && d.type !== state.filterType) return false;
      if (state.filterStatus !== 'all' && d.status !== state.filterStatus) return false;
      if (state.search) {
        const q = state.search.toLowerCase();
        return (d.numero + d.client + d.objet).toLowerCase().includes(q);
      }
      return true;
    });

    state.filtered.sort((a, b) => {
      let va = a[state.sortCol], vb = b[state.sortCol];
      if (state.sortCol === 'montant') { va = +va; vb = +vb; }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
      if (va > vb) return state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    state.page = 1;
    state.selected.clear();
    render();
    updateBulkBar();
  }

  function getPageData() {
    const start = (state.page - 1) * state.perPage;
    return state.filtered.slice(start, start + state.perPage);
  }

  function render() {
    const tbody = document.getElementById(config.tbodyId);
    const empty = document.getElementById(config.emptyId);
    if (!tbody) return;

    const page = getPageData();

    if (!state.filtered.length) {
      tbody.innerHTML = '';
      if (empty) empty.hidden = false;
      renderPagination(0);
      return;
    }
    if (empty) empty.hidden = true;

    tbody.innerHTML = page.map(doc => `
      <tr class="${state.selected.has(doc.id) ? 'is-selected' : ''}" data-id="${doc.id}">
        <td>
          <label class="check">
            <input type="checkbox" class="check__input row-check" data-id="${doc.id}" ${state.selected.has(doc.id) ? 'checked' : ''} aria-label="Sélectionner ${doc.numero}" />
            <span class="check__box"></span>
          </label>
        </td>
        <td class="td-mono"><a href="document.html?id=${doc.id}" style="color:var(--tt-navy-900);font-weight:600">${doc.numero}</a></td>
        <td><span class="badge badge--${doc.type}">${typeLabel(doc.type)}</span></td>
        <td class="truncate" style="white-space:normal max-width:160px">${doc.client}</td>
        <td class="text-secondary truncate" style="max-width:180px">${doc.objet}</td>
        <td class="td-mono">${TT.formatCurrency(doc.montant, doc.devise || 'FCFA')}</td>
        <td class="text-secondary">${TT.formatDate(doc.date)}</td>
        <td>${statusBadge(doc.status)}</td>
        <td>
          <div class="row-actions">
            <a href="document.html?id=${doc.id}" class="action-btn"  title="Voir" data-tooltip="Voir"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-5 6-5 6 5 6 5-2.5 5-6 5S1 7 1 7Z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg></a>
            <a href="facture.html?id=${doc.id}&edit=1" class="action-btn" title="Modifier" data-tooltip="Modifier"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5 11.5 4.5 4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
            <button class="action-btn" data-action="pdf" data-id="${doc.id}" title="Télécharger PDF" data-tooltip="Télécharger PDF" ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v7M4 6l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.5 10.5v1.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button>
            ${config.showDelete !== false ? `<button class="action-btn action-btn--danger" data-action="delete" data-id="${doc.id}" title="Supprimer" data-tooltip="Supprimer" onclick="FacturesActions.supprimerFacture(${doc.id})">
            

            <!-- Modification, boutons suppression -->

                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M8 6V4h8v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <rect x="6" y="6" width="12" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M10 10v6M14 10v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
            
            </button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination(state.filtered.length);
  }

  function typeLabel(t) {
    return t === 'proforma' ? 'Proforma' : t === 'devis' ? 'Devis' : 'Facture';
  }

  function statusBadge(s) {
    const map = { paid: 'paid', sent: 'sent', draft: 'draft', deleted: 'deleted' };
    const labels = { paid: 'Payée', sent: 'Envoyée', draft: 'Brouillon', deleted: 'Supprimée' };
    return `<span class="badge badge--${map[s] || 'draft'}">${labels[s] || s}</span>`;
  }

  function renderPagination(total) {
    const info = document.getElementById(config.paginationInfo);
    const controls = document.getElementById(config.paginationControls);
    const totalPages = Math.ceil(total / state.perPage);
    const start = (state.page - 1) * state.perPage;

    if (info) info.textContent = total ? `${start + 1}–${Math.min(start + state.perPage, total)} sur ${total}` : 'Aucun résultat';
    if (!controls) return;
    controls.innerHTML = '';

    if (totalPages <= 1) return;

    const addBtn = (label, page, disabled, active) => {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (active ? ' is-active' : '');
      btn.textContent = label;
      btn.disabled = disabled;
      btn.addEventListener('click', () => { state.page = page; render(); updateBulkBar(); });
      controls.appendChild(btn);
    };

    addBtn('‹', state.page - 1, state.page === 1);
    for (let i = 1; i <= Math.min(totalPages, 5); i++) addBtn(i, i, false, i === state.page);
    addBtn('›', state.page + 1, state.page === totalPages);
  }

  function handleRowClick(e) {
    const chk = e.target.closest('.row-check');
    if (chk) {
      chk.checked ? state.selected.add(chk.dataset.id) : state.selected.delete(chk.dataset.id);
      render();
      updateBulkBar();
      return;
    }

    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const doc = state.all.find(d => d.id === btn.dataset.id);
    if (!doc) return;

    if (btn.dataset.action === 'delete') {
      TTComponents.confirm({ title: 'Supprimer', message: `Déplacer ${doc.numero} vers la corbeille ?`, danger: true }).then(ok => {
        if (!ok) return;
        config.onDelete(doc);
        state.all = config.getData();
        applyFilter();
        Toast.success(`${doc.numero} déplacé vers la corbeille.`);
      });
    } else if (btn.dataset.action === 'pdf') {
      downloadDocPdf(doc, btn);
    }
  }

  async function downloadDocPdf(doc, btn) {
    if (!window.InvoiceTemplate || !window.PdfExport || !PdfExport.librariesReady()) {
      // Repli : ouvre le document si les librairies PDF ne sont pas disponibles.
      Toast.error('La génération du PDF n\'a pas pu être chargée.');
      window.open(`document.html?id=${doc.id}`, '_blank');
      return;
    }

    const originalHtml = btn.innerHTML;
    btn.disabled = true;

    let exportNode = document.getElementById('__tableExportNode');
    if (!exportNode) {
      exportNode = document.createElement('div');
      exportNode.id = '__tableExportNode';
      exportNode.className = 'pdf-page';
      exportNode.style.position = 'fixed';
      exportNode.style.left = '-9999px';
      exportNode.style.top = '0';
      document.body.appendChild(exportNode);
    }
    exportNode.innerHTML = InvoiceTemplate.render(doc, TT.getSettings());

    try {
      await PdfExport.download(exportNode, `${doc.numero}.pdf`);
      Toast.success(`${doc.numero}.pdf téléchargé.`);
    } catch (err) {
      console.error(err);
      Toast.error('Erreur lors de la génération du PDF.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }

  function updateBulkBar() {
    const bar = document.getElementById(config.bulkBarId);
    if (!bar) return;
    bar.hidden = state.selected.size === 0;
    bar.querySelector('.bulk-bar__count').textContent = `${state.selected.size} sélectionné(s)`;
  }

  function refresh() {
    state.all = config.getData();
    applyFilter();
  }

  function getSelected() {
    return state.filtered.filter(d => state.selected.has(d.id));
  }

  return { init, refresh, getSelected, applyFilter };
})();



// Nouvelle Fonction pour gerer la suppression


window.FacturesActions = {

  async supprimerFacture(id) {

    const facture = await AA.getFacture(id);

    const numero = facture?.reference || `#${id}`;


    TTComponents.confirm({
      title: 'Supprimer',
      message: `Supprimer la facture ${numero} ?`,
      danger: true

    }).then(async ok => {

      if (!ok) return;


      try {

        await AA.deleteFacture(id);

        
          DocumentsTable.refresh();
          window.location.reload();

        Toast.success(`${numero} supprimé.`);


      } catch (error) {

        console.error("Erreur suppression facture :", error);

        Toast.error("Erreur lors de la suppression de la facture.");

      }

    });

  }

};