export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const ACCESS_KEY = 'trustlink_access_token';
const REFRESH_KEY = 'trustlink_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ token, refreshToken }) {
  if (token) localStorage.setItem(ACCESS_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(payload, response) {
  if (payload && typeof payload === 'object') {
    return payload.message || payload.error || payload.detail || `Request failed (${response.status})`;
  }
  return `Request failed (${response.status})`;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await parseResponse(response);
  setTokens(data);
  return true;
}

export async function apiFetch(path, options = {}, allowRefresh = true) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const url = `${API_BASE}${path}`;
  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (cause) {
    const error = new Error(`Cannot reach TrustLink API at ${url}. Start the Spring Boot backend on port 8080.`);
    error.cause = cause;
    error.status = 0;
    throw error;
  }

  if (response.status === 401 && allowRefresh && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = new Headers(options.headers || {});
      if (!isFormData && options.body && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      retryHeaders.set('Authorization', `Bearer ${getAccessToken()}`);
      try {
        response = await fetch(url, { ...options, headers: retryHeaders });
      } catch (cause) {
        const error = new Error(`Cannot reach TrustLink API at ${url}. Start the Spring Boot backend on port 8080.`);
        error.cause = cause;
        error.status = 0;
        throw error;
      }
    }
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    const error = new Error(errorMessage(payload, response));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const api = {
  signup: (data) =>
    apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: (refreshToken) =>
    apiFetch('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, false),

  me: () => apiFetch('/api/users/me'),

  becomeVendor: (businessName) =>
    apiFetch('/api/users/me/become-vendor', {
      method: 'POST',
      body: JSON.stringify({ businessName }),
    }),

  vendors: ({ area, name } = {}) => {
    const params = new URLSearchParams();
    if (area?.trim()) params.set('area', area.trim());
    if (name?.trim()) params.set('name', name.trim());
    const query = params.toString();
    return apiFetch(`/api/vendors${query ? `?${query}` : ''}`);
  },

  vendor: (id) => apiFetch(`/api/vendors/${id}`),
  ownVendor: () => apiFetch('/api/vendors/me'),

  updateVendor: (data) =>
    apiFetch('/api/vendors/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  products: (vendorId) => apiFetch(`/api/vendors/${vendorId}/products`),

  createProduct: (data) =>
    apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    apiFetch(`/api/products/${id}`, { method: 'DELETE' }),

  reviews: (vendorId) => apiFetch(`/api/vendors/${vendorId}/reviews`),

  createReview: (vendorId, data) =>
    apiFetch(`/api/vendors/${vendorId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verificationDocuments: () => apiFetch('/api/vendors/me/verification-documents'),

  uploadVerificationDocument: (file, documentType) => {
    const form = new FormData();
    form.append('file', file);
    if (documentType) form.append('documentType', documentType);
    return apiFetch('/api/vendors/me/verification-documents', {
      method: 'POST',
      body: form,
    });
  },
};
