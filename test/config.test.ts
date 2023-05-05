import { getConfig } from "../src/config";
import { contextWithAuth, createContext } from "./_helpers/context";

const options = {
  appName: "my-app",
  authUser: "username",
  jiraUrl: "http://localhost",
  projects: ["ABC", "123"],
};

describe("config", () => {
  describe("getConfig", () => {
    it("should create a config object from options and context", function () {
      const config = getConfig(options, contextWithAuth);

      expect(config).toStrictEqual({ ...options, authToken: "1234" });
    });

    it("should use env var JIRA_AUTH_USER", function () {
      const config = getConfig(
        { ...options, authUser: "" },
        createContext({ env: { JIRA_AUTH_USER: "foo" } })
      );

      expect(config).toStrictEqual({
        ...options,
        authToken: undefined,
        authUser: "foo",
      });
    });

    it("should prefer set options over env vars", function () {
      const config = getConfig(
        options,
        createContext({ env: { JIRA_AUTH_USER: "foo" } })
      );

      expect(config).toStrictEqual({ ...options, authToken: undefined });
    });
  });
});
