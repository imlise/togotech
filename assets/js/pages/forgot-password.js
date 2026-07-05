'use strict';

(function () {
  document.getElementById('forgotForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const errEl = document.getElementById('emailError');
    const field = document.getElementById('emailField');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = 'Adresse e-mail invalide.';
      field.classList.add('is-error');
      return;
    }

    field.classList.remove('is-error');
    errEl.textContent = '';

    const btn = document.getElementById('submitBtn');
    btn.classList.add('is-loading');
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 1400));

    const banner = document.getElementById('formSuccessBanner');
    banner.textContent = `Un lien de réinitialisation a été envoyé à ${email}.`;
    banner.style.display = 'block';
    btn.classList.remove('is-loading');
    btn.disabled = false;
    btn.textContent = 'Renvoyer le lien';
  });
})();
