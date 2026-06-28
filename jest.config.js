// jest.config.ts

export default {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    transform: {
        "^.+\\.tsx?$": ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.test.json',
        }],
    },
    moduleNameMapper: {
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
        '.*/config$': '<rootDir>/test/__mocks__/configMock.ts',
    },
}
