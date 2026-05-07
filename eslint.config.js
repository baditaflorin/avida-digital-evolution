import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'docs/assets/**',
      'docs/wasm/**',
      'docs/*.js',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', '*.config.ts'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        WebAssembly: 'readonly',
        WebGLRenderingContext: 'readonly',
        GPUBufferUsage: 'readonly',
        Worker: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.js', '*.config.cjs', 'public/sw.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Promise: 'readonly',
        module: 'readonly',
      },
    },
  },
);
