module.exports = {
  roots: ["<rootDir>"],
  testMatch: ["<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>[/\\\\](node_modules|.next)[/\\\\]"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["jest-canvas-mock", "<rootDir>/tests/setup.ts"],
};
