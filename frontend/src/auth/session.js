const ACCESS_TOKEN_KEY = "hema_access_token";
const USER_KEY = "hema_user";

function emitAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hema-auth-changed"));
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession({ accessToken, user }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  emitAuthChanged();
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitAuthChanged();
}

export function getDefaultRouteByRole(role) {
  if (role === "donor") return "/donor/dashboard";
  if (role === "hospital") return "/hospital/dashboard";
  if (role === "blood_bank") return "/bloodbank/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

