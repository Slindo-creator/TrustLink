import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './api';

const KEY = 'trustlink_session';

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
  if (session?.token) {
    setTokens({ token: session.token, refreshToken: session.refreshToken });
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
  clearTokens();
}

export function isLoggedIn() {
  return !!getAccessToken() && !!getSession();
}

export function isVendor() {
  return getSession()?.role === 'VENDOR';
}

export function updateSession(patch) {
  const current = getSession() || {};
  const next = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  if (patch.token || patch.refreshToken) {
    setTokens({
      token: patch.token || getAccessToken(),
      refreshToken: patch.refreshToken || getRefreshToken(),
    });
  }
  return next;
}
