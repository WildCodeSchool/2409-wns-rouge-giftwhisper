import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/tests/integration/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

export default config;
