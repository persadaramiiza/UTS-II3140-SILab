import { apiFetch } from './apiClient.js';

export async function listUsersApi() {
  return apiFetch('/users');
}

export async function createUserApi(payload) {
  return apiFetch('/users', {
    method: 'POST',
    body: payload
  });
}

export async function updateUserApi(userId, payload) {
  return apiFetch(`/users/${userId}`, {
    method: 'PUT',
    body: payload
  });
}

export async function deleteUserApi(userId) {
  return apiFetch(`/users/${userId}`, {
    method: 'DELETE'
  });
}
