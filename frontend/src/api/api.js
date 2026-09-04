const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Ocurrió un error inesperado.");
  }
  return data;
}

// ===== AUTH =====
export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function register(username, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function resetPassword(token, password) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  return handleResponse(res);
}

export function googleLoginUrl() {
  return `${API_URL}/auth/google`;
}

export function facebookLoginUrl() {
  return `${API_URL}/auth/facebook`;
}

// ===== JUEGOS =====
export async function getGames() {
  const res = await fetch(`${API_URL}/games`);
  return handleResponse(res);
}

export async function getGame(id) {
  const res = await fetch(`${API_URL}/games/${id}`);
  return handleResponse(res);
}

export async function createGame(formData, token) {
  const res = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function updateGame(id, formData, token) {
  const res = await fetch(`${API_URL}/games/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function deleteGame(id, token) {
  const res = await fetch(`${API_URL}/games/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function postReview(id, rating, comentario, token) {
  const res = await fetch(`${API_URL}/games/${id}/resenas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comentario }),
  });
  return handleResponse(res);
}

// ===== CARRITO / ÓRDENES =====
export async function checkout(items, token) {
  const res = await fetch(`${API_URL}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
  });
  return handleResponse(res);
}

export async function getOrder(id, token) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function payOrder(id, metodo, token) {
  const res = await fetch(`${API_URL}/orders/${id}/pagar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ metodo }),
  });
  return handleResponse(res);
}

export async function getMyOrders(token) {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
