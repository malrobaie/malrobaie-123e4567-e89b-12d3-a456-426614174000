// Get NX preset but we'll override the transform
const nxPreset = require('../jest.preset.js');

module.exports = {
  ...nxPreset,
  displayName: '@turbovets-task-manager/api',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  // CRITICAL: Override transform AFTER spreading preset to force ts-jest
  transform: {
    '^.+\\.(ts|js|html)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
};
