import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

function formatTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

async function main() {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  if (!projectRef) {
    console.error('❌  SUPABASE_PROJECT_REF environment variable is required for backups.');
    process.exit(1);
  }

  const backupDir = path.resolve(process.cwd(), 'backups');
  await mkdir(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `backup-${formatTimestamp()}.sql`);

  console.log(`🗄️  Creating Supabase backup for project ${projectRef}`);
  console.log(`📄  Output file: ${backupFile}`);

  const args = [
    'supabase',
    'db',
    'dump',
    '--project-ref',
    projectRef,
    '--schema',
    'public',
    '--data',
    '--file',
    backupFile
  ];

  const child = spawn('npx', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('✅  Supabase backup completed successfully.');
    } else {
      console.error(`❌  Supabase backup failed with exit code ${code}.`);
      process.exit(code || 1);
    }
  });
}

main().catch((err) => {
  console.error('❌  Unexpected backup error:', err);
  process.exit(1);
});
