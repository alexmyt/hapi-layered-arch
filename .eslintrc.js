module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'import', 'prettier'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'airbnb-typescript/base',
        'prettier',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': ['warn'],
    'linebreak-style': ['error', 'unix'],
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/*.e2e-spec.js'] },
    ],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
      },
    ],
    'prettier/prettier': ['error'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
