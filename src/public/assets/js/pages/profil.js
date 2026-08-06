'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'profil', title: 'Profil' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard' }, { label: 'Profil' }],
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


  document.getElementById('saveProfile')?.addEventListener('click', async () => {
    TT.saveProfile({
      ...profile,
      name: document.getElementById('pName').value.trim(),
      phone: document.getElementById('pPhone').value.trim(),
      language: document.getElementById('pLang').value,
      timezone: document.getElementById('pTz').value,
    });
    document.getElementById('profileName').textContent = document.getElementById('pName').value;

    
    
    try {
  let user = JSON.parse(sessionStorage.getItem("tt_user"));
  const data = {
      "nomUtilisateur":document.getElementById('pName').value.trim(),
    }

    console.log(user);

    const response = await AA.updateUtilisateur(user.id,data);

    const updatedUtilisateur = response.utilisateur;
    user = {
      "id":updatedUtilisateur.id,
      "nom":updatedUtilisateur.nomUtilisateur,
      "email":updatedUtilisateur.email,
      "role":updatedUtilisateur.role,
      "actif":true,
    }
    sessionStorage.setItem("tt_user",JSON.stringify(user));
    location.reload();

    } catch (error) {
      console.log("Error : ", error)
    }
    

    Toast.success('Profil mis à jour.');
  });
});
