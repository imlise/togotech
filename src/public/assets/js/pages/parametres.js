'use strict';

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
