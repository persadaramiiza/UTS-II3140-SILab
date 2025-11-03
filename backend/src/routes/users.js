import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';
import {
  findUserById,
  upsertUser,
  listUsers,
  createUser,
  deleteUser,
  findUserByUsername,
  findUserByEmail
} from '../data/store.js';

export const usersRouter = Router();
const ALLOWED_ROLES = ['admin', 'assistant', 'student'];

function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function canChangeRole(requestor) {
  return requestor.role === 'admin';
}

async function ensureAdminCountAfterChange(targetUserId, newRole) {
  if (newRole === 'admin') {
    return;
  }
  const users = await listUsers();
  const adminUsers = users.filter((user) => user.role === 'admin');
  const isTargetAdmin = adminUsers.some((user) => user.id === targetUserId);
  if (!isTargetAdmin) return;
  if (adminUsers.length <= 1) {
    throw new Error('Tidak dapat menghapus admin terakhir.');
  }
}

// GET /api/users - List all users (admin only)
usersRouter.get('/', requireAuth('admin'), async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.json({
      users: users.map(toPublicUser)
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/users - Create new user (admin only)
usersRouter.post('/', requireAuth('admin'), async (req, res, next) => {
  try {
    const { username, name, role, email, password, picture, studentId, department, phone, bio } = req.body || {};

    if (!username || !name || !role) {
      return res.status(400).json({ message: 'Username, nama, dan role wajib diisi.' });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Role tidak dikenal. Gunakan admin, assistant, atau student.' });
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah digunakan.' });
    }

    if (email) {
      const existingEmail = await findUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: 'Email sudah digunakan.' });
      }
    }

    if (role !== 'student' && !password) {
      return res.status(400).json({ message: 'Password wajib diisi untuk akun non-student.' });
    }

    const newUser = await createUser({
      username: String(username).trim(),
      name: String(name).trim(),
      role,
      email: email ? String(email).trim() : null,
      password: password ? String(password) : null,
      picture: picture ? String(picture) : null,
      studentId: studentId ? String(studentId).trim() : null,
      department: department ? String(department).trim() : null,
      phone: phone ? String(phone).trim() : null,
      bio: bio ? String(bio).trim() : null
    });

    return res.status(201).json({
      message: 'User berhasil dibuat.',
      user: toPublicUser(newUser)
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/users/profile - Get current user profile
usersRouter.get('/profile', requireAuth(), async (req, res, next) => {
  try {
    const userId = req.auth.user.id;
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/users/profile - Update current user profile
usersRouter.put('/profile', requireAuth(), async (req, res, next) => {
  try {
    const userId = req.auth.user.id;
    const currentUser = await findUserById(userId);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const requestor = req.auth.rawUser;
    const { name, email, role, picture, studentId, department, phone, bio } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Nama tidak boleh kosong' });
    }

    // Validate role value if provided
    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ 
        message: 'Role tidak valid.' 
      });
    }

    // Prepare updated user data
    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      updatedAt: new Date().toISOString()
    };

    // Update optional fields if provided
    if (email !== undefined && email !== currentUser.email) {
      updatedUser.email = email.trim();
    }
    
    if (role !== undefined) {
      if (!canChangeRole(requestor)) {
        return res.status(403).json({ message: 'Hanya admin yang dapat mengubah role akun.' });
      }
      await ensureAdminCountAfterChange(currentUser.id, role);
      updatedUser.role = role;
    }
    
    if (picture !== undefined) {
      updatedUser.picture = picture;
    }
    
    if (studentId !== undefined) {
      updatedUser.studentId = studentId.trim();
    }
    
    if (department !== undefined) {
      updatedUser.department = department.trim();
    }
    
    if (phone !== undefined) {
      updatedUser.phone = phone.trim();
    }
    
    if (bio !== undefined) {
      updatedUser.bio = bio.trim();
    }

    // Save to database
    await upsertUser(updatedUser);

    return res.json({ 
      message: 'Profile berhasil diperbarui',
      user: toPublicUser(updatedUser) 
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/users/:id - Get user by ID (admin only)
usersRouter.get('/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/users/:id - Update any user (admin only)
usersRouter.put('/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const currentUser = req.auth.rawUser;

    const targetUser = await findUserById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const { name, email, role, password, picture, studentId, department, phone, bio } = req.body || {};

    // Validate input
    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ message: 'Nama tidak boleh kosong' });
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ 
        message: 'Role tidak valid.' 
      });
    }

    // Prepare updated user data
    const updatedUser = {
      ...targetUser,
      updatedAt: new Date().toISOString()
    };

    if (name) updatedUser.name = name.trim();
    if (email) updatedUser.email = email.trim();
    if (role) {
      await ensureAdminCountAfterChange(targetUser.id, role);
      updatedUser.role = role;
    }
    if (picture !== undefined) updatedUser.picture = picture;
    if (studentId !== undefined) updatedUser.studentId = studentId ? String(studentId).trim() : null;
    if (department !== undefined) updatedUser.department = department ? String(department).trim() : null;
    if (phone !== undefined) updatedUser.phone = phone ? String(phone).trim() : null;
    if (bio !== undefined) updatedUser.bio = bio ? String(bio).trim() : null;

    if (password) {
      updatedUser.passwordHash = await bcrypt.hash(String(password), 10);
    } else {
      updatedUser.passwordHash = targetUser.passwordHash || null;
    }

    // Save to database
    await upsertUser(updatedUser);

    return res.json({ 
      message: 'User berhasil diperbarui',
      user: toPublicUser(updatedUser) 
    });
  } catch (err) {
    if (err.message === 'Tidak dapat menghapus admin terakhir.') {
      return res.status(400).json({ message: err.message });
    }
    return next(err);
  }
});

// DELETE /api/users/:id - Delete user (admin only)
usersRouter.delete('/:id', requireAuth('admin'), async (req, res, next) => {
  try {
    const targetUser = await findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (targetUser.id === req.auth.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun Anda sendiri.' });
    }

    await ensureAdminCountAfterChange(targetUser.id, 'student');
    const success = await deleteUser(targetUser.id);
    if (!success) {
      return res.status(500).json({ message: 'Gagal menghapus user.' });
    }

    return res.json({
      message: 'User berhasil dihapus.'
    });
  } catch (err) {
    if (err.message === 'Tidak dapat menghapus admin terakhir.') {
      return res.status(400).json({ message: err.message });
    }
    return next(err);
  }
});
