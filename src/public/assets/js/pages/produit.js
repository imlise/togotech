'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'clients', title: 'Clients' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Clients' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  renderClients();
  document.getElementById('clientSearch')?.addEventListener('input', TT.debounce(e => renderClients(e.target.value.trim()), 200));
  document.getElementById('addClientBtn')?.addEventListener('click', openClientModal);
});

function renderClients(query = '') {
  let clients = TT.getClients();
  if (query) {
    const q = query.toLowerCase();
    clients = clients.filter(c => (c.name + c.email + c.phone).toLowerCase().includes(q));
  }

  const grid = document.getElementById('produitsGrid');
  const empty = document.getElementById('produitsEmpty');

  if (!clients.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const docs = TT.getDocs();
  grid.innerHTML = clients.map(c => {
    const clientDocs = docs.filter(d => d.client === c.name);
    const total = clientDocs.reduce((s, d) => s + d.montant, 0);
    return `
      <div class="card client-card">
        <div class="client-card__head">
          <div class="avatar avatar--md avatar--navy">${c.name.charAt(0)}</div>
          <div class="dropdown">
            <button class="btn btn--ghost btn--icon btn--sm dropdown__trigger" aria-label="Actions">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="3" r="1" fill="currentColor"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="11" r="1" fill="currentColor"/></svg>
            </button>
            <div class="dropdown__menu">
              <button class="dropdown__item" data-edit="${c.id}">Modifier</button>
              <button class="dropdown__item dropdown__item--danger" data-delete="${c.id}">Supprimer</button>
            </div>
          </div>
        </div>
        <div class="client-card__name">${c.name}</div>
        <div class="client-card__meta">
          ${c.email ? `<div class="client-card__meta-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/></svg>${c.email}</div>` : ''}
          ${c.phone ? `<div class="client-card__meta-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2h2l1 3-1.5 1a7 7 0 0 0 3.5 3.5L9 8l3 1v2a1 1 0 0 1-1 1A9 9 0 0 1 2 3a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.2"/></svg>${c.phone}</div>` : ''}
        </div>
        <div class="client-card__stats">
          <div><div class="client-card__stat-value">${clientDocs.length}</div><div class="client-card__stat-label">Documents</div></div>
          <div><div class="client-card__stat-value text-mono" style="font-size:var(--text-sm)">${TT.formatNumber(total)}</div><div class="client-card__stat-label">FCFA total</div></div>
        </div>
        <a href="facture.html?client=${encodeURIComponent(c.name)}" class="btn btn--secondary btn--sm" style="width:100%;margin-top:var(--space-4)">Nouvelle facture</a>
      </div>
    `;
  }).join('');

  initDropdowns();
  grid.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      TTComponents.confirm({ title: 'Supprimer le client', message: 'Cette action est irréversible.', danger: true }).then(ok => {
        if (!ok) return;
        TT.saveClients(TT.getClients().filter(c => c.id !== btn.dataset.delete));
        renderClients(query);
        Toast.success('Client supprimé.');
      });
    });
  });
  grid.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openClientModal(TT.getClients().find(c => c.id === btn.dataset.edit)));
  });
}

function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dd => {
    const trigger = dd.querySelector('.dropdown__trigger');
    trigger?.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown.is-open').forEach(d => d.classList.remove('is-open'));
      dd.classList.toggle('is-open');
    });
  });
  document.addEventListener('click', () => document.querySelectorAll('.dropdown.is-open').forEach(d => d.classList.remove('is-open')));
}

function openClientModal(client = null) {
  TTComponents.openModal({
    title: client ? 'Modifier le client' : 'Nouveau client',
    body: `
      <div class="field"><label class="field__label">Nom / Société</label><input class="field__input" id="mName" value="${client?.name || ''}" /></div>
      <div class="field"><label class="field__label">E-mail</label><input class="field__input" id="mEmail" type="email" value="${client?.email || ''}" /></div>
      <div class="field"><label class="field__label">Téléphone</label><input class="field__input" id="mPhone" value="${client?.phone || ''}" /></div>
      <div class="field"><label class="field__label">Adresse</label><input class="field__input" id="mAddress" value="${client?.address || ''}" /></div>
    `,
    footer: `
      <button class="btn btn--secondary" id="mCancel">Annuler</button>
      <button class="btn btn--primary" id="mSave">Enregistrer</button>
    `,
  });

  document.getElementById('mCancel').addEventListener('click', TTComponents.closeModal);
  document.getElementById('mSave').addEventListener('click', () => {
    const data = {
      id: client?.id || TT.genId(),
      name: document.getElementById('mName').value.trim(),
      email: document.getElementById('mEmail').value.trim(),
      phone: document.getElementById('mPhone').value.trim(),
      address: document.getElementById('mAddress').value.trim(),
      createdAt: client?.createdAt || TT.todayISO(),
    };
    if (!data.name) { Toast.error('Le nom est requis.'); return; }
    let clients = TT.getClients();
    if (client) clients = clients.map(c => c.id === client.id ? data : c);
    else clients.unshift(data);
    TT.saveClients(clients);
    TTComponents.closeModal();
    renderClients();
    Toast.success(client ? 'Client modifié.' : 'Client ajouté.');
  });
}
