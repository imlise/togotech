'use strict';

const API = 'http://localhost:3000/api/clients';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'clients', title: 'Clients' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Clients' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  renderClients();
  document.getElementById('clientSearch')?.addEventListener('input', TT.debounce(e => renderClients(e.target.value.trim()), 200));
  document.getElementById('addClientBtn')?.addEventListener('click', () => openClientModal());
});

// --- Appels API ---

async function fetchClients() {
  const response = await fetch(API);
  if (!response.ok) throw new Error('Erreur lors du chargement des clients.');
  return response.json();
}

async function fetchClientStats(id) {
  const response = await fetch(`${API}/${id}/stats`);
  if (!response.ok) throw new Error(`Erreur lors du chargement des stats du client ${id}.`);
  return response.json(); // { totalFactures, totalMontant }
}

async function createClient(data) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erreur lors de la création du client.');
  return response.json();
}

async function updateClient(id, data) {
  const response = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erreur lors de la modification du client.');
  return response.json();
}

async function deleteClient(id) {
  const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Erreur lors de la suppression du client.');
}

// --- Rendu ---

let currentClients = []; // cache local pour édition/suppression sans refetch

async function renderClients(query = '') {
  const grid = document.getElementById('clientsGrid');
  const empty = document.getElementById('clientsEmpty');

  grid.innerHTML = '<div class="clients-loading">Chargement…</div>';
  empty.hidden = true;

  let clients;
  try {
    clients = await fetchClients();
  } catch (err) {
    console.error(err);
    grid.innerHTML = '';
    Toast.error('Impossible de charger les clients.');
    return;
  }

  if (query) {
    const q = query.toLowerCase();
    clients = clients.filter(c => (c.nom + (c.email || '') + (c.phone || '')).toLowerCase().includes(q));
  }

  currentClients = clients;

  if (!clients.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  // Récupère les stats de chaque client en parallèle
  let statsList;
  try {
    statsList = await Promise.all(
      clients.map(c => fetchClientStats(c.id).catch(() => ({ totalFactures: 0, totalMontant: 0 })))
    );
  } catch (err) {
    console.error(err);
    statsList = clients.map(() => ({ totalFactures: 0, totalMontant: 0 }));
  }

  grid.innerHTML = clients.map((c, i) => {
    const { totalFactures, totalMontant } = statsList[i];
    return `
      <div class="card client-card">
        <div class="client-card__head">
          <div class="avatar avatar--md avatar--navy">${c.nom.charAt(0)}</div>
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
        <div class="client-card__name">${c.nom}</div>
        <div class="client-card__meta">
          ${c.email ? `<div class="client-card__meta-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/></svg>${c.email}</div>` : ''}
          ${c.phone ? `<div class="client-card__meta-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2h2l1 3-1.5 1a7 7 0 0 0 3.5 3.5L9 8l3 1v2a1 1 0 0 1-1 1A9 9 0 0 1 2 3a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.2"/></svg>${c.phone}</div>` : ''}
        </div>
        <div class="client-card__stats">
          <div><div class="client-card__stat-value">${totalFactures}</div><div class="client-card__stat-label">Documents</div></div>
          <div><div class="client-card__stat-value text-mono" style="font-size:var(--text-sm)">${TT.formatNumber(totalMontant)}</div><div class="client-card__stat-label">FCFA total</div></div>
        </div>
        <a href="facture.html?client=${c.id}" class="btn btn--secondary btn--sm" style="width:100%;margin-top:var(--space-4)">Nouvelle facture</a>
      </div>
    `;
  }).join('');

  initDropdowns();

  grid.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      TTComponents.confirm({ title: 'Supprimer le client', message: 'Cette action est irréversible.', danger: true }).then(async ok => {
        if (!ok) return;
        try {
          await deleteClient(btn.dataset.delete);
          renderClients(query);
          Toast.success('Client supprimé.');
        } catch (err) {
          console.error(err);
          Toast.error('Impossible de supprimer le client.');
        }
      });
    });
  });

  grid.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const client = currentClients.find(c => String(c.id) === btn.dataset.edit);
      openClientModal(client);
    });
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
      <div class="field"><label class="field__label">Nom / Société</label><input class="field__input" id="mName" value="${client?.nom || ''}" /></div>
      <div class="field"><label class="field__label">E-mail</label><input class="field__input" id="mEmail" type="email" value="${client?.email || ''}" /></div>
      <div class="field"><label class="field__label">Téléphone</label><input class="field__input" id="mPhone" value="${client?.phone || ''}" /></div>
    `,
    footer: `
      <button class="btn btn--secondary" id="mCancel">Annuler</button>
      <button class="btn btn--primary" id="mSave">Enregistrer</button>
    `,
  });

  document.getElementById('mCancel').addEventListener('click', TTComponents.closeModal);
  document.getElementById('mSave').addEventListener('click', async () => {
    const data = {
      nom: document.getElementById('mName').value.trim(),
      email: document.getElementById('mEmail').value.trim(),
      phone: document.getElementById('mPhone').value.trim(),
    };
    if (!data.nom) { Toast.error('Le nom est requis.'); return; }

    try {
      if (client) {
        await updateClient(client.id, data);
        Toast.success('Client modifié.');
      } else {
        await createClient(data);
        Toast.success('Client ajouté.');
      }
      TTComponents.closeModal();
      renderClients();
    } catch (err) {
      console.error(err);
      Toast.error("Erreur lors de l'enregistrement du client.");
    }
  });
}