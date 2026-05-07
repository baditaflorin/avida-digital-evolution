import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const source = join(root, 'wasm', 'avida_core.cpp');
const outputDir = join(root, 'public', 'wasm');
const output = join(outputDir, 'avida_core.wasm');
const clangCandidates = [
  process.env.CLANGXX,
  '/opt/homebrew/opt/llvm/bin/clang++',
  '/usr/local/opt/llvm/bin/clang++',
  'clang++',
].filter(Boolean);
const wasmLdCandidates = [
  process.env.WASM_LD,
  '/opt/homebrew/bin/wasm-ld',
  '/usr/local/bin/wasm-ld',
  'wasm-ld',
].filter(Boolean);

const findRunnable = (candidates, versionArgs) => {
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, versionArgs, { stdio: 'ignore' });
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
};

const clang = findRunnable(clangCandidates, ['--version']);
const wasmLd = findRunnable(wasmLdCandidates, ['--version']);

mkdirSync(outputDir, { recursive: true });

if (!existsSync(source)) {
  throw new Error(`Missing WASM source: ${source}`);
}

if (!clang || !wasmLd) {
  const committedFallback = join(root, 'vendor', 'wasm', 'avida_core.wasm');
  if (existsSync(committedFallback)) {
    copyFileSync(committedFallback, output);
    console.warn('LLVM wasm toolchain unavailable; copied committed fallback WASM.');
    process.exit(0);
  }
  throw new Error('LLVM clang++ and wasm-ld are required to build wasm/avida_core.cpp.');
}

execFileSync(
  clang,
  [
    '--target=wasm32',
    '-std=c++20',
    '-O3',
    '-flto',
    '-fno-exceptions',
    '-fno-rtti',
    '-nostdlib',
    `-fuse-ld=${wasmLd}`,
    '-Wl,--no-entry',
    '-Wl,--export=reset',
    '-Wl,--export=step',
    '-Wl,--export=get_width',
    '-Wl,--export=get_height',
    '-Wl,--export=get_cells_ptr',
    '-Wl,--export=get_stats_ptr',
    '-Wl,--export=get_events_ptr',
    '-Wl,--export=get_event_count',
    '-Wl,--export-memory',
    '-Wl,--initial-memory=262144',
    '-Wl,--max-memory=262144',
    '-Wl,--strip-all',
    '-o',
    output,
    source,
  ],
  { stdio: 'inherit' },
);

console.log(`Built ${output}`);
