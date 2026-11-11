// api.js – Centralized MTVS API Client
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:4000/api'
    : '/api');

export function getToken() {
  return sessionStorage.getItem('mtvs_token');
}

export function setToken(token) {
  sessionStorage.setItem('mtvs_token', token);
}

export function clearToken() {
  sessionStorage.removeItem('mtvs_token');
  sessionStorage.removeItem('mtvs_admin');
}

export function getStoredAdmin() {
  try {
    return JSON.parse(sessionStorage.getItem('mtvs_admin'));
  } catch {
    return null;
  }
}

export function setStoredAdmin(admin) {
  sessionStorage.setItem('mtvs_admin', JSON.stringify(admin));
}

export async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired or unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/* ── Auth API ─────────────────────────────────────────────────── */
export async function loginAdmin(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  setStoredAdmin(data.admin);
  return data;
}

export async function changeAdminPassword(currentPassword, newPassword) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/* ── Masters API ──────────────────────────────────────────────── */
export async function fetchRegionsWithAreas() {
  return request('/masters/regions');
}

export async function fetchAllAreas() {
  return request('/masters/areas');
}

export async function createRegion(data) {
  return request('/masters/regions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRegion(id, data) {
  return request(`/masters/regions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRegion(id) {
  return request(`/masters/regions/${id}`, { method: 'DELETE' });
}

export async function createArea(data) {
  return request('/masters/areas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArea(id, data) {
  return request(`/masters/areas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteArea(id) {
  return request(`/masters/areas/${id}`, { method: 'DELETE' });
}

/* ── Membership Requests & Pass ───────────────────────────────── */
export async function submitRegistration(formData) {
  return request('/requests', {
    method: 'POST',
    body: formData,
  });
}

export async function fetchRequestByRef(ref) {
  return request(`/requests/${encodeURIComponent(ref)}`);
}

export async function fetchPassById(memberId) {
  return request(`/pass/${encodeURIComponent(memberId)}`);
}

/* ── Admin Requests & Stats ───────────────────────────────────── */
export async function fetchAdminStats() {
  return request('/requests/stats/summary');
}

export async function fetchAdminRequests(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.area) params.append('area', filters.area);
  if (filters.q) params.append('q', filters.q);
  return request(`/requests?${params.toString()}`);
}

export async function decideRequest(ref, action, reasonKey = null) {
  return request(`/requests/${encodeURIComponent(ref)}/decide`, {
    method: 'PATCH',
    body: JSON.stringify({ action, reasonKey }),
  });
}

/* ── Advertisements API ───────────────────────────────────────── */
export async function fetchActiveAds() {
  return request('/ads');
}

export async function fetchAllAds() {
  return request('/ads?all=true');
}

export async function createAd(data) {
  const isForm = data instanceof FormData;
  return request('/ads', {
    method: 'POST',
    body: isForm ? data : JSON.stringify(data),
  });
}

export async function updateAd(id, data) {
  const isForm = data instanceof FormData;
  return request(`/ads/${id}`, {
    method: 'PUT',
    body: isForm ? data : JSON.stringify(data),
  });
}

export async function deleteAd(id) {
  return request(`/ads/${id}`, { method: 'DELETE' });
}
