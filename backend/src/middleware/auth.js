import { resolveUserFromToken, toPublicUser } from '../services/authService.js';

export async function authenticateRequest(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  console.log('[Auth] authenticateRequest - Authorization header:', header ? `${header.substring(0, 30)}...` : 'MISSING');
  console.log('[Auth] authenticateRequest - Extracted token:', token ? `${token.substring(0, 20)}...` : 'NONE');

  if (!token) {
    req.auth = { user: null, rawUser: null, payload: null };
    return next();
  }

  const resolved = await resolveUserFromToken(token);
  
  console.log('[Auth] authenticateRequest - Token resolved:', resolved ? 'SUCCESS' : 'FAILED');
  
  if (!resolved) {
    req.auth = { user: null, rawUser: null, payload: null };
    return next();
  }

  req.auth = {
    user: toPublicUser(resolved.user),
    rawUser: resolved.user,
    payload: resolved.payload,
    token
  };
  
  console.log('[Auth] authenticateRequest - User authenticated:', resolved.user.name);
  
  return next();
}

export function requireAuth(...roles) {
  return (req, res, next) => {
    const auth = req.auth || {};
    
    // Debug log
    console.log('[Auth] requireAuth check:', {
      hasUser: !!auth.rawUser,
      userId: auth.rawUser?.id,
      role: auth.rawUser?.role,
      requiredRoles: roles
    });
    
    if (!auth.rawUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (roles.length && !roles.includes(auth.rawUser.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
