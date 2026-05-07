import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import packageJson from '../package.json' with { type: 'json' };

const info = {
  version: packageJson.version,
  commit: 'runtime-main',
  fullCommit: 'runtime-main',
  builtAt: 'static',
  repository: 'https://github.com/baditaflorin/avida-digital-evolution',
  paypalUrl: 'https://www.paypal.com/paypalme/florinbadita',
  pagesUrl: 'https://baditaflorin.github.io/avida-digital-evolution/',
};

mkdirSync(join(process.cwd(), 'public'), { recursive: true });

writeFileSync(join(process.cwd(), 'public/build-info.json'), `${JSON.stringify(info, null, 2)}\n`);
