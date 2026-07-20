/* ═══════════════════════════════════════════════════════════════
   TOGOTECH GROUP — Core Application
   Store · Helpers · Data layer (framework-agnostic)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

window.TT = (function () {

  const KEYS = {
    docs:         'tt_documents',
    clients:      'tt_clients',
    drafts:       'tt_drafts',
    trash:        'tt_trash',
    settings:     'tt_settings',
    notifications:'tt_notifications',
    profile:      'tt_profile',
  };

  /* ── Storage ── */
  const Store = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); return true; }
      catch { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch {}
    },
  };

  /* ── Formatters ── */
  function formatNumber(n) {
    return new Intl.NumberFormat('fr-FR').format(n || 0);
  }

  function formatCurrency(n, currency = 'FCFA') {
    return `${formatNumber(n)} ${currency}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  /* ── Settings ── */
  function getSettings() {
    return Store.get(KEYS.settings, {
      logo:           'assets/img/logo-togotech.png',
      company:        'Togo Tech Group',
      tagline:        'Intégrateur de solutions informatiques & télécoms',
      address:        'Lomé, Togo',
      phone:          '+228 98 27 18 87 / +228 71 30 11 13',
      email:          'noumonviakuetejeanpierre@gmail.com',
      rccm:           '',
      nif:            '',
      tva:            '18',
      prefixFacture:  'FAC',
      prefixProforma: 'SI',
      prefixDevis:    'DEV',
      nextNumero:     1,
      devise:         'FCFA',
      signature:      '',
      cachet:         '',
      footer:         'Merci de votre confiance — Togo Tech Group',
      conditions:     'Validité : 1 mois.\nDélai de livraison : Dès l\'accord.\nCondition de paiement : 60% à l\'accord et 40% à la livraison.\nGarantie : 1 an.',
            banks: [
        { logo: 'assets/images/orabank.png', name: 'Orabank', account: '' },
      ],
    });
  }

  function saveSettings(settings) {
    Store.set(KEYS.settings, settings);
  }

  /* ── Profile ── */
  function getProfile() {
    const email = sessionStorage.getItem('tt_user_email') || 'admin@togotech.com';
    return Store.get(KEYS.profile, {
      email,
      name:     email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      phone:    '',
      avatar:   '',
      language: 'fr',
      timezone: 'Africa/Lome',
    });
  }

  function saveProfile(profile) {
    Store.set(KEYS.profile, profile);
  }

  /* ── Documents ── */
  function getDocs() {
    const stored = Store.get(KEYS.docs, null);
    if (stored && stored.length) return stored;
    const sample = _sampleDocs();
    Store.set(KEYS.docs, sample);
    return sample;
  }

  function saveDocs(docs) {
    Store.set(KEYS.docs, docs);
  }

  function getDocById(id) {
    return getDocs().find(d => d.id === id) || getDrafts().find(d => d.id === id) || getTrash().find(d => d.id === id);
  }

  function nextNumero(type) {
    const s = getSettings();
    const prefix = type === 'proforma' ? s.prefixProforma : type === 'devis' ? s.prefixDevis : s.prefixFacture;
    const year = new Date().getFullYear();
    const num = String(s.nextNumero || 1).padStart(3, '0');
    return `${prefix}-${year}-${num}`;
  }

  function incrementNumero() {
    const s = getSettings();
    s.nextNumero = (s.nextNumero || 1) + 1;
    saveSettings(s);
  }

  /* ── Drafts ── */
  function getDrafts() {
    return Store.get(KEYS.drafts, []);
  }

  function saveDrafts(drafts) {
    Store.set(KEYS.drafts, drafts);
  }

  /* ── Trash ── */
  function getTrash() {
    return Store.get(KEYS.trash, []);
  }

  function saveTrash(items) {
    Store.set(KEYS.trash, items);
  }

  function moveToTrash(doc) {
    const docs = getDocs().filter(d => d.id !== doc.id);
    saveDocs(docs);
    const trash = getTrash();
    trash.unshift({ ...doc, deletedAt: new Date().toISOString(), status: 'deleted' });
    saveTrash(trash);
    addNotification('delete', `Document ${doc.numero} déplacé vers la corbeille.`);
  }

  function restoreFromTrash(id) {
    const trash = getTrash();
    const doc = trash.find(d => d.id === id);
    if (!doc) return false;
    const { deletedAt, ...restored } = doc;
    restored.status = 'sent';
    saveTrash(trash.filter(d => d.id !== id));
    const docs = getDocs();
    docs.unshift(restored);
    saveDocs(docs);
    addNotification('restore', `Document ${doc.numero} restauré.`);
    return true;
  }

  /* ── Clients ── */
  function getClients() {
    const stored = Store.get(KEYS.clients, null);
    if (stored && stored.length) return stored;
    const sample = _sampleClients();
    Store.set(KEYS.clients, sample);
    return sample;
  }

  function saveClients(clients) {
    Store.set(KEYS.clients, clients);
  }

  /* ── Notifications ── */
  function getNotifications() {
    const stored = Store.get(KEYS.notifications, null);
    if (stored && stored.length) return stored;
    const sample = [
      { id: genId(), type: 'create', message: 'Bienvenue sur Togo Tech Facturation.', read: false, createdAt: new Date().toISOString() },
    ];
    Store.set(KEYS.notifications, sample);
    return sample;
  }

  function addNotification(type, message) {
    const list = getNotifications();
    list.unshift({
      id: genId(),
      type,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
    if (list.length > 50) list.length = 50;
    Store.set(KEYS.notifications, list);
  }

  function markNotificationRead(id) {
    const list = getNotifications();
    const n = list.find(x => x.id === id);
    if (n) n.read = true;
    Store.set(KEYS.notifications, list);
  }

  function unreadCount() {
    return getNotifications().filter(n => !n.read).length;
  }

  /* ── Stats ── */
  function getStats() {
    const docs = getDocs().filter(d => d.status !== 'deleted');
    const factures = docs.filter(d => d.type === 'facture');
    const proformas = docs.filter(d => d.type === 'proforma');
    const devis = docs.filter(d => d.type === 'devis');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthDocs = docs.filter(d => new Date(d.date) >= monthStart);
    const revenue = monthDocs.reduce((s, d) => s + (d.montant || 0), 0);
    return {
      factures: factures.length,
      proformas: proformas.length,
      devis: devis.length,
      total: docs.length,
      revenue,
      drafts: getDrafts().length,
      clients: getClients().length,
    };
  }

  /* ── Sample data ── */
  function _sampleClients() {
    return [
      { id: genId(), name: 'SNPT Togo', email: 'contact@snpt.tg', phone: '+228 22 21 00 00', address: 'Lomé', createdAt: '2024-01-15' },
      { id: genId(), name: 'UTB', email: 'info@utb.tg', phone: '+228 22 25 00 00', address: 'Lomé', createdAt: '2024-02-20' },
      { id: genId(), name: 'Ministère des Finances', email: 'contact@finances.gouv.tg', phone: '+228 22 23 00 00', address: 'Lomé', createdAt: '2024-03-10' },
      { id: genId(), name: 'CEET', email: 'ceet@ceet.tg', phone: '+228 22 24 00 00', address: 'Lomé', createdAt: '2024-04-05' },
      { id: genId(), name: 'Port Autonome de Lomé', email: 'pal@pal.tg', phone: '+228 22 26 00 00', address: 'Lomé', createdAt: '2024-05-12' },
    ];
  }

  function _sampleDocs() {
    const clients = getClients().length ? getClients() : _sampleClients();
    const objets = [
      'Fourniture de matériel informatique',
      'Installation réseau',
      'Maintenance serveurs',
      'Formation ICT',
      'Système de vidéosurveillance',
      'Équipements solaires',
      'Audit informatique',
    ];
    const docs = [];
    for (let i = 0; i < 28; i++) {
      const type = i % 4 === 3 ? 'proforma' : i % 7 === 6 ? 'devis' : 'facture';
      const year = 2025;
      const month = String((i % 12) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      const prefix = type === 'proforma' ? 'PRO' : type === 'devis' ? 'DEV' : 'FAC';
      docs.push({
        id: genId(),
        numero: `${prefix}-${year}-${String(i + 1).padStart(3, '0')}`,
        type,
        client: clients[i % clients.length].name,
        clientId: clients[i % clients.length].id,
        telephone: clients[i % clients.length].phone,
        email: clients[i % clients.length].email,
        adresse: clients[i % clients.length].address,
        objet: objets[i % objets.length],
        montant: Math.round((150000 + Math.random() * 2500000) / 1000) * 1000,
        date: `${year}-${month}-${day}`,
        echeance: `${year}-${month}-${String(Math.min(+day + 30, 28)).padStart(2, '0')}`,
        status: i % 5 === 0 ? 'paid' : i % 8 === 0 ? 'draft' : 'sent',
        tva: 18,
        lines: [],
        createdAt: `${year}-${month}-${day}T10:00:00`,
        updatedAt: `${year}-${month}-${day}T10:00:00`,
      });
    }
    return docs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /* ── Download helper ── */
  function downloadFile(content, filename, type) {
    const blob = new Blob(['\uFEFF' + content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Montant en lettres (français) ── */
  function amountToWords(n) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

    function under100(num) {
      if (num < 20) return units[num];
      const t = Math.floor(num / 10);
      const u = num % 10;
      if (t === 7 || t === 9) {
        const base = t === 7 ? 'soixante' : 'quatre-vingt';
        const teen = num - (t === 7 ? 60 : 80);
        return teen === 1 && t === 9 ? `${base}-onze` : `${base}-${units[teen]}`;
      }
      if (t === 8 && u === 0) return 'quatre-vingts';
      if (u === 1 && t !== 8) return `${tens[t]}-et-un`;
      return u ? `${tens[t]}-${units[u]}` : tens[t];
    }

    function under1000(num) {
      if (num < 100) return under100(num);
      const h = Math.floor(num / 100);
      const r = num % 100;
      const head = h === 1 ? 'cent' : `${units[h]} cent`;
      if (r === 0 && h > 1) return `${head}s`;
      return r ? `${head} ${under100(r)}` : head;
    }

    function chunk(num, scale) {
      if (num === 0) return '';
      if (num === 1 && scale === 'mille') return 'mille';
      const label = scale === 'mille' ? ' mille' : scale ? ` ${scale}` : '';
      const plural = num > 1 && scale && scale !== 'mille' ? 's' : '';
      return `${under1000(num)}${label}${plural}`.trim();
    }

    const amount = Math.round(Math.abs(n || 0));
    if (amount === 0) return 'zéro franc CFA';

    const parts = [];
    const millions = Math.floor(amount / 1000000);
    const thousands = Math.floor((amount % 1000000) / 1000);
    const rest = amount % 1000;

    if (millions) parts.push(chunk(millions, 'million'));
    if (thousands) parts.push(chunk(thousands, 'mille'));
    if (rest || !parts.length) parts.push(under1000(rest));

    return `${parts.join(' ').replace(/\s+/g, ' ').trim()} franc${amount > 1 ? 's' : ''} CFA`;
  }

  return {
    KEYS, Store,
    formatNumber, formatCurrency, formatDate, formatDateTime, amountToWords,
    debounce, clone, genId, todayISO, addDaysISO, downloadFile,
    getSettings, saveSettings, getProfile, saveProfile,
    getDocs, saveDocs, getDocById, nextNumero, incrementNumero,
    getDrafts, saveDrafts, getTrash, saveTrash, moveToTrash, restoreFromTrash,
    getClients, saveClients,
    getNotifications, addNotification, markNotificationRead, unreadCount,
    getStats,
  };
})();


/* ════════════════════════════
   TOAST
   ════════════════════════════ */
window.Toast = (function () {
  let container;

  function ensureContainer() {
    if (!container) {
      container = document.querySelector('.toast-stack');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-stack';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }
    }
    return container;
  }

  const icons = {
    success: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error:   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    info:    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2"/><path d="M6 5v3M6 4h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    warning: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2l4.5 8H1.5L6 2Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M6 5v2M6 8.5h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  };

  function show(message, type = 'info', duration = 4000) {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `<span class="toast__icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    ensureContainer().appendChild(el);

    setTimeout(() => {
      el.classList.add('is-leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, duration);
  }

  return {
    show,
    success: m => show(m, 'success'),
    error:   m => show(m, 'error'),
    info:    m => show(m, 'info'),
    warning: m => show(m, 'warning'),
  };
})();
