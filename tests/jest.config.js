/** @type {import('jest').Config} */
const config = {
  verbose: true,
  preset: 'ts-jest',
  rootDir: '.',
  testRegex: 'e2e-spec.ts$',
  globalSetup: '<rootDir>/setup/setup.ts',
};

module.exports = config;
