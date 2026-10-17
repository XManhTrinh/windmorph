import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Library layers (architecture §3). Dependencies only point downward:
 * tokens → utils → theme / motion → primitives → components → composites.
 * `shapes` (the androidx.graphics.shapes port) is pure geometry and imports nothing.
 * Composites are built from public components only, never from primitives.
 */
const layers = [
  { type: 'tokens', pattern: 'packages/react/src/tokens' },
  { type: 'utils', pattern: 'packages/react/src/utils' },
  { type: 'theme', pattern: 'packages/react/src/theme' },
  { type: 'motion', pattern: 'packages/react/src/motion' },
  { type: 'shapes', pattern: 'packages/react/src/shapes' },
  { type: 'primitives', pattern: 'packages/react/src/primitives' },
  { type: 'components', pattern: 'packages/react/src/components' },
  { type: 'composites', pattern: 'packages/react/src/composites' },
  { type: 'next', pattern: 'packages/react/src/next' },
];

const allow = (from, to) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: { anyOf: to } } } },
});

/**
 * Tailwind's default type utilities. The docs site uses only the M3 type scale
 * (`text-body-large`, `text-title-medium-emphasized`, …) and `font-brand` / `font-plain`, as
 * consumers should, so these are rejected in its class strings. The library itself may set
 * exact Compose values inside its component styles.
 */
const DEFAULT_TYPE_UTILITY = String.raw`(^|\s|:)(text-(xs|sm|base|lg|xl|[2-9]xl)|text-\[[0-9]|font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|font-\[[0-9]|leading-|tracking-)`;
const TYPE_SCALE_MESSAGE =
  'Use an M3 type-scale role (text-body-large, text-title-medium-emphasized, …) and font-brand / font-plain, not Tailwind type utilities.';
const typeScaleSelectors = [
  'JSXAttribute[name.name=/^class(Name|Names)?$/]',
  'CallExpression[callee.name="tv"]',
].flatMap((scope) => [
  { selector: `${scope} Literal[value=/${DEFAULT_TYPE_UTILITY}/]`, message: TYPE_SCALE_MESSAGE },
  {
    selector: `${scope} TemplateElement[value.raw=/${DEFAULT_TYPE_UTILITY}/]`,
    message: TYPE_SCALE_MESSAGE,
  },
]);

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.next-e2e/**',
      '**/out/**',
      '**/storybook-static/**',
      '**/generated/**',
      '**/.generated/**',
      '**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['**/*.tsx', '**/use-*.ts', '**/context.ts'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['packages/react/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@windmorph/react-pro', '@windmorph/react-pro/*'],
              message: 'The core never depends on Windmorph Pro.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/react/src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': layers,
      'import/resolver': { typescript: { project: 'packages/react/tsconfig.json' } },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            allow('tokens', ['tokens']),
            allow('utils', ['tokens', 'utils']),
            allow('theme', ['tokens', 'utils', 'theme']),
            allow('motion', ['tokens', 'theme', 'motion']),
            allow('shapes', ['shapes']),
            allow('primitives', ['tokens', 'utils', 'theme', 'motion', 'shapes', 'primitives']),
            allow('components', [
              'tokens',
              'utils',
              'theme',
              'motion',
              'shapes',
              'primitives',
              'components',
            ]),
            allow('composites', ['tokens', 'utils', 'theme', 'motion', 'components', 'composites']),
            allow('next', ['tokens', 'utils', 'theme', 'next']),
          ],
        },
      ],
    },
  },
  {
    // The docs site is built only with Windmorph, core and Pro ("Only our components"). Allow the bare
    // entry and the approved subpaths; block every other @windmorph/react subpath and the
    // known third-party UI libraries and docs themes.
    files: ['apps/site/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...typeScaleSelectors],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@windmorph/react/*',
                '!@windmorph/react/next',
                '!@windmorph/react/styles.css',
                '@windmorph/react-pro/*',
                '!@windmorph/react-pro/rich-text',
                '!@windmorph/react-pro/styles.css',
              ],
              message:
                'apps/site may import UI only from @windmorph/react, @windmorph/react/next, @windmorph/react-pro or @windmorph/react-pro/rich-text.',
            },
            {
              group: [
                '@radix-ui/*',
                '@headlessui/react',
                'shadcn',
                'shadcn/*',
                'nextra',
                'nextra/*',
                'fumadocs-*',
                'fumadocs',
                '@chakra-ui/*',
                'antd',
                'antd/*',
                '@mantine/*',
              ],
              message:
                'apps/site is built only with @windmorph/react components (plan: "Only our components").',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
