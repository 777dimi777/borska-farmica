import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  docker,
  dockerStream,
  command,
  arg,
  flag,
  loadDatabase,
  sha256,
  container,
} from './db-tools-common.mjs';

const requested = arg('--output');
if (!requested)
  throw new Error(
    'Usage: npm run db:backup -- --output=.local/backups/name.dump [--overwrite]',
  );
const output = resolve(requested),
  manifest = `${output}.json`;
if ((existsSync(output) || existsSync(manifest)) && !flag('--overwrite'))
  throw new Error(
    'Backup or manifest already exists; use --overwrite explicitly',
  );
mkdirSync(dirname(output), { recursive: true });
if (flag('--overwrite')) {
  if (existsSync(output)) unlinkSync(output);
  if (existsSync(manifest)) unlinkSync(manifest);
}
const db = loadDatabase(),
  stream = createWriteStream(output, { flags: 'wx' });
try {
  await dockerStream(
    ['exec', container(), 'pg_dump', '-U', db.user, '-d', db.database, '-Fc'],
    stream,
  );
} catch (error) {
  stream.destroy();
  if (existsSync(output)) unlinkSync(output);
  throw error;
}
const data = readFileSync(output);
if (data.length < 100) throw new Error('Backup is unexpectedly small');
const metadata = {
  createdAt: new Date().toISOString(),
  sha256: sha256(data),
  byteSize: data.length,
  database: db.database,
  appVersion: process.env.APP_VERSION || 'development',
  gitCommit:
    process.env.GIT_COMMIT_SHA ||
    command('git', ['rev-parse', 'HEAD']) ||
    'unknown',
  postgresVersion:
    docker(['exec', container(), 'postgres', '--version']) || 'unknown',
};
writeFileSync(manifest, `${JSON.stringify(metadata, null, 2)}\n`, {
  flag: 'wx',
});
process.stdout.write(
  `${JSON.stringify({ output, manifest, byteSize: data.length, sha256: metadata.sha256 })}\n`,
);
