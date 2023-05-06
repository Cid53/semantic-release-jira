import { Config } from "../../src/config";

export default function createConfig(overwrite: Partial<Config> = {}): Config {
  return {
    appName: "my-app",
    authToken: "1234",
    authUser: "username",
    jiraUrl: "http://localhost",
    projects: ["ABC", "123"],
    ...overwrite,
  };
}
