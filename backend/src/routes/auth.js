import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { authenticate, createToken, toPublicUser } from '../services/authService.js';
import { verifyGoogleToken } from '../services/googleAuthService.js';
import { findUserByEmail, upsertUser } from '../data/store.js';
import { v4 as uuid } from 'uuid';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }
    const user = await authenticate(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Kredensial tidak valid.' });
    }
    const token = createToken(user);
    return res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
});

authRouter.get('/me', requireAuth(), (req, res) => {
  res.json({ user: req.auth.user });
});

// Google OAuth Login
authRouter.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token diperlukan' });
    }

    if (!config.googleClientId) {
      return res.status(500).json({ message: 'Google OAuth belum dikonfigurasi' });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);

    // Check if user exists by email
    let user = await findUserByEmail(googleUser.email);

    // If user doesn't exist, create new user
    if (!user) {
      const newUser = {
        id: uuid(),
        role: googleUser.email.endsWith('@upi.edu') ? 'assistant' : 'student',
        username: googleUser.email.split('@')[0],
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        googleId: googleUser.googleId,
        emailVerified: googleUser.emailVerified,
        passwordHash: null, // Google users don't have password
        createdAt: new Date().toISOString(),
        authProvider: 'google'
      };

      user = await upsertUser(newUser);
    } else if (!user.googleId) {
      // Link existing user with Google account
      user.googleId = googleUser.googleId;
      user.picture = googleUser.picture;
      user.emailVerified = googleUser.emailVerified;
      user.email = googleUser.email;
      await upsertUser(user);
    }

    // Generate JWT (use 'sub' for user ID - JWT standard)
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      message: 'Login dengan Google berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    if (err.message === 'Invalid Google token') {
      return res.status(401).json({ message: 'Token Google tidak valid' });
    }
    next(err);
  }
});
