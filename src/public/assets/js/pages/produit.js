'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'produits', title: 'Produits' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Produits' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  renderProduits();
  document.getElementById('produitSearch')?.addEventListener('input', TT.debounce(e => renderProduits(e.target.value.trim()), 200));
  document.getElementById('addProduitBtn')?.addEventListener('click', openProduitModal);
});









async function renderProduits() {
  const grid = document.getElementById('produitsGrid');
  const empty = document.getElementById('produitsEmpty');

  try {
    // 🔹 Appel API
    const res = await fetch('http://localhost:3000/api/produits');
    const produits = await res.json();

    // 🔹 Vérification si vide
    if (!produits.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    // 🔹 Génération HTML
    grid.innerHTML = produits.map(p => {

      return `
        <div class="card produit-card">
          <div class="produit-card__head">
            <img src="http://localhost:3000/assets/${p.image}" alt="${p.nom}" class="avatar avatar--md" />
          </div>

          <div class="produit-card__name">${p.nom}</div>

          <div class="produit-card__meta">
            <div class="produit-card__meta-item">
              ${p.description || ''}
            </div>
          </div>

          <div class="produit-card__stats">
            <div>
              <div class="produit-card__stat-value text-mono">
                ${p.prixUnitaire.toFixed(2)} FCFA
              </div>
              <div class="produit-card__stat-label">Prix unitaire</div>
            </div>

            <div>
              <div class="produit-card__stat-value text-mono">
               
              </div>
              <div class="produit-card__stat-label"></div>
            </div>
          </div>


          <button class="btn btn--secondary btn--sm edit-product" data-id="${p.id}" style="width:100%;margin-top:var(--space-4)">
  Modifier
</button>

<button class="btn btn--danger btn--sm delete-product" data-id="${p.id}" style="width:100%;margin-top:var(--space-4)">
  Supprimer
</button>
        </div>
      `;


    }).join('');

      let selectedProductId = null;
  } catch (err) {
    console.error(err);
    grid.innerHTML = '';
    empty.hidden = false;
  }
}



function openProduitModal(produit = null) {
  TTComponents.openModal({
    title: produit ? 'Modifier le produit' : 'Nouveau produit',
    body: `
      <div class="field"><label class="field__label">Nom / Société</label><input class="field__input" id="mName" value="${produit?.name || ''}" /></div>
      <div class="field"><label class="field__label">E-mail</label><input class="field__input" id="mEmail" type="email" value="${produit?.email || ''}" /></div>
      <div class="field"><label class="field__label">Téléphone</label><input class="field__input" id="mPhone" value="${produit?.phone || ''}" /></div>
      <div class="field"><label class="field__label">Adresse</label><input class="field__input" id="mAddress" value="${produit?.address || ''}" /></div>
    `,
    footer: `
      <button class="btn btn--secondary" id="mCancel">Annuler</button>
      <button class="btn btn--primary" id="mSave">Enregistrer</button>
    `,
  });

  document.getElementById('mCancel').addEventListener('click', TTComponents.closeModal);
  document.getElementById('mSave').addEventListener('click', () => {
    const data = {
      id: produit?.id || TT.genId(),
      name: document.getElementById('mName').value.trim(),
      email: document.getElementById('mEmail').value.trim(),
      phone: document.getElementById('mPhone').value.trim(),
      address: document.getElementById('mAddress').value.trim(),
      createdAt: produit?.createdAt || TT.todayISO(),
    };
    if (!data.name) { Toast.error('Le nom est requis.'); return; }
    let produits = TT.getClients();
    if (produit) produits = produits.map(c => c.id === produit.id ? data : c);
    else produits.unshift(data);
    TT.saveClients(produits);
    TTComponents.closeModal();
    renderClients();
    Toast.success(produit ? 'Client modifié.' : 'Client ajouté.');
  });
}