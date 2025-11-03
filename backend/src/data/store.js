import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { supabase } from './supabaseClient.js';
import { randomUUID } from 'node:crypto';

let stateCache = null;
let initPromise = null;
let memoryOnly = false;
const useSupabase = Boolean(supabase);

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function buildDefaultData() {
  const hash = (password) => bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 'assistant-isl',
        role: 'assistant',
        username: 'asisten',
        name: 'Asisten ISL',
        passwordHash: hash('asisten123'),
        createdAt: now,
        updatedAt: now,
        authProvider: 'local'
      },
      {
        id: 'student-01',
        role: 'student',
        username: 'mahasiswa',
        name: 'Mahasiswa ISL',
        passwordHash: hash('mahasiswa123'),
        createdAt: now,
        updatedAt: now,
        authProvider: 'local'
      },
      {
        id: 'student-02',
        role: 'student',
        username: 'mahasiswa2',
        name: 'Mahasiswa Alternatif',
        passwordHash: hash('mahasiswa234'),
        createdAt: now,
        updatedAt: now,
        authProvider: 'local'
      }
    ],
    assignments: [
      {
        id: 'asg-req',
        title: 'Analisis Requirement',
        description:
          'Susun minimal tiga user story beserta acceptance criteria untuk modul Sistem Informasi pilihan Anda.',
        focus: 'Requirements',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'asg-ea',
        title: 'Value Stream Mapping',
        description:
          'Pemetaan value stream dan capability yang relevan untuk organisasi fiktif yang Anda rancang.',
        focus: 'Enterprise Architecture',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'asg-proto',
        title: 'Prototype Wireframe',
        description:
          'Bangun wireframe interaktif dan jelaskan alur interaksi utama pada canvas prototyping.',
        focus: 'Interaction Design',
        createdAt: now,
        updatedAt: now
      }
    ],
    submissions: []
  };
}

const SUPABASE_TABLE_MISSING_CODE = '42P01';
const SUBMISSION_FILE_TABLE = 'submission_files';

function handleSupabaseError(context, error) {
  if (!error) return;
  if (error.code === SUPABASE_TABLE_MISSING_CODE) {
    throw new Error(
      `[Supabase] Tabel untuk ${context} belum dibuat. Jalankan migrasi SQL di Supabase terlebih dahulu. (detail: ${error.message})`
    );
  }
  console.error(`[Supabase] ${context} error:`, error);
  throw new Error(`[Supabase] ${context} gagal: ${error.message}`);
}

function fromUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    username: row.username,
    name: row.name,
    passwordHash: row.password_hash ?? null,
    email: row.email ?? null,
    picture: row.picture ?? null,
    googleId: row.google_id ?? null,
    emailVerified: row.email_verified ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    authProvider: row.auth_provider ?? null,
    studentId: row.student_id ?? null,
    department: row.department ?? null,
    phone: row.phone ?? null,
    bio: row.bio ?? null
  };
}

function toUserRow(user) {
  const now = new Date().toISOString();
  return {
    id: user.id,
    role: user.role,
    username: user.username,
    name: user.name,
    password_hash: user.passwordHash ?? null,
    email: user.email ?? null,
    picture: user.picture ?? null,
    google_id: user.googleId ?? null,
    email_verified: user.emailVerified ?? null,
    created_at: user.createdAt ?? now,
    updated_at: user.updatedAt ?? now,
    auth_provider: user.authProvider ?? null,
    student_id: user.studentId ?? null,
    department: user.department ?? null,
    phone: user.phone ?? null,
    bio: user.bio ?? null
  };
}

function fromAssignmentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    focus: row.focus,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null
  };
}

function toAssignmentRow(assignment) {
  const now = new Date().toISOString();
  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    focus: assignment.focus,
    created_at: assignment.createdAt ?? now,
    updated_at: assignment.updatedAt ?? now
  };
}

function fromSubmissionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    studentId: row.student_id,
    studentName: row.student_name,
    link: row.link ?? '',
    notes: row.notes ?? '',
    submittedAt: row.submitted_at ?? null,
    updatedAt: row.updated_at ?? null,
    grade: row.grade ?? null,
    files: row.files
      ? row.files
          .map((file) => ({
            id: file.id,
            storagePath: file.storage_path,
            originalName: file.original_name,
            contentType: file.content_type,
            sizeBytes: file.size_bytes,
            uploadedBy: file.uploaded_by,
            createdAt: file.created_at
          }))
      : []
  };
}

function toSubmissionRow(submission) {
  const now = new Date().toISOString();
  return {
    id: submission.id,
    assignment_id: submission.assignmentId,
    student_id: submission.studentId,
    student_name: submission.studentName,
    link: submission.link ?? '',
    notes: submission.notes ?? '',
    submitted_at: submission.submittedAt ?? now,
    updated_at: submission.updatedAt ?? now,
    grade: submission.grade ?? null
  };
}

function ensureSubmissionHasFiles(submission) {
  if (!submission.files) {
    submission.files = [];
  }
  return submission;
}

async function ensureSupabaseDefaults() {
  const defaults = buildDefaultData();

  const { error: userHeadError, count: userCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });
  handleSupabaseError('users.count', userHeadError);

  if (!userCount || userCount === 0) {
    const { error: insertUsersError } = await supabase
      .from('users')
      .upsert(defaults.users.map(toUserRow), { onConflict: 'id' });
    handleSupabaseError('users.upsert', insertUsersError);
    console.log('[Supabase] Seeded default users');
  }

  const { error: assignmentsHeadError, count: assignmentsCount } = await supabase
    .from('assignments')
    .select('id', { count: 'exact', head: true });
  handleSupabaseError('assignments.count', assignmentsHeadError);

  if (!assignmentsCount || assignmentsCount === 0) {
    const { error: insertAssignmentsError } = await supabase
      .from('assignments')
      .upsert(defaults.assignments.map(toAssignmentRow), { onConflict: 'id' });
    handleSupabaseError('assignments.upsert', insertAssignmentsError);
    console.log('[Supabase] Seeded default assignments');
  }
}

async function initSupabaseStore() {
  await ensureSupabaseDefaults();
}

function isReadOnlyError(error) {
  return ['EROFS', 'EACCES', 'EPERM'].includes(error?.code);
}

function enableMemoryStore(reason) {
  if (!memoryOnly) {
    memoryOnly = true;
    console.warn('[Store] Falling back to in-memory data store:', reason);
    if (!stateCache) {
      stateCache = buildDefaultData();
    }
  }
}

async function ensureDataFile() {
  if (memoryOnly) return;

  try {
    await mkdir(config.dataDir, { recursive: true });
  } catch (err) {
    if (isReadOnlyError(err) || err.code === 'ENOENT') {
      enableMemoryStore(err.message || err.code);
      return;
    }
    throw err;
  }

  try {
    await access(config.dataFile, fsConstants.F_OK);
  } catch (err) {
    if (isReadOnlyError(err)) {
      enableMemoryStore(err.message);
      return;
    }

    if (err.code === 'ENOENT') {
      const defaults = buildDefaultData();
      try {
        await writeFile(config.dataFile, JSON.stringify(defaults, null, 2), 'utf-8');
        stateCache = cloneState(defaults);
      } catch (writeErr) {
        if (isReadOnlyError(writeErr)) {
          enableMemoryStore(writeErr.message);
          return;
        }
        throw writeErr;
      }
    } else {
      throw err;
    }
  }
}

async function loadState() {
  if (stateCache) return stateCache;
  await ensureDataFile();

  if (stateCache) return stateCache;
  if (memoryOnly) {
    stateCache = buildDefaultData();
    return stateCache;
  }

  try {
    const contents = await readFile(config.dataFile, 'utf-8');
    stateCache = JSON.parse(contents);
    return stateCache;
  } catch (err) {
    if (isReadOnlyError(err)) {
      enableMemoryStore(err.message);
      return stateCache;
    }
    throw err;
  }
}

export async function initStore() {
  if (useSupabase) {
    if (!initPromise) {
      initPromise = initSupabaseStore();
    }
    await initPromise;
    return;
  }

  if (!initPromise) {
    initPromise = loadState();
  }
  await initPromise;
}

export async function getState() {
  if (useSupabase) {
    throw new Error('getState() tidak tersedia saat menggunakan Supabase store');
  }
  await initStore();
  return stateCache;
}

async function persistToFile() {
  if (useSupabase) return;
  if (memoryOnly) return;

  try {
    await writeFile(config.dataFile, JSON.stringify(stateCache, null, 2), 'utf-8');
  } catch (err) {
    if (isReadOnlyError(err)) {
      enableMemoryStore(err.message);
      return;
    }
    throw err;
  }
}

export async function writeState(newState) {
  if (useSupabase) {
    throw new Error('writeState() tidak tersedia saat menggunakan Supabase store');
  }
  stateCache = memoryOnly ? cloneState(newState) : newState;
  await persistToFile();
  return stateCache;
}

export async function persist() {
  if (!useSupabase) {
    await persistToFile();
  }
}

export async function findUserByUsername(username) {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', String(username))
      .limit(1)
      .maybeSingle();
    handleSupabaseError('users.findByUsername', error);
    return data ? fromUserRow(data) : null;
  }

  const { users } = await getState();
  return users.find((user) => user.username.toLowerCase() === String(username).toLowerCase()) || null;
}

export async function findUserById(id) {
  if (useSupabase) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    handleSupabaseError('users.findById', error);
    return data ? fromUserRow(data) : null;
  }

  const { users } = await getState();
  return users.find((user) => user.id === id) || null;
}

export async function findUserByEmail(email) {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', String(email))
      .limit(1)
      .maybeSingle();
    handleSupabaseError('users.findByEmail', error);
    return data ? fromUserRow(data) : null;
  }

  const { users } = await getState();
  return users.find((user) => user.email && user.email.toLowerCase() === String(email).toLowerCase()) || null;
}

export async function upsertUser(user) {
  if (useSupabase) {
    const row = toUserRow({
      ...user,
      updatedAt: new Date().toISOString(),
      createdAt: user.createdAt || new Date().toISOString()
    });
    const { data, error } = await supabase.from('users').upsert(row).select().maybeSingle();
    handleSupabaseError('users.upsert', error);
    return data ? fromUserRow(data) : user;
  }

  const state = await getState();
  const index = state.users.findIndex((u) => u.id === user.id);

  if (index >= 0) {
    state.users[index] = { ...state.users[index], ...user };
  } else {
    state.users.push(user);
  }

  await persist();
  return user;
}

export async function listAssignments() {
  if (useSupabase) {
    const { data, error } = await supabase.from('assignments').select('*').order('title', { ascending: true });
    handleSupabaseError('assignments.list', error);
    return (data || []).map(fromAssignmentRow);
  }

  const { assignments } = await getState();
  return assignments.slice();
}

export async function listSubmissions() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('submissions')
      .select(
        `
        *,
        files:submission_files (
          id,
          storage_path,
          original_name,
          content_type,
          size_bytes,
          uploaded_by,
          created_at
        )
      `
      )
      .order('submitted_at', { ascending: false });
    handleSupabaseError('submissions.list', error);
    return (data || []).map(fromSubmissionRow);
  }

  const { submissions } = await getState();
  return submissions.map((item) => ensureSubmissionHasFiles({ ...item }));
}

export async function upsertSubmission(submission) {
  if (useSupabase) {
    const row = toSubmissionRow(submission);
    const { data, error } = await supabase
      .from('submissions')
      .upsert(row)
      .select(
        `
        *,
        files:submission_files (
          id,
          storage_path,
          original_name,
          content_type,
          size_bytes,
          uploaded_by,
          created_at
        )
      `
      )
      .maybeSingle();
    handleSupabaseError('submissions.upsert', error);
    return data ? fromSubmissionRow(data) : submission;
  }

  const state = await getState();
  const index = state.submissions.findIndex((item) => item.id === submission.id);
  if (index >= 0) {
    const existing = ensureSubmissionHasFiles(state.submissions[index]);
    const incoming = ensureSubmissionHasFiles(submission);
    state.submissions[index] = { ...existing, ...incoming, files: incoming.files };
  } else {
    state.submissions.push(ensureSubmissionHasFiles({ ...submission }));
  }
  await persist();
  const saved =
    index >= 0
      ? ensureSubmissionHasFiles({ ...state.submissions[index] })
      : ensureSubmissionHasFiles({ ...state.submissions[state.submissions.length - 1] });
  return saved;
}

export async function setSubmissions(submissions) {
  const state = await getState();
  state.submissions = submissions.map((sub) => ensureSubmissionHasFiles({ ...sub }));
  await persist();

  return memoryOnly ? state.submissions.map((item) => ({ ...item })) : state.submissions.slice();
}

export async function findSubmissionById(submissionId) {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('submissions')
      .select(
        `
        *,
        files:submission_files (
          id,
          storage_path,
          original_name,
          content_type,
          size_bytes,
          uploaded_by,
          created_at
        )
      `
      )
      .eq('id', submissionId)
      .maybeSingle();
    handleSupabaseError('submissions.findById', error);
    return data ? fromSubmissionRow(data) : null;
  }

  const state = await getState();
  const found = state.submissions.find((item) => item.id === submissionId);
  return found ? ensureSubmissionHasFiles({ ...found }) : null;
}

export async function listSubmissionFiles(submissionId) {
  if (useSupabase) {
    const { data, error } = await supabase
      .from(SUBMISSION_FILE_TABLE)
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });
    handleSupabaseError('submission_files.list', error);
    return (data || []).map((row) => ({
      id: row.id,
      storagePath: row.storage_path,
      originalName: row.original_name,
      contentType: row.content_type,
      sizeBytes: row.size_bytes,
      uploadedBy: row.uploaded_by,
      createdAt: row.created_at
    }));
  }

  const submission = await findSubmissionById(submissionId);
  return submission?.files ? submission.files.map((file) => ({ ...file })) : [];
}

export async function addSubmissionFileRecord(submissionId, fileRecord) {
  if (useSupabase) {
    const payload = {
      id: fileRecord.id || randomUUID(),
      submission_id: submissionId,
      storage_path: fileRecord.storagePath,
      original_name: fileRecord.originalName,
      content_type: fileRecord.contentType,
      size_bytes: fileRecord.sizeBytes ?? null,
      uploaded_by: fileRecord.uploadedBy,
      created_at: fileRecord.createdAt ?? new Date().toISOString()
    };
    const { data, error } = await supabase.from(SUBMISSION_FILE_TABLE).insert(payload).select().maybeSingle();
    handleSupabaseError('submission_files.insert', error);
    return data
      ? {
          id: data.id,
          storagePath: data.storage_path,
          originalName: data.original_name,
          contentType: data.content_type,
          sizeBytes: data.size_bytes,
          uploadedBy: data.uploaded_by,
          createdAt: data.created_at
        }
      : {
          id: payload.id,
          storagePath: payload.storage_path,
          originalName: payload.original_name,
          contentType: payload.content_type,
          sizeBytes: payload.size_bytes,
          uploadedBy: payload.uploaded_by,
          createdAt: payload.created_at
        };
  }

  const state = await getState();
  const submission = state.submissions.find((item) => item.id === submissionId);
  if (!submission) {
    throw new Error('Submission tidak ditemukan');
  }
  ensureSubmissionHasFiles(submission);
  const record = {
    id: fileRecord.id || randomUUID(),
    storagePath: fileRecord.storagePath,
    originalName: fileRecord.originalName,
    contentType: fileRecord.contentType,
    sizeBytes: fileRecord.sizeBytes ?? null,
    uploadedBy: fileRecord.uploadedBy,
    createdAt: fileRecord.createdAt ?? new Date().toISOString()
  };
  submission.files.push(record);
  await persist();
  return { ...record };
}

export async function removeSubmissionFileRecord(submissionId, fileId) {
  if (useSupabase) {
    const { data, error } = await supabase
      .from(SUBMISSION_FILE_TABLE)
      .delete()
      .eq('submission_id', submissionId)
      .eq('id', fileId)
      .select()
      .maybeSingle();
    handleSupabaseError('submission_files.remove', error);
    return data
      ? {
          id: data.id,
          storagePath: data.storage_path,
          originalName: data.original_name,
          contentType: data.content_type,
          sizeBytes: data.size_bytes,
          uploadedBy: data.uploaded_by,
          createdAt: data.created_at
        }
      : null;
  }

  const state = await getState();
  const submission = state.submissions.find((item) => item.id === submissionId);
  if (!submission) return null;
  ensureSubmissionHasFiles(submission);
  const index = submission.files.findIndex((file) => file.id === fileId);
  if (index === -1) return null;
  const [removed] = submission.files.splice(index, 1);
  await persist();
  return removed ? { ...removed } : null;
}

export async function getSubmissionFileRecord(submissionId, fileId) {
  if (useSupabase) {
    const { data, error } = await supabase
      .from(SUBMISSION_FILE_TABLE)
      .select('*')
      .eq('submission_id', submissionId)
      .eq('id', fileId)
      .maybeSingle();
    handleSupabaseError('submission_files.get', error);
    return data
      ? {
          id: data.id,
          storagePath: data.storage_path,
          originalName: data.original_name,
          contentType: data.content_type,
          sizeBytes: data.size_bytes,
          uploadedBy: data.uploaded_by,
          createdAt: data.created_at
        }
      : null;
  }

  const submission = await findSubmissionById(submissionId);
  if (!submission?.files) return null;
  const file = submission.files.find((item) => item.id === fileId);
  return file ? { ...file } : null;
}
