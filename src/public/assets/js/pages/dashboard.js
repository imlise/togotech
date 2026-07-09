'use strict';

const API_BASE = 'http://localhost:3000/api';

let facturesCache = [];
let clientsCache = [];
let currentPeriod = '6months';

document.addEventListener('DOMContentLoaded', async () => {
  TTLayout.initShell({ page: 'dashboard' });

  const header = document.getElementById('app-header');
  if (header) {
    header.innerHTML = TTLayout.renderHeader({}).replace(/^<header class="app-header">|<\/header>$/g, '');
  }

  initGreeting();

  try {
    const [factures, clients] = await Promise.all([fetchFactures(), fetchClients()]);
    facturesCache = factures;
    clientsCache = clients;
  } catch (err) {
    console.error(err);
    Toast.error('Impossible de charger les documents.');
  }

  await renderStats();
  renderRecentDocs();
  renderActivity();
  initChart(currentPeriod);

  document.querySelectorAll('[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      initChart(btn.dataset.chartPeriod);
    });
  });
});

// --- Appels API ---

async function fetchFactures() {
  const response = await fetch(`${API_BASE}/factures`);
  if (!response.ok) throw new Error('Erreur lors du chargement des factures.');
  return response.json();
}

async function fetchClients() {
  const response = await fetch(`${API_BASE}/clients`);
  if (!response.ok) throw new Error('Erreur lors du chargement des clients.');
  return response.json();
}

async function fetchFactureStats() {
  const response = await fetch(`${API_BASE}/factures/stats`);
  if (!response.ok) throw new Error('Erreur lors du chargement des statistiques.');
  return response.json(); // { totalDocs, totalProforma, totalFactures, chiffreAffaireMois }
}

async function fetchRevenueStats(period = '6months') {
  const response = await fetch(`${API_BASE}/factures/revenue?period=${period}`);
  if (!response.ok) throw new Error('Erreur lors du chargement du chiffre d\'affaires.');
  return response.json(); // [{ month: "2026-07", total: 141600 }, ...]
}

// --- Aides ---

function clientName(clientId) {
  const c = clientsCache.find(c => c.id === clientId);
  return c ? c.nom : '—';
}

function getDocs() {
  return facturesCache
    .map(f => ({
      id: f.id,
      numero: f.reference,
      type: f.isProforma ? 'proforma' : 'facture',
      client: clientName(f.client),
      objet: f.objet,
      montant: f.totalTtc,
      date: f.dateEcheance ? new Date(f.dateEcheance) : null,
    }))
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
}

function initGreeting() {
  const el = document.getElementById('dashGreeting');
  if (!el) return;
  const h = new Date().getHours();
  const g = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  const email = sessionStorage.getItem('tt_user_email') || 'admin@togotech.com';
  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  el.textContent = `${g}, ${name} — voici la situation de votre entreprise aujourd'hui.`;
}

// --- Cartes de stats ---

async function renderStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  let stats;
  try {
    const s = await fetchFactureStats();
    stats = {
      factures: s.totalFactures,
      proformas: s.totalProforma,
      total: s.totalDocs,
      revenue: s.chiffreAffaireMois,
    };
  } catch (err) {
    console.error(err);
    Toast.error('Impossible de charger les statistiques.');
    stats = { factures: 0, proformas: 0, total: 0, revenue: 0 };
  }

  const cards = [
    {
      label: 'Factures émises', value: stats.factures, trend: '+12%', trendType: 'up', theme: 'blue', delay: '.04s', progress: 78,
      icon: '<path d="M3 2h10a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.3"/><path d="M5 5.5h6M5 8h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
      deco: '<svg viewBox="0 0 120 120" fill="none"><rect x="20" y="15" width="70" height="90" rx="8" stroke="currentColor" stroke-width="6"/><path d="M35 45h50M35 60h40M35 75h30" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
    },
    {
      label: 'Proformas', value: stats.proformas, trend: '+8%', trendType: 'up', theme: 'coral', delay: '.08s', progress: 62,
      icon: '<path d="M3 2h10a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 8l2 2 3-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
      deco: '<svg viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="45" stroke="currentColor" stroke-width="6"/><path d="M40 60l15 15 30-30" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'Total documents', value: stats.total, trend: 'Stable', trendType: 'flat', theme: 'green', delay: '.12s', progress: 90,
      icon: '<rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>',
      deco: '<svg viewBox="0 0 120 120" fill="none"><rect x="15" y="15" width="40" height="40" rx="6" stroke="currentColor" stroke-width="6"/><rect x="65" y="15" width="40" height="40" rx="6" stroke="currentColor" stroke-width="6"/><rect x="15" y="65" width="40" height="40" rx="6" stroke="currentColor" stroke-width="6"/><rect x="65" y="65" width="40" height="40" rx="6" stroke="currentColor" stroke-width="6"/></svg>',
    },
    {
      label: 'CA du mois (FCFA)', value: stats.revenue, trend: '+24%', trendType: 'up', theme: 'amber', delay: '.16s', currency: true, progress: 55,
      icon: '<path d="M2 12V4M6 12V7M10 12V5M14 12V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
      deco: '<svg viewBox="0 0 120 120" fill="none"><path d="M15 95 L35 65 L55 75 L75 35 L105 55" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 95 L105 95" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
    },
  ];

  grid.innerHTML = cards.map(c => `
    <div class="stat-card stat-card--${c.theme}" style="--delay:${c.delay}">
      <div class="stat-card__deco" aria-hidden="true">${c.deco}</div>
      <div class="stat-card__head">
        <div class="stat-card__icon"><svg width="22" height="22" viewBox="0 0 16 16" fill="none">${c.icon}</svg></div>
        <span class="stat-card__trend${c.trendType === 'down' ? ' stat-card__trend--down' : c.trendType === 'flat' ? ' stat-card__trend--flat' : ''}">${c.trend}</span>
      </div>
      <div class="stat-card__body">
        <div class="stat-card__value text-mono" data-count="${c.value}" data-currency="${c.currency || false}">0</div>
        <div class="stat-card__label">${c.label}</div>
        <div class="stat-card__progress"><div class="stat-card__progress-fill" style="width:${c.progress}%"></div></div>
      </div>
    </div>
  `).join('');

  animateCounters(grid.querySelectorAll('[data-count]'));
}

function animateCounters(els) {
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  els.forEach(el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const start = performance.now();
    const dur = 1200;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const v = Math.round(easeOut(p) * target);
      el.textContent = TT.formatNumber(v);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// --- Documents récents ---

function renderRecentDocs() {
  const tbody = document.getElementById('recentBody');
  if (!tbody) return;
  const docs = getDocs().slice(0, 6);
  tbody.innerHTML = docs.map(d => `
    <tr style="cursor:pointer" onclick="location.href='document.html?id=${d.id}'">
      <td class="td-mono">${d.numero}</td>
      <td><span class="badge badge--${d.type}">${d.type === 'facture' ? 'Facture' : d.type === 'proforma' ? 'Proforma' : 'Devis'}</span></td>
      <td class="truncate" style="max-width:160px">${d.client}</td>
      <td class="td-mono">${TT.formatCurrency(d.montant)}</td>
      <td class="text-secondary">${d.date ? TT.formatDate(d.date) : '—'}</td>
    </tr>
  `).join('');
}

// --- Activité ---

function renderActivity() {
  const list = document.getElementById('activityList');
  if (!list) return;
  const docs = getDocs().slice(0, 6);

  if (!docs.length) {
    list.innerHTML = '<div class="empty-state" style="padding:var(--space-8)"><p class="text-secondary">Aucune activité récente</p></div>';
    return;
  }

  list.innerHTML = docs.map(d => `
    <div class="activity-item">
      <span class="activity-item__dot"></span>
      <div class="activity-item__content">
        <div class="activity-item__text"><strong>${d.numero}</strong> créé pour ${d.client}</div>
        <div class="activity-item__time">${d.date ? TT.formatDate(d.date) : '—'}</div>
      </div>
    </div>
  `).join('');
}

// --- Graphique ---

async function initChart(period = currentPeriod) {
  currentPeriod = period;
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;

  let stats;
  try {
    stats = await fetchRevenueStats(period);
  } catch (err) {
    console.error(err);
    Toast.error('Impossible de charger le chiffre d\'affaires.');
    stats = [];
  }

  const { labels, values } = buildMonthSeries(stats, period === '12months' ? 12 : 6);
  drawChart(canvas, labels, values);
}

function buildMonthSeries(apiStats, count) {
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  const statsMap = new Map(apiStats.map(s => [s.month, s.total]));

  const now = new Date();
  const labels = [];
  const values = [];

  // Correction : utiliser 'count' au lieu de 6
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(monthNames[d.getMonth()]);
    values.push(statsMap.get(key) || 0);
  }

  return { labels, values };
}

function drawChart(canvas, months, values) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const pad = { t: 20, r: 20, b: 36, l: 60 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const max = Math.max(...values, 1) * 1.1;

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
    const val = max - (max / 4) * i;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(TT.formatNumber(Math.round(val / 1000)) + 'k', pad.l - 8, y + 4);
  }

  const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + chartH);
  grad.addColorStop(0, 'rgba(0, 148, 255, 0.18)');
  grad.addColorStop(1, 'rgba(0, 148, 255, 0)');

  const points = values.map((v, i) => ({
    x: pad.l + (chartW / (values.length - 1)) * i,
    y: pad.t + chartH - (v / max) * chartH,
  }));

  ctx.beginPath();
  ctx.moveTo(points[0].x, pad.t + chartH);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, pad.t + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
  }
  ctx.strokeStyle = '#0094FF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#0094FF';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 148, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  ctx.fillStyle = '#64748B';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  months.forEach((m, i) => {
    ctx.fillText(m, points[i].x, H - 12);
  });
}





window.addEventListener('resize', TT.debounce(() => initChart(currentPeriod), 200));