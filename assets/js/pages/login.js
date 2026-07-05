'use strict';

(function () {
  const toggle = document.getElementById('togglePassword');
  const input  = document.getElementById('password');
  const icon   = document.getElementById('eyeIcon');

  toggle?.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    icon.innerHTML = show
      ? `<path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M2 2l12 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`
      : `<path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/>`;
  });

  function validateEmail(v) {
    if (!v) return 'L\'adresse e-mail est requise.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Adresse e-mail invalide.';
    return '';
  }

  function validatePassword(v) {
    if (!v) return 'Le mot de passe est requis.';
    if (v.length < 4) return 'Mot de passe trop court.';
    return '';
  }

  function setFieldError(fieldId, errorId, msg) {
    const field = document.getElementById(fieldId);
    const err = document.getElementById(errorId);
    err.textContent = msg;
    field.classList.toggle('is-error', !!msg);
  }

  const emailEl = document.getElementById('email');
  const passEl  = document.getElementById('password');

  emailEl.addEventListener('blur', () => setFieldError('emailField', 'emailError', validateEmail(emailEl.value.trim())));
  passEl.addEventListener('blur', () => setFieldError('passwordField', 'passwordError', validatePassword(passEl.value)));

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const banner = document.getElementById('formErrorBanner');
    banner.classList.remove('is-visible');

    const eErr = validateEmail(emailEl.value.trim());
    const pErr = validatePassword(passEl.value);
    setFieldError('emailField', 'emailError', eErr);
    setFieldError('passwordField', 'passwordError', pErr);
    if (eErr || pErr) return;

    const btn = document.getElementById('submitBtn');
    btn.classList.add('is-loading');
    btn.disabled = true;

    try {
      await new Promise(r => setTimeout(r, 1200));
      sessionStorage.setItem('tt_mock_auth', '1');
      sessionStorage.setItem('tt_user_email', emailEl.value.trim());
      window.location.href = 'dashboard.html';
    } catch {
      banner.textContent = 'Une erreur est survenue. Réessayez.';
      banner.classList.add('is-visible');
    } finally {
      btn.classList.remove('is-loading');
      btn.disabled = false;
    }
  });
})();
