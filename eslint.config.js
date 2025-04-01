// @ts-check
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals'; // Import the globals package

export default [
  {
    // Ignoring node_modules, virtual environments, and build output
    ignores: ['**/node_modules/**', '**/.venv/**', 'dist/**'],
  },

  // Base recommended rules + Prettier plugin setup (applied broadly)
  eslint.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules, // Apply prettier rules
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }], // Show prettier diffs as warnings
      'no-empty': 'warn', // Warn on empty blocks
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Error on unused vars unless they start with _
      'no-console': 'warn', // Warn about console logs
      eqeqeq: 'error', // Enforce strict equality (===)
    },
  },

  // Configuration for root-level JS/CJS files (CommonJS/Node environment)
  {
    files: ['*.js', '*.cjs'], // Target root .js and .cjs files
    languageOptions: {
      globals: {
        ...globals.node, // Use Node.js globals (includes module, require, process)
      },
      sourceType: 'commonjs', // Specify CommonJS module system
    },
    // Override rules specifically for config files if needed
    rules: {
      'no-unused-vars': 'off', // Often okay to have unused vars in configs
    },
  },

  // Configuration for website JS files (Browser environment)
  {
    files: ['website/js/**/*.js'], // Target JS files within website/js
    languageOptions: {
      globals: {
        ...globals.browser, // Use Browser globals (includes setTimeout, document, window, fetch etc.)
        // Add back any custom/third-party globals needed for website JS
        mermaid: 'readonly',
        Chart: 'readonly',
        aiToolsData: 'writable',
        initCategoriesPage: 'readonly',
        initComparisonPage: 'readonly',
        // Add other specific globals if needed
      },
      sourceType: 'module', // Assuming website JS uses ES Modules
    },
    // Override rules specifically for browser code if needed
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Keep unused var check active here
      // 'no-console': 'off', // Example: Allow console logs in browser code if desired
    },
  },
];
