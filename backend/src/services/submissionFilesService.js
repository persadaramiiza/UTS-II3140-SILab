import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { supabase } from '../data/supabaseClient.js';
import { config } from '../config.js';

const bucket = config.supabaseStorageBucket;
const hasStorage = Boolean(supabase && bucket);

function ensureStorage() {
  if (!hasStorage) {
    throw new Error('Supabase storage belum dikonfigurasi');
  }
}

function sanitizeFilename(filename = 'file') {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function handleStorageError(context, error) {
  if (!error) return;
  console.error(`[Supabase Storage] ${context} error:`, error);
  throw new Error(`[Supabase Storage] ${context} gagal: ${error.message}`);
}

export async function createUploadUrl(submissionId, { originalName, contentType, sizeBytes }) {
  ensureStorage();
  const fileId = randomUUID();
  const safeName = sanitizeFilename(path.basename(originalName || 'file'));
  const storagePath = `${submissionId}/${fileId}-${safeName}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(storagePath, 60);
  handleStorageError('createSignedUploadUrl', error);

  if (!data?.signedUrl) {
    throw new Error('Gagal membuat URL upload');
  }

  return {
    fileId,
    storagePath,
    signedUrl: data.signedUrl,
    token: data.token,
    originalName,
    contentType,
    sizeBytes
  };
}

export async function createDownloadUrl(storagePath) {
  ensureStorage();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 300);
  handleStorageError('createSignedUrl', error);
  if (!data?.signedUrl) {
    throw new Error('Gagal membuat URL unduhan');
  }
  return data.signedUrl;
}

export async function deleteStorageObject(storagePath) {
  ensureStorage();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  handleStorageError('remove', error);
}

export function isStorageConfigured() {
  return hasStorage;
}
