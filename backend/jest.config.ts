import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/tests/unit/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

export default config;
