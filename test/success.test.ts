import {
  addVersionToTickets,
  createVersions,
  detectTickets,
  Version,
} from "../src/success";
import createContext from "./__helpers__/createContext";
import commits from "./__fixtures__/commits.json";
import Jira from "../src/lib/Jira";
import { Context } from "semantic-release";
import { success } from "../src";
import createConfig from "./__helpers__/createConfig";

jest.mock("../src/lib/Jira");

const mockedJira = Jira as jest.MockedClass<typeof Jira>;

describe("success", function () {
  beforeEach(() => {
    mockedJira.mockReset();
  });

  it("should run on an empty state", async function () {
    const context = createContext();
    const logError = jest.spyOn(context.logger, "error");

    await success(createConfig(), context);

    expect(logError).not.toHaveBeenCalled();
  });

  it("should not throw on errors", async function () {
    const error = new Error("Test Error");
    mockedJira.mockImplementation(() => {
      throw error;
    });

    const context = createContext();
    const logError = jest.spyOn(context.logger, "error");

    await expect(success(createConfig(), context)).resolves.not.toThrow();
    expect(logError).toHaveBeenCalled();
    expect(logError.mock.calls[0][1]).toBe(error);
  });

  describe("detectTickets", function () {
    it("should detect tickets for supported projects", function () {
      const context = createContext({ commits: commits.withTickets });
      const tickets = detectTickets({ projects: ["ABC", "DEF"] }, context);

      expect(tickets).toHaveProperty("ABC");
      expect(tickets["ABC"]).toEqual(["ABC-123", "ABC-456"]);

      expect(tickets).toHaveProperty("DEF");
      expect(tickets["DEF"]).toEqual(["DEF-123"]);
    });

    it("should ignore tickets for unsupported projects", function () {
      const context = createContext({ commits: commits.withTickets });
      const tickets = detectTickets({ projects: ["DEF"] }, context);

      expect(tickets).not.toHaveProperty("ABC");
      expect(tickets).toHaveProperty("DEF");
    });
  });

  describe("createVersions", function () {
    const appName = "my-app";
    const version = "1.2.3";
    const versionId = "789";
    const versionName = `${appName}:${version}`;

    const projectKey = "ABC";
    const projectId = "0000";

    const versionResponse = {
      id: versionId,
      name: versionName,
      projectId: projectId,
      self: "",
    };

    it("should create a new version for a project", async function () {
      const jira = new mockedJira("", "", "");
      const getProjectMock = jest
        .spyOn(jira, "getProject")
        .mockResolvedValue({ id: projectId });
      const createVersionMock = jest
        .spyOn(jira, "createVersion")
        .mockResolvedValue(versionResponse);

      const tickets = {
        [projectKey]: ["ABC-123", "ABC-456"],
      };

      const createdVersions = await createVersions(
        jira,
        tickets,
        { appName },
        createContext({
          nextRelease: { version } as Context["nextRelease"],
        })
      );

      expect(createdVersions.length).toEqual(1);
      expect(createdVersions[0].version).toEqual(versionResponse);
      expect(createdVersions[0].tickets).toEqual(tickets[projectKey]);
      expect(getProjectMock).toHaveBeenCalledWith(projectKey);
      expect(createVersionMock).toHaveBeenCalledWith(projectId, versionName);
    });

    it("should create multiple versions for multiple projects", async function () {
      const jira = new mockedJira("", "", "");
      const getProjectMock = jest
        .spyOn(jira, "getProject")
        .mockResolvedValue({ id: "0000" });
      const createVersionMock = jest
        .spyOn(jira, "createVersion")
        .mockResolvedValue(versionResponse);

      const tickets = {
        ABC: ["ABC-123"],
        DEF: ["DEF-123"],
      };

      const createdVersions = await createVersions(
        jira,
        tickets,
        { appName },
        createContext({
          nextRelease: { version } as Context["nextRelease"],
        })
      );

      expect(createdVersions.length).toEqual(2);
      expect(createdVersions[0].tickets).toEqual(tickets.ABC);
      expect(createdVersions[1].tickets).toEqual(tickets.DEF);
      expect(createVersionMock).toHaveBeenCalledTimes(2);
      expect(getProjectMock.mock.calls[0][0]).toEqual("ABC");
      expect(getProjectMock.mock.calls[1][0]).toEqual("DEF");
    });
  });

  describe("addVersionToTickets", function () {
    it("should add version to tickets", async function () {
      const jira = new mockedJira("", "", "");
      const addVersionToTicket = jest
        .spyOn(jira, "addVersionToTicket")
        .mockResolvedValue(true);

      const versions: Version[] = [
        {
          version: {
            id: "0000",
            name: "my-app:1.2.3",
            projectId: "0000",
            self: "",
          },
          tickets: ["ABC-123", "ABC-456"],
        },
        {
          version: {
            id: "0001",
            name: "my-app:1.2.3",
            projectId: "0001",
            self: "",
          },
          tickets: ["DEF-123", "DEF-456"],
        },
      ];

      await addVersionToTickets(jira, versions, createContext());

      expect(addVersionToTicket).toHaveBeenCalledTimes(4);
      expect(addVersionToTicket.mock.calls[0][1]).toEqual("ABC-123");
      expect(addVersionToTicket.mock.calls[1][1]).toEqual("ABC-456");
      expect(addVersionToTicket.mock.calls[2][1]).toEqual("DEF-123");
      expect(addVersionToTicket.mock.calls[3][1]).toEqual("DEF-456");
    });
  });
});
