// @ts-check
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import jestPlugin from 'eslint-plugin-jest'; // Import Jest plugin

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
  // EXCLUDING eslint.config.js itself
  {
    files: ['*.js', '*.cjs'], // Target root .js and .cjs files
    ignores: ['eslint.config.js'], // Explicitly ignore eslint.config.js here
    languageOptions: {
      globals: {
        ...globals.node, // Use Node.js globals (includes module, require, process)
      },
      sourceType: 'commonjs', // Specify CommonJS module system
    },
    rules: {
       'no-unused-vars': 'off', // Often okay to have unused vars in configs
    }
  },

  // Configuration for website JS files (Browser environment)
  {
    files: ['website/js/**/*.js'], // Target JS files within website/js
    ignores: ['**/*.test.js'], // Exclude test files from this browser config
    languageOptions: {
      globals: {
        ...globals.browser, // Use Browser globals
        // Add back any custom/third-party globals needed for website JS
        mermaid: 'readonly',
        Chart: 'readonly',
        aiToolsData: 'writable',
        initCategoriesPage: 'readonly',
        initComparisonPage: 'readonly',
      },
      sourceType: 'module',
    },
    rules: {
       'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    }
  },

  // Configuration for website local dev server (Node environment)
  {
     files: ['website/local-dev-server.js'],
     languageOptions: {
        globals: {
           ...globals.node, // Use Node.js globals
        },
        sourceType: 'commonjs', // Assuming it's CommonJS
     },
     rules: {
        'no-console': 'off', // Allow console logs in dev server
        'no-unused-vars': 'off',
     }
  },

  // Configuration for Test files (Jest environment)
  {
    files: ['**/*.test.js'],
    ...jestPlugin.configs['flat/recommended'], // Apply Jest recommended rules
    languageOptions: {
      globals: {
        ...globals.jest, // Use Jest globals
      },
    },
    rules: {
      // Add/override any specific rules for tests
      'no-console': 'off', // Allow console logs in tests
    }
  },
];
