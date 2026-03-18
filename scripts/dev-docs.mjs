import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const rootDir = process.cwd();
const docsDir = join(rootDir, 'docs');

if (!existsSync(docsDir)) {
  console.log('Docs source folder not found at ./docs. Skipping docs dev server.');
  process.exit(0);
}

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const nextDev = spawnSync(npxCmd, ['next', 'dev', '-p', '3001'], {
  cwd: docsDir,
  stdio: 'inherit',
});

process.exit(nextDev.status ?? 1);
