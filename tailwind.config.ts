import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,html}', './docs/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
