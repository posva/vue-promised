module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/index.ts',
    // d.ts
    '<rootDir>/src/global.d.ts',
  ],
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  globals: {
    __DEV__: true,
    __BROWSER__: true,
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
  testURL: 'http://localhost/',
}
