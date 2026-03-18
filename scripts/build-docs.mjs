import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const rootDir = process.cwd();
const docsDir = join(rootDir, 'docs');

if (!existsSync(docsDir)) {
  console.log('Docs source folder not found at ./docs. Skipping docs build.');
  process.exit(0);
}

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const npmInstall = spawnSync(npmCmd, ['install'], {
  cwd: docsDir,
  stdio: 'inherit',
});

if (npmInstall.status !== 0) {
  process.exit(npmInstall.status ?? 1);
}

const nextBuild = spawnSync(npxCmd, ['next', 'build'], {
  cwd: docsDir,
  stdio: 'inherit',
});

process.exit(nextBuild.status ?? 1);
