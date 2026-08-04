import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  arg,
  container,
  docker,
  loadDatabase,
  sha256,
} from './db-tools-common.mjs';
const requested = arg('--file');
if (!requested)
  throw new Error(
    'Usage: npm run db:backup:verify -- --file=.local/backups/name.dump',
  );
const file = resolve(requested),
  manifest = `${file}.json`;
if (!existsSync(file) || !existsSync(manifest))
  throw new Error('Backup and checksum manifest are required');
const metadata = JSON.parse(readFileSync(manifest, 'utf8')),
  actual = sha256(readFileSync(file));
if (actual !== metadata.sha256) throw new Error('Backup checksum mismatch');
const source = loadDatabase(),
  prefix = 'borska_farmica_restore_test_',
  database = prefix + randomBytes(6).toString('hex');
if (!database.startsWith(prefix))
  throw new Error('Unsafe restore database name');
const remote = `/tmp/${database}-${basename(file).replace(/[^A-Za-z0-9_.-]/g, '_')}`;
let created = false;
try {
  docker(['exec', container(), 'createdb', '-U', source.user, database]);
  created = true;
  docker(['cp', file, `${container()}:${remote}`]);
  docker([
    'exec',
    container(),
    'pg_restore',
    '-U',
    source.user,
    '-d',
    database,
    '--exit-on-error',
    '--no-owner',
    remote,
  ]);
  const tables = Number(
    docker([
      'exec',
      container(),
      'psql',
      '-U',
      source.user,
      '-d',
      database,
      '-Atc',
      "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'",
    ]),
  );
  const migrations = Number(
    docker([
      'exec',
      container(),
      'psql',
      '-U',
      source.user,
      '-d',
      database,
      '-Atc',
      'SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL',
    ]),
  );
  if (tables < 10 || migrations < 1)
    throw new Error('Restored database integrity checks failed');
  process.stdout.write(
    `${JSON.stringify({ verified: true, database, tables, migrations, sha256: actual })}\n`,
  );
} finally {
  try {
    docker(['exec', container(), 'rm', '-f', remote]);
  } catch {}
  if (created) {
    if (!database.startsWith(prefix))
      throw new Error('Refusing unsafe cleanup');
    docker([
      'exec',
      container(),
      'dropdb',
      '-U',
      source.user,
      '--force',
      database,
    ]);
  }
}
