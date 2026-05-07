import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/avida-digital-evolution/',
  publicDir: 'public',
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          duckdb: ['@duckdb/duckdb-wasm'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    globals: true,
  },
});
