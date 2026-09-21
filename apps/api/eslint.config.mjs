// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import boundaries from "eslint-plugin-boundaries"
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: `${import.meta.dirname}/tsconfig.json`,
        },
      },
      'boundaries/root-path': import.meta.dirname,
      'boundaries/legacy-templates': false,
      'boundaries/elements': [
        {
          type: 'kernel',
          pattern: 'src/kernel',
          partialMatch: false
        },
        {
          type: "configuration",
          pattern: 'src/config',
          partialMatch: false
        },
        {
          type: 'infrastructure',
          pattern: 'src/infrastructure',
          partialMatch: false
        },
        {
          type: 'composition',
          pattern: 'src/composition',
          partialMatch: false
        },
        {
          type: 'bounded-context',
          pattern: 'src/modules/*',
          capture: ['context'],
          partialMatch: false
        },
      ],
    },
    rules: {
      ...boundaries.configs.recommended.rules,
  'boundaries/dependencies': [
    'error',
    {
      default: 'allow',
      policies: [
        {
          from: { element: { type: 'kernel' } },
          disallow: {
            to: { element: { type: 'bounded-context' } },
          },
        },
        {
          from: { element: { type: 'bounded-context' } },
          disallow: {
            to: {
              element: {
                type: 'bounded-context',
                captured: {
                  context: '!{{ from.element.captured.context }}',
                },
                fileInternalPath: '!public.ts'
              }
            }
          }
        }
      ],
    },
  ],
},
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
