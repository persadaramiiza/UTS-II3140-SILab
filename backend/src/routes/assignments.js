import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { listAssignments, listSubmissions, upsertSubmission } from '../data/store.js';

export const assignmentsRouter = Router();

function findAssignment(assignments, assignmentId) {
  return assignments.find((item) => item.id === assignmentId) || null;
}

function toPublicSubmission(submission) {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    studentId: submission.studentId,
    studentName: submission.studentName,
    link: submission.link,
    notes: submission.notes,
    submittedAt: submission.submittedAt,
    updatedAt: submission.updatedAt,
    grade: submission.grade
      ? {
          score: submission.grade.score,
          feedback: submission.grade.feedback,
          gradedAt: submission.grade.gradedAt,
          graderId: submission.grade.graderId,
          graderName: submission.grade.graderName
        }
      : null
  };
}

assignmentsRouter.get('/assignments', requireAuth(), async (req, res, next) => {
  try {
    const assignments = await listAssignments();
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.get('/assignments/:assignmentId/submissions', requireAuth(), async (req, res, next) => {
  try {
    const assignments = await listAssignments();
    const assignment = findAssignment(assignments, req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    const submissions = await listSubmissions();
    const authUser = req.auth.rawUser;
    let filtered = submissions.filter((item) => item.assignmentId === assignment.id);

    if (authUser.role === 'student') {
      filtered = filtered.filter((item) => item.studentId === authUser.id);
    }

    filtered.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

    res.json({
      assignment,
      submissions: filtered.map(toPublicSubmission)
    });
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.get('/submissions/mine', requireAuth('student'), async (req, res, next) => {
  try {
    const submissions = await listSubmissions();
    const filtered = submissions
      .filter((item) => item.studentId === req.auth.rawUser.id)
      .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
    res.json({ submissions: filtered.map(toPublicSubmission) });
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.post('/assignments/:assignmentId/submissions', requireAuth('student'), async (req, res, next) => {
  try {
    const assignments = await listAssignments();
    const assignment = findAssignment(assignments, req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    const { link, notes } = req.body || {};
    if (!link && !notes) {
      return res.status(400).json({ message: 'Masukkan tautan atau catatan sebagai bukti pengumpulan.' });
    }

    const submissions = await listSubmissions();
    const authUser = req.auth.rawUser;
    const now = new Date().toISOString();

    const existing = submissions.find(
      (item) => item.assignmentId === assignment.id && item.studentId === authUser.id
    );

    const draft = {
      id: existing?.id || uuid(),
      assignmentId: assignment.id,
      studentId: authUser.id,
      studentName: authUser.name,
      link: link ? String(link).trim() : '',
      notes: notes ? String(notes).trim() : '',
      submittedAt: now,
      updatedAt: now,
      grade: null
    };

    await upsertSubmission(draft);

    res.status(existing ? 200 : 201).json({
      message: existing ? 'Pengumpulan diperbarui.' : 'Pengumpulan berhasil dibuat.',
      submission: toPublicSubmission(draft)
    });
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.post('/submissions/:submissionId/grade', requireAuth('assistant'), async (req, res, next) => {
  try {
    const submissions = await listSubmissions();
    const submission = submissions.find((item) => item.id === req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Pengumpulan tidak ditemukan.' });
    }

    const scoreValue = Number(req.body?.score);
    if (!Number.isFinite(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      return res.status(400).json({ message: 'Nilai harus di antara 0 sampai 100.' });
    }

    submission.grade = {
      score: Math.round(scoreValue),
      feedback: req.body?.feedback ? String(req.body.feedback).trim() : '',
      gradedAt: new Date().toISOString(),
      graderId: req.auth.rawUser.id,
      graderName: req.auth.rawUser.name
    };
    submission.updatedAt = new Date().toISOString();

    await upsertSubmission(submission);
    res.json({ message: 'Penilaian tersimpan.', submission: toPublicSubmission(submission) });
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.delete('/submissions/:submissionId/grade', requireAuth('assistant'), async (req, res, next) => {
  try {
    const submissions = await listSubmissions();
    const submission = submissions.find((item) => item.id === req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Pengumpulan tidak ditemukan.' });
    }

    if (!submission.grade) {
      return res.status(400).json({ message: 'Pengumpulan belum memiliki penilaian.' });
    }

    submission.grade = null;
    submission.updatedAt = new Date().toISOString();

    await upsertSubmission(submission);
    res.json({ message: 'Penilaian dihapus.', submission: toPublicSubmission(submission) });
  } catch (err) {
    next(err);
  }
});
