/**
 * JWT utility functions for auto-logout timer management.
 * Token expiry detection (isTokenExpired) lives in api.ts.
 */

/**
 * Returns the number of milliseconds until the stored token expires.
 * Returns 0 if the token is already expired or missing.
 */
export function getTokenExpiry(): number {
  const token = localStorage.getItem('token');
  if (!token) return 0;

  try {
    // JWT uses base64url; convert to standard base64 before atob()
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (typeof payload.exp !== 'number') return 0;
    const ms = payload.exp * 1000 - Date.now();
    return ms > 0 ? ms : 0;
  } catch {
    return 0;
  }
}

let autoLogoutTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedules an auto-logout timer that fires when the current token expires.
 * Calls onExpired when the time comes. Clears any previous timer first.
 */
export function setupAutoLogout(onExpired: () => void): void {
  clearAutoLogout();

  const ms = getTokenExpiry();
  if (ms <= 0) {
    // Already expired: fire immediately on next tick
    autoLogoutTimer = setTimeout(onExpired, 0);
    return;
  }

  autoLogoutTimer = setTimeout(onExpired, ms);
}

/**
 * Cancels any pending auto-logout timer.
 */
export function clearAutoLogout(): void {
  if (autoLogoutTimer !== null) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }
}
