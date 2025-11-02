// Vercel Serverless Function Wrapper for Express Backend
import '../backend/src/env.js';
import express from 'express';
import cors from 'cors';
import { config } from '../backend/src/config.js';
import { initStore } from '../backend/src/data/store.js';
import { authenticateRequest } from '../backend/src/middleware/auth.js';
import { authRouter } from '../backend/src/routes/auth.js';
import { assignmentsRouter } from '../backend/src/routes/assignments.js';
import { usersRouter } from '../backend/src/routes/users.js';
import { errorHandler, notFound } from '../backend/src/middleware/error.js';

// Initialize store once
let storeInitialized = false;

async function ensureStoreInitialized() {
  if (!storeInitialized) {
    await initStore();
    storeInitialized = true;
  }
}

const app = express();

// Configure CORS
const fromEnv =
  config.corsOrigin === '*'
    ? ['*']
    : config.corsOrigin
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

const vercelDerivedOrigins = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : null,
  process.env.URL ? `https://${process.env.URL}` : null
].filter(Boolean);

const allowedOrigins = Array.from(new Set([...fromEnv, ...vercelDerivedOrigins]));

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed === origin) return true;
    if (allowed.includes('*')) {
      const escaped = allowed.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped.replace(/\\\*/g, '.*')}$`);
      return regex.test(origin);
    }
    return false;
  });
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(authenticateRequest);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api', assignmentsRouter);

app.use(notFound);
app.use(errorHandler);

// Serverless function handler
export default async function handler(req, res) {
  await ensureStoreInitialized();
  return app(req, res);
}
