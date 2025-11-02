import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findUserById, findUserByUsername } from '../data/store.js';

export function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function authenticate(username, password) {
  const user = await findUserByUsername(username);
  if (!user) return null;
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;
  return user;
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('[AuthService] Token verified successfully, sub:', decoded.sub);
    return decoded;
  } catch (err) {
    console.error('[AuthService] Token verification FAILED:', err.message);
    console.error('[AuthService] JWT_SECRET length:', config.jwtSecret?.length);
    return null;
  }
}

export async function resolveUserFromToken(token) {
  const payload = verifyToken(token);
  if (!payload?.sub) return null;
  const user = await findUserById(payload.sub);
  if (!user) return null;
  return { user, payload };
}
