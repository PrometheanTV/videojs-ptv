module.exports = {
  roots: ['<rootDir>/test-int'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  preset: 'jest-puppeteer'
};
