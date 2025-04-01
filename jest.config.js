export default {
  testEnvironment: 'jest-environment-jsdom',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/tests-examples/'
  ]
}