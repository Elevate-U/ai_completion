// @ts-check
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import jestPlugin from 'eslint-plugin-jest';

export default [
  {
    // Global ignores
    ignores: ['**/node_modules/**', '**/.venv/**', 'dist/**'],
  },

  // --- Specific File Configurations FIRST ---

  // Config for ROOT CJS files (Gruntfile, postcss, stylelintrc, css-order)
  {
    files: [
      'Gruntfile.cjs',
      'postcss.config.js',
      '.stylelintrc.cjs',
      'css-property-order.cjs',
      // REMOVED jest.config.js
    ],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'warn',
      eqeqeq: 'error',
      ...prettierConfig.rules,
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    },
  },

  // Config for TEST files (Jest + Node env, ES Modules)
  {
    files: ['**/*.test.js'],
    ...jestPlugin.configs['flat/recommended'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
      sourceType: 'module', // Tests are likely ESM
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'no-console': 'off',
      ...prettierConfig.rules,
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    },
  },

  // --- Broader Configurations LAST ---

  // Config for website BROWSER JS files (ES Modules)
  {
    files: ['website/js/**/*.js'],
    ignores: ['**/*.test.js', 'website/local-dev-server.js'], // Keep ignoring server here
    languageOptions: {
      globals: {
        ...globals.browser,
        mermaid: 'readonly',
        Chart: 'readonly',
        aiToolsData: 'writable',
        initCategoriesPage: 'readonly',
        initComparisonPage: 'readonly',
      },
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      eqeqeq: 'error',
      ...prettierConfig.rules,
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    },
  },

  // Base recommended rules (applied broadly, potentially overridden by specifics above)
  // Includes rules for root-level ESM files like jest.config.js, eslint.config.js
  // and also website/local-dev-server.js (which uses Node globals but is ESM)
  eslint.configs.recommended,
  {
    // Apply Node globals for any remaining JS files (like local-dev-server.js)
    files: ['**/*.js'], // Apply broadly but will be overridden for browser/test/root CJS
    ignores: [
      'website/js/**/*.js',
      '**/*.test.js',
      'eslint.config.js',
      'jest.config.js',
    ], // Avoid re-applying to browser/test/configs
    languageOptions: {
      globals: { ...globals.node }, // Add Node globals
      // sourceType defaults to 'module' due to package.json
    },
    rules: {
      'no-console': 'off', // Allow console in Node scripts like the server
    },
  },

  // Apply prettier formatting broadly as a final step
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    },
  },
];
