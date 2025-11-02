// CRITICAL: Load environment variables FIRST
import './env.js';

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import { initStore } from './data/store.js';
import { authenticateRequest } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { assignmentsRouter } from './routes/assignments.js';
import { usersRouter } from './routes/users.js';
import { errorHandler, notFound } from './middleware/error.js';

async function bootstrap() {
  await initStore();

  const app = express();

  // Configure CORS to handle multiple origins
  const allowedOrigins = config.corsOrigin === '*' 
    ? '*' 
    : config.corsOrigin.split(',').map(o => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, curl)
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
  app.use(morgan('dev'));
  app.use(authenticateRequest);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api', assignmentsRouter);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`ISL backend running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});

