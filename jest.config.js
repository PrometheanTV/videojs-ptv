module.exports = {
  roots: ['<rootDir>/test-e2e'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  preset: 'jest-puppeteer'
};
