'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'profil', title: 'Profil' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Profil' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  const profile = TT.getProfile();
  document.getElementById('pName').value = profile.name;
  document.getElementById('pEmail').value = profile.email;
  document.getElementById('pPhone').value = profile.phone || '';
  document.getElementById('pLang').value = profile.language || 'fr';
  document.getElementById('pTz').value = profile.timezone || 'Africa/Lome';
  document.getElementById('profileName').textContent = profile.name;
  document.getElementById('profileEmail').textContent = profile.email;
  document.getElementById('profileAvatar').textContent = profile.name.charAt(0).toUpperCase();

  document.getElementById('saveProfile')?.addEventListener('click', () => {
    TT.saveProfile({
      ...profile,
      name: document.getElementById('pName').value.trim(),
      phone: document.getElementById('pPhone').value.trim(),
      language: document.getElementById('pLang').value,
      timezone: document.getElementById('pTz').value,
    });
    document.getElementById('profileName').textContent = document.getElementById('pName').value;
    Toast.success('Profil mis à jour.');
  });
});
