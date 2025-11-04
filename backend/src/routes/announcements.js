import { Router } from 'express';
import { listAnnouncements, createAnnouncement } from '../data/store.js';
import { requireAuth } from '../middleware/auth.js';

export const announcementsRouter = Router();

// GET /api/announcements - public list
announcementsRouter.get('/', async (req, res, next) => {
  try {
    const announcements = await listAnnouncements();
    res.json({ announcements });
  } catch (err) {
    next(err);
  }
});

// POST /api/announcements - assistants/admins only
announcementsRouter.post('/', requireAuth('assistant', 'admin'), async (req, res, next) => {
  try {
    const { title, content } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Judul pengumuman wajib diisi.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Isi pengumuman wajib diisi.' });
    }

    const creator = req.auth.rawUser;
    const created = await createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      createdBy: creator.id,
      createdByName: creator.name || creator.username
    });

    res.status(201).json({
      message: 'Pengumuman berhasil ditambahkan.',
      announcement: created
    });
  } catch (err) {
    next(err);
  }
});
