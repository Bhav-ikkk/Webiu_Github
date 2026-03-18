import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const docsDir = join(rootDir, 'docs');

if (!existsSync(docsDir)) {
  console.log('Docs source folder not found at ./docs. Skipping docs sync into public/docs.');
  process.exit(0);
}

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const docsBuild = spawnSync(npmCmd, ['run', 'build:docs'], {
  cwd: rootDir,
  stdio: 'inherit',
});

if (docsBuild.status !== 0) {
  process.exit(docsBuild.status ?? 1);
}

const docsOutDir = join(docsDir, 'out');
if (!existsSync(docsOutDir)) {
  console.error('Docs build completed but docs/out was not found.');
  process.exit(1);
}

const publicDocsDir = join(rootDir, 'public', 'docs');
rmSync(publicDocsDir, { recursive: true, force: true });
cpSync(docsOutDir, publicDocsDir, { recursive: true });
console.log('Synced docs/out to public/docs.');
