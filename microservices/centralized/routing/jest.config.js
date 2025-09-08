module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/test"],
  moduleFileExtensions: ["js", "json", "ts"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  }
};