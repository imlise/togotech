'use strict';

let banks = [];

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'parametres', title: 'Paramètres' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Paramètres' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  loadSettings();
  initTabs();
  document.getElementById('saveSettings')?.addEventListener('click', saveSettings);

  document.getElementById('logoUploadBtn')?.addEventListener('click', () => document.getElementById('logoInput').click());
  document.getElementById('logoInput')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('logoImg').src = ev.target.result;
      window._pendingLogo = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('addBankBtn')?.addEventListener('click', () => {
    banks.push({ logo: '', name: '', account: '' });
    renderBanks();
  });
});

function loadSettings() {
  const s = TT.getSettings();
  document.getElementById('sCompany').value = s.company || '';
  document.getElementById('sEmail').value = s.email || '';
  document.getElementById('sAddress').value = s.address || '';
  document.getElementById('sPhone').value = s.phone || '';
  document.getElementById('sRccm').value = s.rccm || '';
  document.getElementById('sNif').value = s.nif || '';
  document.getElementById('sPrefixFac').value = s.prefixFacture || 'FAC';
  document.getElementById('sPrefixPro').value = s.prefixProforma || 'PRO';
  document.getElementById('sNextNum').value = s.nextNumero || 1;
  document.getElementById('sTva').value = s.tva || 18;
  document.getElementById('sDevise').value = s.devise || 'FCFA';
  document.getElementById('sFooter').value = s.footer || '';
  document.getElementById('sConditions').value = s.conditions || '';
  document.getElementById('sSignature').checked = !!s.signature;
  if (s.logo) document.getElementById('logoImg').src = s.logo;

  banks = Array.isArray(s.banks) ? s.banks.map(b => ({ ...b })) : [];
  renderBanks();
}

function renderBanks() {
  const list = document.getElementById('bankList');
  if (!list) return;

  if (banks.length === 0) {
    list.innerHTML = '<p class="field__hint" style="margin:0">Aucune banque ajoutée pour le moment.</p>';
    return;
  }

  list.innerHTML = banks.map((bank, i) => `
    <div class="bank-row" data-index="${i}">
      <div class="bank-row__logo">
        <img src="${bank.logo || ''}" alt="Logo banque" style="${bank.logo ? '' : 'opacity:0'}" />
      </div>
      <input type="file" class="bank-row__logo-input" accept="image/*" hidden />
      <button class="btn btn--secondary btn--sm bank-row__logo-btn" type="button">Logo</button>
      <input class="field__input bank-row__name" type="text" placeholder="Nom de la banque" value="${escapeAttr(bank.name)}" />
      <input class="field__input text-mono bank-row__account" type="text" placeholder="Numéro de compte" value="${escapeAttr(bank.account)}" />
      <button class="btn btn--icon bank-row__remove" type="button" title="Supprimer cette banque" aria-label="Supprimer cette banque">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.bank-row').forEach(row => {
    const i = parseInt(row.dataset.index, 10);

    row.querySelector('.bank-row__logo-btn').addEventListener('click', () => {
      row.querySelector('.bank-row__logo-input').click();
    });
    row.querySelector('.bank-row__logo-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        banks[i].logo = ev.target.result;
        const img = row.querySelector('.bank-row__logo img');
        img.src = ev.target.result;
        img.style.opacity = 1;
      };
      reader.readAsDataURL(file);
    });
    row.querySelector('.bank-row__name').addEventListener('input', e => { banks[i].name = e.target.value; });
    row.querySelector('.bank-row__account').addEventListener('input', e => { banks[i].account = e.target.value; });
    row.querySelector('.bank-row__remove').addEventListener('click', () => {
      banks.splice(i, 1);
      renderBanks();
    });
  });
}

function escapeAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function saveSettings() {
  const s = {
    ...TT.getSettings(),
    company: document.getElementById('sCompany').value,
    email: document.getElementById('sEmail').value,
    address: document.getElementById('sAddress').value,
    phone: document.getElementById('sPhone').value,
    rccm: document.getElementById('sRccm').value,
    nif: document.getElementById('sNif').value,
    prefixFacture: document.getElementById('sPrefixFac').value,
    prefixProforma: document.getElementById('sPrefixPro').value,
    nextNumero: parseInt(document.getElementById('sNextNum').value, 10) || 1,
    tva: document.getElementById('sTva').value,
    devise: document.getElementById('sDevise').value,
    footer: document.getElementById('sFooter').value,
    conditions: document.getElementById('sConditions').value,
    signature: document.getElementById('sSignature').checked,
    logo: window._pendingLogo || TT.getSettings().logo,
    banks: banks.filter(b => b.logo || b.name || b.account),
  };
  TT.saveSettings(s);
  Toast.success('Paramètres enregistrés.');
}

function initTabs() {
  document.querySelectorAll('.settings-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.settings-nav__link').forEach(l => l.classList.remove('is-active'));
      document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('is-active'));
      link.classList.add('is-active');
      document.getElementById('panel-' + link.dataset.panel)?.classList.add('is-active');
    });
  });
}
