import { apiRequest } from './api.js';

export async function login(credentials) {
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  window.localStorage.setItem('hospital-token', result.token);
  return result.user;
}

export async function register(details) {
  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(details),
  });
  window.localStorage.setItem('hospital-token', result.token);
  return result.user;
}

export async function getCurrentUser() {
  const result = await apiRequest('/auth/me');
  return result.user;
}

export function logout() {
  window.localStorage.removeItem('hospital-token');
}