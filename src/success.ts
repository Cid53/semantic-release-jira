import { Context } from "semantic-release";
import { Config, getConfig } from "./config";
import { groupBy, memoize } from "lodash";
import Jira, { CreateVersionResponse } from "./Jira";

interface Version {
  version: CreateVersionResponse;
  tickets: string[];
}

function detectTickets(
  { projects }: Pick<Config, "projects">,
  { commits, logger }: Pick<Context, "commits" | "logger">
) {
  const projectNames = projects.join("|");
  const ticketRegex = new RegExp(`((?:${projectNames})-\\d+)`, "gm");

  logger.log(`Searching for JIRA Tickets for projects: ${projects}`);

  // Collect JIRA tickets from commit messages
  const ticketSet = new Set<string>();
  commits?.forEach(({ message }) => {
    const matches = message.match(ticketRegex);

    if (matches) {
      matches.forEach((t) => ticketSet.add(t));
    }
  });

  const tickets = [...ticketSet];
  logger.log(`Detected JIRA Tickets: ${tickets}`);

  return groupBy(tickets, (ticketKey: string) => ticketKey.split("-")[0]);
}

async function createVersions(
  jira: Jira,
  groupedTickets: Record<string, string[]>,
  { appName }: Pick<Config, "appName">,
  { logger, nextRelease }: Context
) {
  const getProjectId = memoize(async (projectKey: string) => {
    return (await jira.getProject(projectKey)).id;
  });

  const createVersions = Object.entries(groupedTickets).map(
    async ([projectKey, tickets]) => {
      const versionName = `${appName}:${nextRelease!.version}`;
      const projectId = await getProjectId(projectKey);

      logger.log(
        `Creating JIRA version "${versionName}" for project "${projectKey}"`
      );
      return {
        tickets,
        version: await jira.createVersion(projectId, versionName),
      };
    }
  );

  return Promise.all(createVersions);
}

async function addVersionToTickets(
  jira: Jira,
  versions: Version[],
  { logger }: Pick<Context, "logger">
) {
  const addVersionToTickets: Promise<unknown>[] = [];
  versions.forEach(({ tickets, version }) => {
    tickets.map((ticketKey) => {
      logger.log(`Adding version "${version.name}" to ticket "${ticketKey}"`);

      addVersionToTickets.push(jira.addVersionToTicket(version.id, ticketKey));
    });
  });

  await Promise.all(addVersionToTickets);
}

export async function success(pluginConfig: Config, ctx: Context) {
  const config = getConfig(pluginConfig, ctx);
  const jira = new Jira(config.jiraUrl, config.authUser, config.authToken);

  const groupedTickets = detectTickets(config, ctx);
  const versions = await createVersions(jira, groupedTickets, config, ctx);
  await addVersionToTickets(jira, versions, ctx);
}
