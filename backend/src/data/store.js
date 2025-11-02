import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';

let stateCache = null;
let initPromise = null;
let memoryOnly = false;

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function buildDefaultData() {
  const hash = (password) => bcrypt.hashSync(password, 10);
  return {
    users: [
      {
        id: 'assistant-isl',
        role: 'assistant',
        username: 'asisten',
        name: 'Asisten ISL',
        passwordHash: hash('asisten123')
      },
      {
        id: 'student-01',
        role: 'student',
        username: 'mahasiswa',
        name: 'Mahasiswa ISL',
        passwordHash: hash('mahasiswa123')
      },
      {
        id: 'student-02',
        role: 'student',
        username: 'mahasiswa2',
        name: 'Mahasiswa Alternatif',
        passwordHash: hash('mahasiswa234')
      }
    ],
    assignments: [
      {
        id: 'asg-req',
        title: 'Analisis Requirement',
        description:
          'Susun minimal tiga user story beserta acceptance criteria untuk modul Sistem Informasi pilihan Anda.',
        focus: 'Requirements'
      },
      {
        id: 'asg-ea',
        title: 'Value Stream Mapping',
        description:
          'Pemetaan value stream dan capability yang relevan untuk organisasi fiktif yang Anda rancang.',
        focus: 'Enterprise Architecture'
      },
      {
        id: 'asg-proto',
        title: 'Prototype Wireframe',
        description:
          'Bangun wireframe interaktif dan jelaskan alur interaksi utama pada canvas prototyping.',
        focus: 'Interaction Design'
      }
    ],
    submissions: []
  };
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
    if (isReadOnlyError(err)) {
      enableMemoryStore(err.message);
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
  if (!initPromise) {
    initPromise = loadState();
  }
  await initPromise;
}

export async function getState() {
  await initStore();
  return stateCache;
}

async function persistToFile() {
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
  stateCache = memoryOnly ? cloneState(newState) : newState;
  await persistToFile();
  return stateCache;
}

export async function persist() {
  await persistToFile();
}

export async function findUserByUsername(username) {
  const { users } = await getState();
  return users.find((user) => user.username.toLowerCase() === String(username).toLowerCase()) || null;
}

export async function findUserById(id) {
  const { users } = await getState();
  return users.find((user) => user.id === id) || null;
}

export async function findUserByEmail(email) {
  const { users } = await getState();
  return users.find((user) => user.email && user.email.toLowerCase() === String(email).toLowerCase()) || null;
}

export async function upsertUser(user) {
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
  const { assignments } = await getState();
  return assignments.slice();
}

export async function listSubmissions() {
  const { submissions } = await getState();
  return submissions.slice();
}

export async function upsertSubmission(submission) {
  const state = await getState();
  const index = state.submissions.findIndex((item) => item.id === submission.id);
  if (index >= 0) {
    state.submissions[index] = { ...state.submissions[index], ...submission };
  } else {
    state.submissions.push(submission);
  }
  await persist();
  return submission;
}

export async function setSubmissions(submissions) {
  const state = await getState();
  state.submissions = submissions;
  await persist();

  return memoryOnly ? state.submissions.map((item) => ({ ...item })) : state.submissions.slice();
}
