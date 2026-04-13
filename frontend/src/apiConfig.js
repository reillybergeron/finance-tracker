function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

const fromEnv = process.env.REACT_APP_API_BASE_URL;
const resolved =
  fromEnv && String(fromEnv).trim() !== ""
    ? String(fromEnv).trim()
    : "http://localhost:8080";

export const API_BASE_URL = normalizeBaseUrl(resolved);

/** @param {string} path e.g. "/api/transactions" */
export function apiUrl(path) {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${suffix}`;
}
