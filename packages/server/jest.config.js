/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["constants.ts"],
    globalSetup: "./src/utils/testUtils/setupTests.ts"
};
