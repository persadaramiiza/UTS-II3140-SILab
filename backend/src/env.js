import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load .env from parent directory (project root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('Warning: Could not load .env file:', result.error.message);
} else {
  console.log(`[ENV] Loaded ${Object.keys(result.parsed || {}).length} environment variables from ${envPath}`);
}

// Debug: Log Google OAuth config
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('[ENV] WARNING: GOOGLE_CLIENT_ID not found in environment');
} else {
  console.log('[ENV] Google Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
}
