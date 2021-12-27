module.exports = {
  roots: ["<rootDir>/"], // NOTE Not `"<rootDir>/src"` - this is to include `test` folder, sibling to `src`
  testMatch: [
    "**/test/**/*.+(ts|tsx|js)",
    // "!**/test/shared/*.+(ts|tsx|js)",
    "!**/test/shared/(*.)+(spec|test).+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    // See https://github.com/aelbore/esbuild-jest#setting-up-jest-config-file-with-transformoptions
    "^.+\\.(ts|tsx)$": [
      "esbuild-jest",
      {
        // NOTE This is required for better debugging the tests
        sourcemap: "inline" /* Or `true` */,
      },
    ],
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 10,
    },
  },
};
