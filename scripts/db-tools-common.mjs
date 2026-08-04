import { existsSync, readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

export function arg(name) {
  const exact = process.argv.indexOf(name);
  if (exact >= 0) return process.argv[exact + 1];
  const prefix = `${name}=`;
  return process.argv
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}
export function flag(name) {
  return process.argv.includes(name);
}
export function loadDatabase() {
  let raw = process.env.DATABASE_URL;
  if (!raw && existsSync('apps/api/.env')) {
    const line = readFileSync('apps/api/.env', 'utf8')
      .split(/\r?\n/)
      .find((v) => v.startsWith('DATABASE_URL='));
    raw = line?.slice('DATABASE_URL='.length).replace(/^['"]|['"]$/g, '');
  }
  if (!raw)
    throw new Error('DATABASE_URL is required in environment or apps/api/.env');
  const url = new URL(raw);
  return {
    database: url.pathname.slice(1),
    user: decodeURIComponent(url.username),
  };
}
export function command(executable, args) {
  const result = spawnSync(executable, args, {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return result.status === 0 ? String(result.stdout || '').trim() : '';
}
export function docker(args, { capture = true } = {}) {
  const result = spawnSync('docker', args, {
    encoding: capture ? 'utf8' : undefined,
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.status !== 0)
    throw new Error(
      `Docker command failed: ${String(result.stderr || '').trim()}`,
    );
  return String(result.stdout || '').trim();
}
export function dockerStream(args, output) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let error = '',
      childDone = false,
      outputDone = false,
      failed = false;
    const finish = () => {
      if (!failed && childDone && outputDone) resolve();
    };
    child.stderr.on('data', (chunk) => {
      error += String(chunk);
    });
    child.stdout.pipe(output);
    output.on('finish', () => {
      outputDone = true;
      finish();
    });
    output.on('error', (cause) => {
      failed = true;
      reject(cause);
    });
    child.on('error', (cause) => {
      failed = true;
      reject(cause);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        failed = true;
        reject(new Error(`Docker command failed: ${error.trim()}`));
        return;
      }
      childDone = true;
      finish();
    });
  });
}
export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}
export const container = () =>
  process.env.POSTGRES_CONTAINER || 'borska-farmica-postgres';
