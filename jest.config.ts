export default {
    preset: 'ts-jest',
    clearMocks: false,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['deno'],
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
