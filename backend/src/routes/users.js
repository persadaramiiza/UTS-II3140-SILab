import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { findUserById, upsertUser } from '../data/store.js';

export const usersRouter = Router();

// GET /api/users/profile - Get current user profile
usersRouter.get('/profile', requireAuth(), async (req, res, next) => {
  try {
    const userId = req.auth.user.id;
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Return user without sensitive data
    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
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

    const { name, email, role, picture, studentId, department, phone, bio } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Nama tidak boleh kosong' });
    }

    // Validate role value if provided
    if (role && role !== 'student' && role !== 'assistant') {
      return res.status(400).json({ 
        message: 'Role harus "student" atau "assistant"' 
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
    
    // All users can change their own role
    if (role !== undefined) {
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

    // Return updated user without sensitive data
    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({ 
      message: 'Profile berhasil diperbarui',
      user: safeUser 
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/users/:id - Get user by ID (assistants only)
usersRouter.get('/:id', requireAuth(), async (req, res, next) => {
  try {
    const currentUser = req.auth.user;
    
    // Only assistants can view other users
    if (currentUser.role !== 'assistant') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya asisten yang dapat melihat data user lain.' 
      });
    }

    const user = await findUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/users/:id - Update any user (assistants only)
usersRouter.put('/:id', requireAuth(), async (req, res, next) => {
  try {
    const currentUser = req.auth.user;
    
    // Only assistants can update other users
    if (currentUser.role !== 'assistant') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya asisten yang dapat mengubah data user lain.' 
      });
    }

    const targetUser = await findUserById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const { name, email, role } = req.body;

    // Validate input
    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ message: 'Nama tidak boleh kosong' });
    }

    if (role && role !== 'student' && role !== 'assistant') {
      return res.status(400).json({ 
        message: 'Role harus "student" atau "assistant"' 
      });
    }

    // Prepare updated user data
    const updatedUser = {
      ...targetUser,
      updatedAt: new Date().toISOString()
    };

    if (name) updatedUser.name = name.trim();
    if (email) updatedUser.email = email.trim();
    if (role) updatedUser.role = role;

    // Save to database
    await upsertUser(updatedUser);

    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({ 
      message: 'User berhasil diperbarui',
      user: safeUser 
    });
  } catch (err) {
    return next(err);
  }
});
