import { apiFetch } from './apiClient.js';

export async function fetchAnnouncements() {
  const data = await apiFetch('/announcements');
  return Array.isArray(data.announcements) ? data.announcements : [];
}

export async function createAnnouncement(payload) {
  const data = await apiFetch('/announcements', {
    method: 'POST',
    body: payload
  });
  return data.announcement;
}
