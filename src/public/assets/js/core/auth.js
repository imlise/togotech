'use strict';

window.Auth = (function () {

  const CONFIG = {
    loginPage: '/index',
    publicPages: [
      '/index',
      '/forgot-password',
      '/'
    ],
    storageKey: 'tt_auth'
  };


  function isPublicPage() {
    return CONFIG.publicPages.includes(
      window.location.pathname
    );
  }


  function isLogged() {
    return !!sessionStorage.getItem(CONFIG.storageKey);
  }


  function protect() {

    // Page publique → rien à faire
    if (isPublicPage()) {
      return;
    }


    // Utilisateur connecté
    if (isLogged()) {
      return;
    }


    // Sinon retour login
    window.location.href = CONFIG.loginPage;
  }


  function login(user) {
    sessionStorage.setItem(
      CONFIG.storageKey,
      JSON.stringify(user)
    );
  }


  function logout() {
    sessionStorage.removeItem(CONFIG.storageKey);
    window.location.href = CONFIG.loginPage;
  }


  return {
    protect,
    login,
    logout,
    isLogged
  };

})();