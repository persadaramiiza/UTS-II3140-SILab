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

function buildDefaultQuizTopics(now) {
  return [
    {
      id: 'quiz-isl-basics',
      title: 'Dasar Information System Lab',
      description: 'Pertanyaan pengantar seputar modul dan aktivitas utama di ISL.',
      createdAt: now,
      updatedAt: now,
      createdBy: 'assistant-isl',
      questions: [
        {
          id: 'quiz-isl-q1',
          type: 'multiple',
          question: 'Apa tujuan utama dari Information System Laboratory (ISL)?',
          options: [
            'Mengembangkan hardware komputer',
            'Menyediakan teknologi untuk masyarakat informasi dan ekonomi digital',
            'Membuat aplikasi mobile',
            'Mengelola server dan jaringan'
          ],
          correct: 1,
          order: 0,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'quiz-isl-q2',
          type: 'multiple',
          question: 'Dalam modul Requirements Engineering, metode prioritas apa yang digunakan?',
          options: ['MoSCoW', 'RICE', 'WSJF', 'Kano'],
          correct: 0,
          order: 1,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'quiz-isl-q3',
          type: 'text',
          question: 'Sebutkan salah satu artefak yang dapat dikumpulkan mahasiswa di SILab.',
          correct: ['wireframe', 'diagram', 'laporan'],
          order: 2,
          createdAt: now,
          updatedAt: now
        }
      ]
    }
  ];
}

function buildDefaultData() {
  const hash = (password) => bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 'admin-isl',
        role: 'admin',
        username: 'admin',
        name: 'Administrator ISL',
        passwordHash: hash('admin123'),
        createdAt: now,
        updatedAt: now,
        authProvider: 'local',
        email: 'admin@isl.local'
      },
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
    assignments: [],
    submissions: [],
    announcements: [],
    quizTopics: buildDefaultQuizTopics(now)
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

function fromQuizTopicRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    createdBy: row.created_by ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null
  };
}

function fromQuizQuestionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    topicId: row.topic_id,
    type: row.type,
    question: row.question,
    options: Array.isArray(row.options) ? row.options : row.options ?? [],
    correct: row.correct,
    order: row.order_index ?? 0,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null
  };
}

function ensureQuizTopicsState(state) {
  if (!state.quizTopics) state.quizTopics = [];
  state.quizTopics = state.quizTopics.map((topic) => ({
    ...topic,
    questions: Array.isArray(topic.questions) ? topic.questions : []
  }));
}

async function fetchQuizQuestionsByTopicIds(topicIds) {
  if (!topicIds.length) return [];
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('topic_id', topicIds)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  handleSupabaseError('quizQuestions.list', error);
  return data || [];
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
  } else {
    const defaultAdmin = defaults.users.find((user) => user.username === 'admin');
    if (defaultAdmin) {
      const { data: adminRecord, error: adminCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('username', defaultAdmin.username)
        .maybeSingle();
      handleSupabaseError('users.findAdmin', adminCheckError);
      if (!adminRecord) {
        const { error: insertAdminError } = await supabase
          .from('users')
          .upsert(toUserRow(defaultAdmin), { onConflict: 'username' });
        handleSupabaseError('users.seedAdmin', insertAdminError);
        console.log('[Supabase] Default admin user ensured.');
      }
    }
  }

  const { error: assignmentsHeadError, count: assignmentsCount } = await supabase
    .from('assignments')
    .select('id', { count: 'exact', head: true });
  handleSupabaseError('assignments.count', assignmentsHeadError);

  if ((!assignmentsCount || assignmentsCount === 0) && defaults.assignments.length > 0) {
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

function normalizeAssignmentInput({ id, title, description, focus }) {
  const now = new Date().toISOString();
  const normalized = {
    id: id || `asg-${randomUUID()}`,
    title: (title || '').trim(),
    description: (description || '').trim(),
    focus: (focus || '').trim() || 'General',
    createdAt: now,
    updatedAt: now
  };
  if (!normalized.title) {
    throw new Error('Judul tugas wajib diisi.');
  }
  return normalized;
}

export async function createAssignment({ title, description = '', focus = 'General' }) {
  const payload = normalizeAssignmentInput({ title, description, focus });

  if (useSupabase) {
    const { data, error } = await supabase
      .from('assignments')
      .insert(toAssignmentRow(payload))
      .select('*')
      .maybeSingle();
    handleSupabaseError('assignments.create', error);
    return data ? fromAssignmentRow(data) : payload;
  }

  const state = await getState();
  state.assignments.push({ ...payload });
  await persist();
  return { ...payload };
}

export async function updateAssignment(assignmentId, { title, description, focus }) {
  if (!assignmentId) throw new Error('ID tugas wajib diisi.');
  const updates = {};
  if (title !== undefined) {
    const trimmed = String(title).trim();
    if (!trimmed) throw new Error('Judul tugas wajib diisi.');
    updates.title = trimmed;
  }
  if (description !== undefined) {
    updates.description = String(description).trim();
  }
  if (focus !== undefined) {
    const trimmedFocus = String(focus).trim();
    updates.focus = trimmedFocus || 'General';
  }
  const now = new Date().toISOString();
  updates.updatedAt = now;

  if (useSupabase) {
    const supabaseUpdate = {
      updated_at: now
    };
    if (updates.title !== undefined) supabaseUpdate.title = updates.title;
    if (updates.description !== undefined) supabaseUpdate.description = updates.description;
    if (updates.focus !== undefined) supabaseUpdate.focus = updates.focus;

    const { data, error } = await supabase
      .from('assignments')
      .update(supabaseUpdate)
      .eq('id', assignmentId)
      .select('*')
      .maybeSingle();
    handleSupabaseError('assignments.update', error);
    return data ? fromAssignmentRow(data) : null;
  }

  const state = await getState();
  const index = state.assignments.findIndex((item) => item.id === assignmentId);
  if (index === -1) {
    return null;
  }
  const updated = { ...state.assignments[index], ...updates };
  state.assignments[index] = updated;
  await persist();
  return { ...updated };
}

export async function deleteAssignment(assignmentId) {
  if (!assignmentId) return false;
  if (useSupabase) {
    const { error: submissionsError } = await supabase.from('submissions').delete().eq('assignment_id', assignmentId);
    handleSupabaseError('assignments.deleteSubmissions', submissionsError);
    const { data, error } = await supabase.from('assignments').delete().eq('id', assignmentId).select('*').maybeSingle();
    handleSupabaseError('assignments.delete', error);
    return Boolean(data);
  }

  const state = await getState();
  const before = state.assignments.length;
  state.assignments = state.assignments.filter((item) => item.id !== assignmentId);
  state.submissions = state.submissions.filter((item) => item.assignmentId !== assignmentId);
  const changed = state.assignments.length !== before;
  await persist();
  return changed;
}

export async function listAnnouncements() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    handleSupabaseError('announcements.list', error);
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      createdBy: row.created_by,
      createdByName: row.created_by_name
    }));
  }

  const state = await getState();
  return state.announcements ? state.announcements.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
}

export async function createAnnouncement({ title, content, createdBy, createdByName }) {
  const payload = {
    id: randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString(),
    createdBy,
    createdByName
  };

  if (useSupabase) {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        id: payload.id,
        title: payload.title,
        content: payload.content,
        created_by: payload.createdBy,
        created_by_name: payload.createdByName,
        created_at: payload.createdAt
      })
      .select()
      .maybeSingle();
    handleSupabaseError('announcements.create', error);
    return data
      ? {
          id: data.id,
          title: data.title,
          content: data.content,
          createdAt: data.created_at,
          createdBy: data.created_by,
          createdByName: data.created_by_name
        }
      : payload;
  }

  const state = await getState();
  if (!state.announcements) state.announcements = [];
  state.announcements.unshift(payload);
  await persist();
  return payload;
}

export async function listQuizTopics({ includeQuestions = false } = {}) {
  if (useSupabase) {
    const { data, error } = await supabase.from('quiz_topics').select('*').order('created_at', { ascending: true });
    handleSupabaseError('quizTopics.list', error);
    const topics = (data || []).map(fromQuizTopicRow);
    if (includeQuestions && topics.length) {
      const questionRows = await fetchQuizQuestionsByTopicIds(topics.map((t) => t.id));
      const grouped = new Map(topics.map((topic) => [topic.id, []]));
      questionRows.forEach((row) => {
        const question = fromQuizQuestionRow(row);
        if (!grouped.has(question.topicId)) grouped.set(question.topicId, []);
        grouped.get(question.topicId).push(question);
      });
      return topics.map((topic) => ({
        ...topic,
        questions: grouped.get(topic.id) || [],
        questionCount: grouped.get(topic.id)?.length || 0
      }));
    }
    return topics.map((topic) => ({
      ...topic,
      questionCount: 0
    }));
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  return state.quizTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description || '',
    createdBy: topic.createdBy || null,
    createdAt: topic.createdAt || null,
    updatedAt: topic.updatedAt || null,
    questions: includeQuestions ? topic.questions.map((q) => ({ ...q })) : undefined,
    questionCount: topic.questions.length
  }));
}

export async function getQuizTopicById(topicId, { includeQuestions = false } = {}) {
  if (useSupabase) {
    const { data, error } = await supabase.from('quiz_topics').select('*').eq('id', topicId).maybeSingle();
    handleSupabaseError('quizTopics.get', error);
    if (!data) return null;
    const topic = fromQuizTopicRow(data);
    if (includeQuestions) {
      const { data: questionRows, error: questionError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });
      handleSupabaseError('quizQuestions.list', questionError);
      topic.questions = (questionRows || []).map(fromQuizQuestionRow);
      topic.questionCount = topic.questions.length;
    }
    return topic;
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const topic = state.quizTopics.find((item) => item.id === topicId);
  if (!topic) return null;
  return {
    ...topic,
    questions: includeQuestions ? topic.questions.map((q) => ({ ...q })) : undefined,
    questionCount: topic.questions.length
  };
}

export async function createQuizTopic({ title, description, createdBy }) {
  const now = new Date().toISOString();
  if (useSupabase) {
    const { data, error } = await supabase
      .from('quiz_topics')
      .insert({
        title,
        description: description || '',
        created_by: createdBy || null,
        created_at: now,
        updated_at: now
      })
      .select('*')
      .maybeSingle();
    handleSupabaseError('quizTopics.create', error);
    return { ...fromQuizTopicRow(data), questions: [], questionCount: 0 };
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const topic = {
    id: randomUUID(),
    title,
    description: description || '',
    createdBy: createdBy || null,
    createdAt: now,
    updatedAt: now,
    questions: []
  };
  state.quizTopics.push(topic);
  await persist();
  return { ...topic, questionCount: 0 };
}

export async function updateQuizTopic(topicId, { title, description }) {
  const now = new Date().toISOString();
  if (useSupabase) {
    const { data, error } = await supabase
      .from('quiz_topics')
      .update({
        title,
        description: description ?? '',
        updated_at: now
      })
      .eq('id', topicId)
      .select('*')
      .maybeSingle();
    handleSupabaseError('quizTopics.update', error);
    if (!data) return null;
    return { ...fromQuizTopicRow(data) };
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const topic = state.quizTopics.find((item) => item.id === topicId);
  if (!topic) return null;
  if (title !== undefined) topic.title = title;
  if (description !== undefined) topic.description = description;
  topic.updatedAt = now;
  await persist();
  return { ...topic, questions: topic.questions.map((q) => ({ ...q })), questionCount: topic.questions.length };
}

export async function deleteQuizTopic(topicId) {
  if (useSupabase) {
    const { error } = await supabase.from('quiz_topics').delete().eq('id', topicId);
    handleSupabaseError('quizTopics.delete', error);
    return true;
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const index = state.quizTopics.findIndex((topic) => topic.id === topicId);
  if (index === -1) return false;
  state.quizTopics.splice(index, 1);
  await persist();
  return true;
}

export async function listQuizQuestions(topicId) {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic_id', topicId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });
    handleSupabaseError('quizQuestions.list', error);
    return (data || []).map(fromQuizQuestionRow);
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const topic = state.quizTopics.find((item) => item.id === topicId);
  if (!topic) return [];
  return topic.questions.map((q) => ({ ...q }));
}

function normalizeQuestionPayload({ type, question, options, correct }) {
  if (type !== 'multiple' && type !== 'text') {
    throw new Error('Jenis soal tidak didukung.');
  }
  if (!question || !question.trim()) {
    throw new Error('Pertanyaan wajib diisi.');
  }
  const payload = {
    type,
    question: question.trim()
  };
  if (type === 'multiple') {
    const normalizedOptions = (options || []).map((opt) => String(opt ?? '').trim()).filter(Boolean);
    if (normalizedOptions.length < 2) {
      throw new Error('Masukkan minimal dua opsi jawaban.');
    }
    const correctIndex = Number(correct);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= normalizedOptions.length) {
      throw new Error('Nomor jawaban benar tidak valid.');
    }
    payload.options = normalizedOptions;
    payload.correct = correctIndex;
  } else {
    const normalizedAnswers = Array.isArray(correct)
      ? correct.map((ans) => String(ans ?? '').trim()).filter(Boolean)
      : String(correct ?? '').split('\n').map((ans) => ans.trim()).filter(Boolean);
    if (!normalizedAnswers.length) {
      throw new Error('Masukkan minimal satu jawaban benar.');
    }
    payload.options = [];
    payload.correct = normalizedAnswers.length === 1 ? normalizedAnswers[0] : normalizedAnswers;
  }
  return payload;
}

export async function createQuizQuestion(topicId, data) {
  const now = new Date().toISOString();
  const payload = normalizeQuestionPayload(data);
  if (useSupabase) {
    const { data: orderData, error: orderError } = await supabase
      .from('quiz_questions')
      .select('order_index')
      .eq('topic_id', topicId)
      .order('order_index', { ascending: false })
      .limit(1);
    handleSupabaseError('quizQuestions.order', orderError);
    const nextOrder = orderData && orderData.length ? (orderData[0].order_index ?? 0) + 1 : 0;
    const { data: inserted, error } = await supabase
      .from('quiz_questions')
      .insert({
        topic_id: topicId,
        type: payload.type,
        question: payload.question,
        options: payload.options,
        correct: payload.correct,
        order_index: nextOrder,
        created_at: now,
        updated_at: now
      })
      .select('*')
      .maybeSingle();
    handleSupabaseError('quizQuestions.create', error);
    return fromQuizQuestionRow(inserted);
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const topic = state.quizTopics.find((item) => item.id === topicId);
  if (!topic) {
    throw new Error('Topik kuis tidak ditemukan.');
  }
  const question = {
    id: randomUUID(),
    topicId,
    type: payload.type,
    question: payload.question,
    options: payload.options,
    correct: payload.correct,
    order: topic.questions.length,
    createdAt: now,
    updatedAt: now
  };
  topic.questions.push(question);
  topic.updatedAt = now;
  await persist();
  return { ...question };
}

export async function updateQuizQuestion(topicId, questionId, data) {
  const now = new Date().toISOString();
  const payload = normalizeQuestionPayload(data);
  if (useSupabase) {
    const { data: updated, error } = await supabase
      .from('quiz_questions')
      .update({
        type: payload.type,
        question: payload.question,
        options: payload.options,
        correct: payload.correct,
        updated_at: now
      })
      .eq('id', questionId)
      .eq('topic_id', topicId)
      .select('*')
      .maybeSingle();
    handleSupabaseError('quizQuestions.update', error);
    return updated ? fromQuizQuestionRow(updated) : null;
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const topic = state.quizTopics.find((item) => item.id === topicId);
  if (!topic) return null;
  const question = topic.questions.find((q) => q.id === questionId);
  if (!question) return null;
  Object.assign(question, payload, { updatedAt: now });
  await persist();
  return { ...question };
}

export async function deleteQuizQuestion(topicId, questionId) {
  if (useSupabase) {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId).eq('topic_id', topicId);
    handleSupabaseError('quizQuestions.delete', error);
    return true;
  }

  const state = await getState();
  ensureQuizTopicsState(state);
  const topic = state.quizTopics.find((item) => item.id === topicId);
  if (!topic) return false;
  const index = topic.questions.findIndex((q) => q.id === questionId);
  if (index === -1) return false;
  topic.questions.splice(index, 1);
  topic.questions = topic.questions.map((q, idx) => ({ ...q, order: idx }));
  await persist();
  return true;
}

export async function listUsers() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });
    handleSupabaseError('users.list', error);
    return (data || []).map(fromUserRow);
  }

  const { users } = await getState();
  return users.map((user) => ({ ...user }));
}

export async function deleteUser(id) {
  if (useSupabase) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    handleSupabaseError('users.delete', error);
    return true;
  }

  const state = await getState();
  const index = state.users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  state.users.splice(index, 1);
  await persist();
  return true;
}

export async function createUser({
  id,
  username,
  name,
  role,
  email,
  password,
  picture,
  studentId,
  department,
  phone,
  bio,
  authProvider = 'local'
}) {
  const userId = id || randomUUID();
  const now = new Date().toISOString();
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const newUser = {
    id: userId,
    username,
    name,
    role,
    email: email || null,
    picture: picture || null,
    studentId: studentId || null,
    department: department || null,
    phone: phone || null,
    bio: bio || null,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    authProvider: passwordHash ? authProvider : 'google'
  };

  const stored = await upsertUser(newUser);
  return stored;
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
