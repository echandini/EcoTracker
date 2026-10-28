

const API_BASE_URL = window.ECOCOLLECT_API_URL || "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function currentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function requireRole(role) {
  const user = currentUser();
  if (!sessionStorage.getItem("token") || !user || user.role !== role) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.replace("login.html");
    return null;
  }
  return user;
}

function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.location.href = "login.html";
}

function escapeHtml(value) {
  const characters = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value == null ? "" : value).replace(/[&<>"']/g, character => characters[character]);
}
