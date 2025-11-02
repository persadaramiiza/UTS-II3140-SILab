import { OAuth2Client } from 'google-auth-library';
import { config } from '../config.js';

const client = new OAuth2Client(config.googleClientId);

/**
 * Verify Google ID token and extract user info
 * @param {string} idToken - Google ID token from frontend
 * @returns {Promise<{email: string, name: string, picture: string, sub: string}>}
 */
export async function verifyGoogleToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
}

/**
 * Generate OAuth URL for Google Sign-In
 * @param {string} redirectUri - URL to redirect after authentication
 * @returns {string} Authorization URL
 */
export function getGoogleAuthUrl(redirectUri) {
  const oauth2Client = new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    redirectUri
  );

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from Google
 * @param {string} redirectUri - Redirect URI used in the request
 * @returns {Promise<{tokens: any, userInfo: any}>}
 */
export async function exchangeCodeForTokens(code, redirectUri) {
  const oauth2Client = new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    redirectUri
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Verify the ID token
  const userInfo = await verifyGoogleToken(tokens.id_token);

  return { tokens, userInfo };
}
