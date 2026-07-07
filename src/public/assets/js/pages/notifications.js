'use strict';

document.addEventListener('DOMContentLoaded', () => {
  TTLayout.initShell({ page: 'notifications', title: 'Notifications' });
  document.getElementById('app-header').innerHTML = TTLayout.renderHeader({
    breadcrumb: [{ label: 'Dashboard', href: 'dashboard.html' }, { label: 'Notifications' }],
  }).replace(/^<header class="app-header">|<\/header>$/g, '');

  renderNotifications();

  document.getElementById('markAllRead')?.addEventListener('click', () => {
    const list = TT.getNotifications().map(n => ({ ...n, read: true }));
    TT.Store.set(TT.KEYS.notifications, list);
    renderNotifications();
    Toast.success('Toutes les notifications marquées comme lues.');
  });
});

function renderNotifications() {
  const notifs = TT.getNotifications();
  const list = document.getElementById('notifList');
  const empty = document.getElementById('notifEmpty');

  if (!notifs.length) {
    list.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const iconMap = { create: 'success', delete: 'error', draft: 'info', restore: 'warning' };

  list.innerHTML = notifs.map(n => `
    <div class="notif-item${n.read ? '' : ' is-unread'}" data-id="${n.id}">
      <div class="notif-item__icon" style="background:var(--color-${iconMap[n.type] || 'info'}-bg);color:var(--color-${iconMap[n.type] || 'info'})">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </div>
      <div class="notif-item__body">
        <div class="notif-item__text">${n.message}</div>
        <div class="notif-item__time">${TT.formatDateTime(n.createdAt)}</div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      TT.markNotificationRead(item.dataset.id);
      item.classList.remove('is-unread');
    });
  });
}
