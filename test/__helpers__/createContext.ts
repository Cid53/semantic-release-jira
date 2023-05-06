import { Context } from "semantic-release";

export default function createContext(overwrite: Partial<Context> = {}) {
  const context = {
    commits: [],
    env: {},
    lastRelease: undefined,
    logger: {
      await: jest.fn(),
      complete: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
      fav: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      note: jest.fn(),
      pause: jest.fn(),
      pending: jest.fn(),
      star: jest.fn(),
      start: jest.fn(),
      success: jest.fn(),
      wait: jest.fn(),
      warn: jest.fn(),
      watch: jest.fn(),
    },
    nextRelease: undefined,
    ...overwrite,
  };

  return context as unknown as Context;
}

export const contextWithAuth = createContext({
  env: { JIRA_AUTH_TOKEN: "1234" },
});
