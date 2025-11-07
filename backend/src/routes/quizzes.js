import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listQuizTopics,
  getQuizTopicById,
  createQuizTopic,
  updateQuizTopic,
  deleteQuizTopic,
  listQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion
} from '../data/store.js';

export const quizzesRouter = Router();

function includeFlag(value) {
  return value === '1' || value === 'true' || value === 'yes';
}

quizzesRouter.get('/topics', async (req, res, next) => {
  try {
    const includeQuestions = includeFlag(req.query.includeQuestions);
    const topics = await listQuizTopics({ includeQuestions });
    res.json({ topics });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.get('/topics/:topicId', async (req, res, next) => {
  try {
    const includeQuestions = includeFlag(req.query.includeQuestions ?? '1');
    const topic = await getQuizTopicById(req.params.topicId, { includeQuestions });
    if (!topic) return res.status(404).json({ message: 'Topik kuis tidak ditemukan.' });
    res.json({ topic });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.post('/topics', requireAuth('assistant', 'admin'), async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Judul topik wajib diisi.' });
    }
    const topic = await createQuizTopic({
      title: title.trim(),
      description: description?.trim() || '',
      createdBy: req.auth.user.id
    });
    res.status(201).json({ topic });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.put('/topics/:topicId', requireAuth('assistant', 'admin'), async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ message: 'Judul topik tidak boleh kosong.' });
    }
    const topic = await updateQuizTopic(req.params.topicId, {
      title: title?.trim(),
      description: description?.trim()
    });
    if (!topic) return res.status(404).json({ message: 'Topik kuis tidak ditemukan.' });
    res.json({ topic });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.delete('/topics/:topicId', requireAuth('assistant', 'admin'), async (req, res, next) => {
  try {
    const success = await deleteQuizTopic(req.params.topicId);
    if (!success) return res.status(404).json({ message: 'Topik kuis tidak ditemukan.' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.get('/topics/:topicId/questions', async (req, res, next) => {
  try {
    const topic = await getQuizTopicById(req.params.topicId, { includeQuestions: false });
    if (!topic) return res.status(404).json({ message: 'Topik kuis tidak ditemukan.' });
    const questions = await listQuizQuestions(req.params.topicId);
    res.json({ topic, questions });
  } catch (err) {
    next(err);
  }
});

function normalizeQuestionBody(body = {}) {
  const { type, question, options, correct } = body;
  return {
    type: type || 'multiple',
    question,
    options,
    correct
  };
}

quizzesRouter.post('/topics/:topicId/questions', requireAuth('assistant', 'admin'), async (req, res, next) => {
  try {
    const payload = normalizeQuestionBody(req.body);
    const question = await createQuizQuestion(req.params.topicId, payload);
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
});

quizzesRouter.put(
  '/topics/:topicId/questions/:questionId',
  requireAuth('assistant', 'admin'),
  async (req, res, next) => {
    try {
      const payload = normalizeQuestionBody(req.body);
      const question = await updateQuizQuestion(req.params.topicId, req.params.questionId, payload);
      if (!question) return res.status(404).json({ message: 'Soal tidak ditemukan.' });
      res.json({ question });
    } catch (err) {
      next(err);
    }
  }
);

quizzesRouter.delete(
  '/topics/:topicId/questions/:questionId',
  requireAuth('assistant', 'admin'),
  async (req, res, next) => {
    try {
      const success = await deleteQuizQuestion(req.params.topicId, req.params.questionId);
      if (!success) return res.status(404).json({ message: 'Soal tidak ditemukan.' });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);
