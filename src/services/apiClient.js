const DEFAULT_DEV_API = 'http://localhost:4000/api';

export function resolveApiBase() {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  if (env?.VITE_API_URL) return env.VITE_API_URL;
  if (env?.DEV) return DEFAULT_DEV_API;
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/api`;
  }
  return DEFAULT_DEV_API;
}

function buildHeaders(extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = localStorage.getItem('isl-token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (isJson && body && (body.message || body.error)) ||
      (typeof body === 'string' && body.length ? body : 'Terjadi kesalahan pada server.');
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function apiFetch(path, { method = 'GET', body, headers, raw, signal } = {}) {
  const base = resolveApiBase();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const options = {
    method,
    headers: headers instanceof Headers ? headers : buildHeaders(headers),
    signal
  };

  if (body !== undefined && body !== null) {
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
      options.body = body;
      options.headers.delete('Content-Type');
    } else if (typeof body === 'string') {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);
  return raw ? response : handleResponse(response);
}

export function ensureToken() {
  const token = localStorage.getItem('isl-token');
  if (!token) {
    throw new Error('Tidak ada token autentikasi. Silakan login kembali.');
  }
  return token;
}
