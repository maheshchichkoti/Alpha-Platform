/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require("path");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Use absolute path to ensure Windows compatibility
  setupFiles: [path.resolve(__dirname, "jest.setup.js")],

  // Updated testMatch pattern to match your exact structure
  testMatch: ["<rootDir>/tests/**/*.test.ts"],

  // Explicitly ignore node_modules
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Add verbose logging for debugging
  verbose: true,

  // Add this to ensure test files are found
  roots: ["<rootDir>/tests"],
};
