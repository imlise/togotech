/* ═══════════════════════════════════════════════════════════════
   TOGO TECH GROUP — Layout Shell
   Sidebar · Topbar SaaS · Dropdowns
   ═══════════════════════════════════════════════════════════════ */

'use strict';

window.TTLayout = (function () {

  const BRAND = {
    name: 'FACT-ADMIN',
    fullName: 'TOGOTECH GROUP',
    tagline: 'Facturation Pro',
    logo: 'assets/img/logo-togotech.png',
  };

  const ICONS = {
    dashboard: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><path d="M2.5 8.2 9 2.5l6.5 5.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 6.8V14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 15v-3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    facture: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><path d="M4.5 2h6.5L14 5.5V15a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M11 2v3.5H14" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 9.5h6M6 12h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    historique: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9.5" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M9 6.5V9.5l2.2 1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 2.2h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    brouillons: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><path d="M4 2.5h7.5L14 5v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 7h6M6 9.5h6M6 12h3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    clients: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><circle cx="6.8" cy="6.3" r="2.6" stroke="currentColor" stroke-width="1.4"/><path d="M2.2 15c0-2.6 2.1-4.6 4.6-4.6s4.6 2 4.6 4.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="7.2" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M11.2 15c.2-2 1.6-3.5 3.4-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    corbeille: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><path d="M3.2 5h11.6M6.3 5V3.2a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1V5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.3 5.3l.9 9.3a1 1 0 0 0 1 .9h5.6a1 1 0 0 0 1-.9l.9-9.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.4 8.3v4M10.6 8.3v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    notifications: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><path d="M5 8.8a4 4 0 0 1 8 0V12l1.5 2H3.5L5 12V8.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M7.3 14.5a1.7 1.7 0 0 0 3.4 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    parametres: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="2.5" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="10.3" y="2.5" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="2.5" y="10.3" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="10.3" y="10.3" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/></svg>',
    theme: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><path d="M9 4.5a4.5 4.5 0 1 0 4.5 4.5A4.505 4.505 0 0 0 9 4.5Z" stroke="currentColor" stroke-width="1.4"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.3 3.3l1.4 1.4M13.3 3.3l-1.4 1.4M3.3 14.7l1.4-1.4M13.3 14.7l-1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    themeDark: '<svg class="nav-link__icon" viewBox="0 0 18 18" fill="none"><path d="M12.5 4.5a5.5 5.5 0 1 1-7.9 7.4 6.5 6.5 0 1 0 7.9-7.4Z" fill="currentColor" opacity="0.15"/><path d="M12.5 4.5a5.5 5.5 0 1 1-7.9 7.4 6.5 6.5 0 1 0 7.9-7.4Z" stroke="currentColor" stroke-width="1.4"/></svg>',
  };

  const NAV = [
    {
      label: 'Principal',
      items: [
        { id: 'dashboard', href: 'dashboard.html', label: 'Dashboard', icon: 'dashboard' },
        { id: 'facture', href: 'facture.html', label: 'Facturation', icon: 'facture', badge: '+' },
        { id: 'historique', href: 'historique.html', label: 'Historique', icon: 'historique' },
      ],
    },
    {
      label: 'Documents',
      items: [
        { id: 'brouillons', href: 'brouillons.html', label: 'Brouillons', icon: 'brouillons', countKey: 'drafts' },
        { id: 'corbeille', href: 'corbeille.html', label: 'Corbeille', icon: 'corbeille', countKey: 'trash' },
      ],
    },
    {
      label: 'Gestion',
      items: [
        { id: 'produits', href: 'produits.html', label: 'Produits', icon: 'produits' },
        { id: 'clients', href: 'clients.html', label: 'Clients', icon: 'clients' },
        { id: 'notifications', href: 'notifications.html', label: 'Notifications', icon: 'notifications', countKey: 'notifs' },
        { id: 'parametres', href: 'parametres.html', label: 'Paramètres', icon: 'parametres' },
      ],
    },
  ];

  function getUserInfo() {
    const email = sessionStorage.getItem('tt_user_email') || 'admin@togotech.com';
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return { email, name, initial: name.charAt(0).toUpperCase() };
  }

  function getTheme() {
    return localStorage.getItem('tt_theme');
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem('tt_theme', theme);

    const buttons = [
      ...Array.from(document.querySelectorAll('#themeToggleBtn')),
      ...Array.from(document.querySelectorAll('[data-action="theme-toggle"]')),
    ];
    buttons.forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Mode clair' : 'Mode sombre');
      btn.classList.toggle('is-active', theme === 'dark');
      btn.innerHTML = theme === 'dark' ? ICONS.themeDark : ICONS.theme;
    });
  }

  function initTheme() {
    const theme = getTheme();
    if (theme) {
      applyTheme(theme);
    } else {
      document.documentElement.dataset.theme = 'light';
      const buttons = [
        ...Array.from(document.querySelectorAll('#themeToggleBtn')),
        ...Array.from(document.querySelectorAll('[data-action="theme-toggle"]')),
      ];
      buttons.forEach(btn => {
        btn.setAttribute('aria-label', 'Mode sombre');
        btn.classList.remove('is-active');
      });
    }
  }

  function renderNav(activePage) {
    const stats = typeof TT !== 'undefined' ? TT.getStats() : {};
    const trashCount = typeof TT !== 'undefined' ? TT.getTrash().length : 0;

    return NAV.map(section => `
      <div class="sidebar__section">
        <div class="sidebar__section-label">${section.label}</div>
        <div class="sidebar__links">
          ${section.items.map(item => {
            const isActive = item.id === activePage;
            let badge = '';
            if (item.badge) badge = `<span class="nav-link__badge">${item.badge}</span>`;
            else if (item.countKey === 'drafts' && stats.drafts) badge = `<span class="nav-link__badge">${stats.drafts}</span>`;
            else if (item.countKey === 'trash' && trashCount) badge = `<span class="nav-link__badge">${trashCount}</span>`;
            else if (item.countKey === 'notifs') {
              const unread = typeof TT !== 'undefined' ? TT.unreadCount() : 0;
              if (unread) badge = `<span class="nav-link__badge">${unread}</span>`;
            }
            return `<a href="${item.href}" class="nav-link${isActive ? ' is-active' : ''}" data-page="${item.id}">
              <span class="nav-link__icon-wrap">${ICONS[item.icon] || ''}</span>
              <span>${item.label}</span>
              ${badge}
            </a>`;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderSidebar(activePage) {
    const user = getUserInfo();
    return `
      <div class="sidebar-shell" id="sidebarShell">
        <aside class="sidebar" id="sidebar" role="navigation" aria-label="Navigation principale">
          <div class="sidebar__drawer-account" aria-label="Informations du compte">
            <div class="avatar avatar--lg avatar--brand">${user.initial}</div>
            <div class="sidebar__drawer-meta">
              <span class="sidebar__drawer-name">${user.name}</span>
              <span class="sidebar__drawer-email">${user.email}</span>
            </div>
          </div>
          <nav class="sidebar__nav">${renderNav(activePage)}</nav>
        </aside>
      </div>
    `;
  }

  function renderNotificationsPanel() {
    const notifs = typeof TT !== 'undefined' ? TT.getNotifications().slice(0, 8) : [];
    const unread = typeof TT !== 'undefined' ? TT.unreadCount() : 0;

    if (!notifs.length) {
      return `<div class="shell-panel__body"><div class="empty-state" style="padding:var(--space-10)"><p class="text-body-sm text-secondary">Aucune notification</p></div></div>`;
    }

    return `<div class="shell-panel__body">${notifs.map(n => `
      <button type="button" class="notif-item${n.read ? ' is-read' : ' is-unread'}" data-notif-id="${n.id}">
        <span class="notif-item__dot" aria-hidden="true"></span>
        <span class="notif-item__content">
          <span class="notif-item__text">${n.message}</span>
          <span class="notif-item__time">${typeof TT !== 'undefined' ? TT.formatDateTime(n.createdAt) : ''}</span>
        </span>
      </button>
    `).join('')}</div>
    <div class="shell-panel__foot">
      <a href="notifications.html" class="shell-panel__action">Voir toutes les notifications${unread ? ` (${unread})` : ''} →</a>
    </div>`;
  }

  function renderUserPanel() {
    const user = getUserInfo();
    return `
      <div class="user-panel__head">
        <div class="avatar avatar--md avatar--brand">${user.initial}</div>
        <div class="user-panel__meta">
          <div class="user-panel__name">${user.name}</div>
          <div class="user-panel__email">${user.email}</div>
        </div>
      </div>
      <nav class="shell-menu" aria-label="Menu utilisateur">
        <a href="profil.html" class="shell-menu__item">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          Mon profil
        </a>
        <div class="shell-menu__divider"></div>
        <button type="button" class="shell-menu__item shell-menu__item--danger" id="userMenuLogout">
          <svg viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 12l3-3-3-3M13 9H6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Déconnexion
        </button>
      </nav>
    `;
  }

  function renderHeader(config = {}) {
    const { title, breadcrumb = [], actions = '' } = config;
    const activePage = config.page || document.body.dataset.page || '';
    const user = getUserInfo();
    const unread = typeof TT !== 'undefined' ? TT.unreadCount() : 0;

    const bc = breadcrumb.length
      ? `<nav class="app-header__breadcrumb" aria-label="Fil d'Ariane">${breadcrumb.map((b, i) =>
          i < breadcrumb.length - 1
            ? `<a href="${b.href}">${b.label}</a><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`
            : `<span>${b.label}</span>`
        ).join('')}</nav>`
      : '';

    const principalNav = NAV.find(section => section.label === 'Principal')?.items || [];
    const topNav = principalNav.map(item => {
      const isActive = item.id === activePage;
      return `<a href="${item.href}" class="top-nav__link${isActive ? ' is-active' : ''}" data-nav="${item.id}">
        ${ICONS[item.icon] || ''}
        <span>${item.label}</span>
      </a>`;
    }).join('');

    return `
        <div class="app-header__left">
          <button type="button" class="burger header-burger" id="headerBurgerBtn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="sidebar">
            <span></span><span></span><span></span>
          </button>
          <a href="dashboard.html" class="app-header__brand" aria-label="${BRAND.fullName} — Accueil">
            <img src="${BRAND.logo}" alt="${BRAND.fullName}" />
          </a>
          ${bc ? bc : ''}
        </div>

        <div class="app-header__center">
          <nav class="top-nav" role="navigation" aria-label="Top navigation">
            ${topNav}
          </nav>
        </div>

        <div class="app-header__right">
          ${actions}
          <button type="button" class="topbar-btn" id="themeToggleBtn" title="Activer/Désactiver le mode" aria-label="Mode clair/sombre">
            ${ICONS.theme}
          </button>
          <a href="parametres.html" class="topbar-btn" aria-label="Paramètres">
            ${ICONS.parametres}
          </a>
          <button type="button" class="topbar-btn" id="notifBtn" data-action="toggle-notifications" aria-label="Notifications${unread ? ` (${unread} non lues)` : ''}" aria-expanded="false" aria-haspopup="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 7.5a5 5 0 0 1 10 0V12l1.5 2h-13L4 12V7.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M7.5 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            ${unread ? `<span class="topbar-btn__badge">${unread > 9 ? '9+' : unread}</span>` : ''}
          </button>
          <button type="button" class="user-menu-trigger" id="userMenuBtn" data-action="toggle-user-menu" aria-expanded="false" aria-haspopup="true">
            <div class="avatar avatar--sm avatar--brand">${user.initial}</div>
          </button>
        </div>
    `;
  }

  // Les panneaux (notifications, menu utilisateur) sont rendus UNE SEULE
  // FOIS, en dehors du header desktop ET de la barre mobile — parce que
  // ces deux barres ne sont jamais visibles en même temps (l'une est
  // masquée en CSS selon la largeur d'écran). Avant ce correctif, le
  // panneau vivait uniquement à l'intérieur du header desktop : cliquer
  // sur le déclencheur mobile essayait bien d'ouvrir ce panneau, mais
  // celui-ci restait invisible puisque son parent (.app-header) est
  // display:none en mobile. Un panneau partagé, positionné en `fixed`
  // (voir CSS), résout le problème quel que soit le déclencheur utilisé.
  function renderSharedPanels() {
    const unread = typeof TT !== 'undefined' ? TT.unreadCount() : 0;
    return `
      <div class="shell-dropdown" id="notifDropdown">
        <div class="shell-panel shell-panel--wide" role="dialog" aria-label="Centre de notifications">
          <div class="shell-panel__head">
            <span class="shell-panel__title">Notifications</span>
            ${unread ? `<button type="button" class="shell-panel__action" id="markAllRead">Tout marquer lu</button>` : ''}
          </div>
          ${renderNotificationsPanel()}
        </div>
      </div>
      <div class="shell-dropdown" id="userDropdown">
        <div class="shell-panel" role="menu" aria-label="Menu utilisateur">
          ${renderUserPanel()}
        </div>
      </div>
    `;
  }

  function renderMobileBar(title) {
    const user = getUserInfo();
    const unread = typeof TT !== 'undefined' ? TT.unreadCount() : 0;
    return `
      <header class="mobile-bar" id="mobileBar">
        <button class="burger" id="burgerBtn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="sidebar">
          <span></span><span></span><span></span>
        </button>
        <a href="dashboard.html" class="mobile-bar__brand" aria-label="${BRAND.fullName} — Accueil">
          <img src="${BRAND.logo}" alt="${BRAND.fullName}" />
        </a>
        <div class="mobile-bar__actions">
          <button type="button" class="topbar-btn" id="mobileThemeToggleBtn" data-action="theme-toggle" title="Activer/Désactiver le mode" aria-label="Mode clair/sombre">
            ${ICONS.theme}
          </button>
          <button type="button" class="topbar-btn" id="mobileNotifBtn" data-action="toggle-notifications" aria-label="Notifications${unread ? ` (${unread} non lues)` : ''}" aria-expanded="false" aria-haspopup="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 7.5a5 5 0 0 1 10 0V12l1.5 2h-13L4 12V7.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
            ${unread ? `<span class="topbar-btn__badge">${unread > 9 ? '9+' : unread}</span>` : ''}
          </button>
          <button type="button" class="user-menu-trigger" id="mobileUserMenuBtn" data-action="toggle-user-menu" aria-expanded="false" aria-haspopup="true">
            <div class="avatar avatar--sm avatar--brand">${user.initial}</div>
          </button>
        </div>
      </header>
    `;
  }
  function renderMobileBottomNav() {
    return `
      <nav id="mobileBottomNav" class="mobile-bottom-nav" aria-label="Navigation mobile principale">
        <a href="dashboard.html" class="mobile-bottom-nav__item${document.body.dataset.page === 'dashboard' ? ' is-active' : ''}">
          ${ICONS.dashboard}
          <span>Accueil</span>
        </a>
        <a href="clients.html" class="mobile-bottom-nav__item${document.body.dataset.page === 'clients' ? ' is-active' : ''}">
          ${ICONS.clients}
          <span>Clients</span>
        </a>
        <a href="facture.html" class="mobile-bottom-nav__item mobile-bottom-nav__item--center${document.body.dataset.page === 'facture' ? ' is-active' : ''}" aria-label="Nouvelle facture">
          <span class="mobile-bottom-nav__add-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 4.5v13M4.5 11h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
        </a>
        <a href="historique.html" class="mobile-bottom-nav__item${document.body.dataset.page === 'historique' ? ' is-active' : ''}">
          ${ICONS.historique}
          <span>Historique</span>
        </a>
        <a href="parametres.html" class="mobile-bottom-nav__item${document.body.dataset.page === 'parametres' ? ' is-active' : ''}">
          ${ICONS.parametres}
          <span>Paramètres</span>
        </a>
      </nav>
    `;
  }

  function initShell(config = {}) {
    const root = document.getElementById('app-root');
    if (!root) return;

    const activePage = config.page || document.body.dataset.page || '';
    root.innerHTML = renderSidebar(activePage) +
      '<div class="sidebar-overlay" id="sidebarOverlay" aria-hidden="true"></div>';

    const main = document.querySelector('.app-main');
    if (main && !document.getElementById('mobileBar')) {
      main.insertAdjacentHTML('afterbegin', renderMobileBar(config.title));
    }
    if (main && !document.getElementById('mobileBottomNav')) {
      main.insertAdjacentHTML('beforeend', renderMobileBottomNav());
    }
    if (main && !document.getElementById('notifDropdown')) {
      main.insertAdjacentHTML('beforeend', renderSharedPanels());
    }

    const headerEl = document.getElementById('app-header');
    if (headerEl) {
      headerEl.innerHTML = renderHeader(config).replace(/^<header class="app-header">|<\/header>$/g, '');
    }

    initTheme();
    bindEvents();
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.shell-dropdown.is-open').forEach(el => el.classList.remove('is-open'));
    document.querySelectorAll('.user-menu-trigger.is-active, .topbar-btn.is-active').forEach(el => {
      el.classList.remove('is-active');
      el.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleDropdown(dropdown, actionName) {
    const isOpen = dropdown.classList.contains('is-open');
    closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add('is-open');
      document.querySelectorAll(`[data-action="${actionName}"]`).forEach(btn => {
        btn.classList.add('is-active');
        btn.setAttribute('aria-expanded', 'true');
      });
    }
  }

  function logout() {
    sessionStorage.removeItem('tt_mock_auth');
    sessionStorage.removeItem('tt_user_email');
    window.location.href = 'index.html';
  }

  function bindEvents() {
    const root = document.getElementById('app-root');
    const sidebar = document.getElementById('sidebar');
    const sidebarShell = document.querySelector('.sidebar-shell');
    const mobileBar = document.getElementById('mobileBar');
    const burgerButtons = Array.from(document.querySelectorAll('#burgerBtn, #headerBurgerBtn'));
    const overlay = document.getElementById('sidebarOverlay');

    function closeSidebar(isMobile) {
      sidebarShell?.classList.remove('is-open');
      sidebar?.classList.remove('is-open');
      if (!isMobile) {
        root?.classList.add('is-collapsed');
      }
      burgerButtons.forEach(btn => {
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
      if (isMobile) {
        overlay?.classList.remove('is-visible');
        document.body.classList.remove('drawer-open');
        document.body.style.overflow = '';
      }
    }

    function openSidebar(isMobile) {
      sidebarShell?.classList.add('is-open');
      sidebar?.classList.add('is-open');
      if (!isMobile) {
        root?.classList.remove('is-collapsed');
      }
      burgerButtons.forEach(btn => {
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      });
      if (isMobile) {
        overlay?.classList.add('is-visible');
        document.body.classList.add('drawer-open');
        document.body.style.overflow = 'hidden';
      }
    }

    function toggleSidebar() {
      const isMobile = window.matchMedia('(max-width: 1024px)').matches;
      const isOpen = isMobile
        ? sidebarShell?.classList.contains('is-open')
        : !root?.classList.contains('is-collapsed');
      isOpen ? closeSidebar(isMobile) : openSidebar(isMobile);
    }

    document.addEventListener('click', e => {
      if (e.target.closest('#burgerBtn, #headerBurgerBtn')) {
        e.preventDefault();
        toggleSidebar();
        return;
      }
    });

    overlay?.addEventListener('click', closeSidebar);

    function updateStickyHeader() {
      const header = document.querySelector('.app-header');
      const mobileBar = document.getElementById('mobileBar');
      const isSticky = window.scrollY > 0;
      header?.classList.toggle('is-sticky', isSticky);
      mobileBar?.classList.toggle('is-sticky', isSticky);
    }

    updateStickyHeader();

    if (!window.__ttShellDelegated) {
      window.__ttShellDelegated = true;
      window.addEventListener('scroll', updateStickyHeader, { passive: true });

      document.addEventListener('click', e => {
        if (e.target.closest('#notifBtn, [data-action="toggle-notifications"]')) {
          e.stopPropagation();
          toggleDropdown(document.getElementById('notifDropdown'), 'toggle-notifications');
          return;
        }
        if (e.target.closest('#userMenuBtn, [data-action="toggle-user-menu"]')) {
          e.stopPropagation();
          toggleDropdown(document.getElementById('userDropdown'), 'toggle-user-menu');
          return;
        }
        if (e.target.closest('#userMenuLogout')) {
          e.preventDefault();
          logout();
          return;
        }
        if (e.target.closest('#markAllRead')) {
          e.preventDefault();
          if (typeof TT !== 'undefined') {
            TT.getNotifications().forEach(n => { if (!n.read) TT.markNotificationRead(n.id); });
            const panel = document.querySelector('#notifDropdown .shell-panel');
            if (panel) {
              panel.innerHTML = `<div class="shell-panel__head"><span class="shell-panel__title">Notifications</span></div>${renderNotificationsPanel()}`;
            }
            document.querySelector('#notifBtn .topbar-btn__badge')?.remove();
            document.querySelector('[data-action="toggle-notifications"] .topbar-btn__badge')?.remove();
          }
          return;
        }
        if (e.target.closest('#themeToggleBtn, [data-action="theme-toggle"]')) {
          e.preventDefault();
          const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
          applyTheme(current === 'dark' ? 'light' : 'dark');
          return;
        }
        if (e.target.closest('.notif-item[data-notif-id]')) {
          e.stopPropagation();
          const btn = e.target.closest('.notif-item');
          if (typeof TT !== 'undefined') TT.markNotificationRead(btn.dataset.notifId);
          btn.classList.remove('is-unread');
          btn.classList.add('is-read');
          return;
        }
        if (e.target.closest('#globalSearch')) return;
        closeAllDropdowns();
      });

      document.addEventListener('keydown', e => {
        if (e.target?.id === 'globalSearch' && e.key === 'Enter') {
          const q = e.target.value.trim();
          window.location.href = q ? `historique.html?search=${encodeURIComponent(q)}` : 'historique.html';
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          document.getElementById('globalSearch')?.focus();
        }
        if (e.key === 'Escape') {
          closeAllDropdowns();
          const sb = document.getElementById('sidebar');
          if (sb?.classList.contains('is-open')) {
            sb.classList.remove('is-open');
            document.getElementById('burgerBtn')?.classList.remove('is-open');
            document.getElementById('sidebarOverlay')?.classList.remove('is-visible');
            document.body.style.overflow = '';
          }
        }
      });
    }
  }

  return { initShell, renderHeader, renderNav, bindEvents, BRAND, closeAllDropdowns };
})();
