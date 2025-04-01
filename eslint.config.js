// @ts-check
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['**/node_modules/**', '**/.venv/**'],
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        history: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Third-party globals
        mermaid: 'readonly',
        Chart: 'readonly',
        // Project-specific globals
        aiToolsData: 'writable',
        initCategoriesPage: 'readonly',
        initComparisonPage: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
      'no-empty': 'warn',
      'no-unused-vars': 'error', // Error on unused variables
      'no-console': 'warn', // Warn about console logs
      eqeqeq: 'error', // Enforce strict equality (===)
    },
  },
];
