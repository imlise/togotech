'use strict';

// 🔥 Namespace global
window.AA = (function () {

  // =========================
  // 🔹 CONFIG
  // =========================
  const BASE_URL = '/api'; // adapte selon ton backend



const token = sessionStorage.getItem("tt_token");
// console.log(token)

// const response = await fetch("http://localhost:3000/api/test", {
//   headers: {
//     "Authorization": `Bearer ${token}`
//   }
// });

  // =========================
  // 🔹 HELPERS
  // =========================

  async function request(url, options = {}) {
    const res = await fetch(BASE_URL + url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API error: ${res.status}`);
    }

     // 🔥 GESTION TOKEN EXPIRE
  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem("tt_token");
    sessionStorage.removeItem("tt_auth");

    // redirection vers login
    window.location.href = "/index";
    return; // stop
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
  async function updateClient(id, data) {
    return request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

    async function deleteClient(id) {
    return request(`/clients/${id}`, {
      method: 'DELETE'
    });
  }

    async function getClientStats(id) {
    return request(`/clients/${id}/stats`);
  }


  // =========================
  // 🔹 FACTURES
  // =========================

async function getFactures(status) {
  const url = status 
    ? `/factures?status=${encodeURIComponent(status)}`
    : '/factures';

  return request(url);
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

  async function factureToDraft(id) {
    const data = {"facture":{
        "status":"draft"
      }};
    return request(`/factures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async function factureToBasket(id) {
    const data = {"facture":{
        "status":"deleted"
      }};
    return request(`/factures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async function getFacturesStats(){
    return request('/factures/stats');
  }

  async function getRevenueStats(period){
    return request(`/factures/revenue?period=${period}`);
  }



  async function deleteFacture(id) {
    return request(`/factures/${id}`, {
      method: 'DELETE'
    });
  }

  async function emptyTrash() {
    return request(`/factures/cleanup`, {
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
    updateClient,
    deleteClient,
    getClientStats,

    getFactures,
    getFacture,
    getFactureLignes,
    createFacture,
    updateFacture,
    deleteFacture,
    factureToDraft,
    factureToBasket,
    emptyTrash,
    getFacturesStats,
    getFacturesStats,

    getProduits
  };

})()