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
const allowedOrigins = config.corsOrigin === '*' 
  ? '*' 
  : config.corsOrigin.split(',').map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
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
