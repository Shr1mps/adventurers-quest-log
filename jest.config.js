export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^../../control/index.js$': '<rootDir>/tests/mocks/control/index.js',
    '^../../control/ui/ViewManager.js$': '<rootDir>/tests/mocks/control/ui/ViewManager.js',
    '^../../model/constants.js$': '<rootDir>/tests/mocks/model/constants.js',
    '^../control/index.js$': '<rootDir>/tests/mocks/control/index.js',
    '^../model/index.js$': '<rootDir>/tests/mocks/model/index.js',
    '^../view/index.js$': '<rootDir>/tests/mocks/view/index.js',
    '^../../view/internal/index.js$': '<rootDir>/tests/mocks/view/internal/index.js',
    '^../internal/index.js$': '<rootDir>/tests/mocks/view/internal/index.js',
    '^../internal/context-options.js$': '<rootDir>/tests/mocks/view/internal/context-options.js',
    '^./HandlerLog.js$': '<rootDir>/tests/mocks/view/HandlerLog.js',
    '^./constants.js$': '<rootDir>/tests/mocks/model/constants.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
