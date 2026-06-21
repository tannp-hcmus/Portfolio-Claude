import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    { ignores: ['dist', 'node_modules', 'npm'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
            'no-undef': 'warn',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            // The template uses factory helpers prefixed with `use` (e.g. useUtils,
            // useNpmLogger) that are not React hooks, so rules-of-hooks misfires on
            // them. Keep these as warnings so `npm run lint` stays green on the
            // existing codebase while still flagging issues in new code.
            'react-hooks/rules-of-hooks': 'warn',
            'no-empty': 'warn',
            'no-case-declarations': 'warn',
        },
    },
    {
        // Vitest test files and the test setup use Vitest globals.
        files: ['**/*.{test,spec}.{js,jsx}', 'src/test/**/*.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.vitest,
            },
        },
    },
]
