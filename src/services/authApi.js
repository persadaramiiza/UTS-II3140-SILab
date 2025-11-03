import { apiFetch } from './apiClient.js';

export async function loginWithCredentials(username, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { username, password }
  });
  if (!data?.token || !data?.user) {
    throw new Error('Login gagal: server tidak mengembalikan token.');
  }
  return data;
}

export async function fetchCurrentUser() {
  const data = await apiFetch('/auth/me');
  return data?.user || null;
}
