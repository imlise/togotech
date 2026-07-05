/* TOGOTECH GROUP — Auth guard */

'use strict';

(function () {
  const publicPages = ['index.html', 'forgot-password.html', ''];
  const current = window.location.pathname.split('/').pop() || 'index.html';

  if (publicPages.includes(current)) return;

  // Allow preview mode when ?preview=1 is present (developer convenience)
  const params = new URLSearchParams(window.location.search);
  if (params.get('preview') === '1') return;

  const authed = sessionStorage.getItem('tt_mock_auth');
  if (!authed) {
    window.location.href = 'index.html';
  }
})();
