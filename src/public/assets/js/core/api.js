'use strict';

// 🔥 Namespace global
window.AA = (function () {

  // =========================
  // 🔹 CONFIG
  // =========================
  const BASE_URL = '/api'; // adapte selon ton backend

  // =========================
  // 🔹 HELPERS
  // =========================

  async function request(url, options = {}) {
    const res = await fetch(BASE_URL + url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return res.json();
  }

  // =========================
  // 🔹 PROFILE (comme ton TT)
  // =========================

  function getProfile() {

    const email = sessionStorage.getItem('tt_user_email') || 'admin@togotech.com';

    return {
      email,
      name: email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      phone: '',
      avatar: '',
      language: 'fr',
      timezone: 'Africa/Lome',
    };
  }

 
  // =========================
  // 🔹 NUMERO FACTURE
  // =========================

 async function nextNumero(type = 'facture') {
  const isProforma = type === 'proforma';

  const url = `/factures/next-reference${isProforma ? '?isProforma=true' : ''}`;
  
  const res = await request(url);
  return res.reference;
}

  // =========================
  // 🔹 CLIENTS
  // =========================

  async function getClients() {
    return request('/clients');
  }
  async function getClient(id) {
    return request(`/clients/${id}`);
  }

  async function createClient(data) {
    return request('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // =========================
  // 🔹 FACTURES
  // =========================

  async function getFactures() {
    return request('/factures');
  }

  async function getFacture(id) {
    return request(`/factures/${id}`);
  }

  async function getFactureLignes(factureId) {
    return request(`/factures/${factureId}/lignes`);
  }

  async function createFacture(data) {
    return request('/factures', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async function updateFacture(id, data) {
    return request(`/factures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async function deleteFacture(id) {
    return request(`/factures/${id}`, {
      method: 'DELETE'
    });
  }

  // =========================
  // 🔹 PRODUITS
  // =========================

  async function getProduits() {
    return request('/produits');
  }

  // =========================
  // 🔹 EXPORT PUBLIC
  // =========================

  return {
    getProfile,
    nextNumero,

    getClients,
    getClient,
    createClient,

    getFactures,
    getFacture,
    getFactureLignes,
    createFacture,
    updateFacture,
    deleteFacture,

    getProduits
  };

})()