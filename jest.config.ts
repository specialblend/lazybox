export default {
    preset: 'ts-jest',
    collectCoverageFrom: ['src/**/*.{js,ts}'],
    clearMocks: false,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    // globalSetup: './__mocks__/env.mock.ts',
};
