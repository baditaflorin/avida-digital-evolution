import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const generatedPaths = [
  'docs/assets',
  'docs/wasm',
  'docs/index.html',
  'docs/404.html',
  'docs/build-info.json',
  'docs/icon.svg',
  'docs/manifest.webmanifest',
  'docs/sw.js',
];

for (const path of generatedPaths) {
  const absolute = join(process.cwd(), path);
  if (existsSync(absolute)) {
    rmSync(absolute, { recursive: true, force: true });
  }
}
