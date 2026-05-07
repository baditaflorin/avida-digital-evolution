import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import packageJson from '../package.json' with { type: 'json' };

const run = (command, args) => {
  try {
    return execFileSync(command, args, { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

const commit = run('git', ['rev-parse', '--short=12', 'HEAD']);
const fullCommit = run('git', ['rev-parse', 'HEAD']);
const builtAt = new Date().toISOString();

const info = {
  version: packageJson.version,
  commit,
  fullCommit,
  builtAt,
  repository: 'https://github.com/baditaflorin/avida-digital-evolution',
  paypalUrl: 'https://www.paypal.com/paypalme/florinbadita',
  pagesUrl: 'https://baditaflorin.github.io/avida-digital-evolution/',
};

mkdirSync(join(process.cwd(), 'public'), { recursive: true });

writeFileSync(join(process.cwd(), 'public/build-info.json'), `${JSON.stringify(info, null, 2)}\n`);
