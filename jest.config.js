module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/*.js',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.(vue)$': 'vue-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/tests/*.js',
    '<rootDir>/tests/utils/MultipleChildrenHelper.vue',
    '<rootDir>/tests/.*.js',
    '<rootDir>/tests/*/*.js',
  ],
  testURL: 'http://localhost/',
}
