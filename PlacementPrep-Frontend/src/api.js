const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const SESSION_KEY = "placementprep.session";

export function getSavedSession() {
  const savedSession = localStorage.getItem(SESSION_KEY);
  if (!savedSession) return null;

  try {
    const session = JSON.parse(savedSession);
    return session?.token ? session : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function apiRequest(path, options = {}) {
  const session = getSavedSession();
  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(`Cannot reach the PlacementPrep backend: ${error.message}`);
  }

  const responseText = await response.text();
  let data = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const serverMessage =
      data?.message ||
      data?.detail ||
      data?.title ||
      data?.error ||
      (typeof data === "string" ? data.trim() : "");
    const message =
      serverMessage
        ? `${serverMessage} (HTTP ${response.status} ${options.method || "GET"} ${path})`
        : `Backend request failed (HTTP ${response.status} ${options.method || "GET"} ${path})`;
    throw new Error(message);
  }

  return data;
}
