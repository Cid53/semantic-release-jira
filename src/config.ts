import { Context } from "semantic-release";

export interface Config {
  appName: string;
  projects: string[];
  jiraUrl: string;
  authUser: string;
  authToken: string;
}

export function getConfig(
  { appName, authUser, jiraUrl, projects }: Omit<Config, "authToken">,
  { env }: Context
): Config {
  return {
    appName,
    projects,
    jiraUrl,
    authUser: authUser || env.JIRA_AUTH_USER,
    authToken: env.JIRA_AUTH_TOKEN,
  };
}
