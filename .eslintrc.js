module.exports = {
	env: {
		commonjs: true,
		node: true,
		browser: true,
		es6: true,
		jest: true
	},
	settings: {
		react: {
			version: 'detect'
		}
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:prettier/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	overrides: [],
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
		'arrow-body-style': 'off',
		'prefer-arrow-callback': 'off',
		quotes: [
			'warn',
			'single',
			{
				avoidEscape: true
			}
		],
		'@typescript-eslint/no-unused-vars': [
			'off',
			{
				ignoreRestSiblings: true
			}
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'react-hooks/exhaustive-deps': 'warn',
		'react-hooks/rules-of-hooks': 'error',
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off'
	}
};
