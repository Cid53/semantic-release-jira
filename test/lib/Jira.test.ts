import Jira, {
  CreateVersionResponse,
  GetProjectResponse,
} from "../../src/lib/Jira";
import fetch from "node-fetch";

jest.mock("node-fetch");
const { Response } = jest.requireActual("node-fetch");

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

const jiraUrl = "http://localhost";
const jira = new Jira(jiraUrl, "user", "token");

describe("Jira", function () {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  describe("request", function () {
    it("should add auth header", async function () {
      mockedFetch.mockResolvedValueOnce(new Response());

      await jira.request(`/foo`);

      expect(mockedFetch).toHaveBeenCalled();
      expect(mockedFetch.mock.calls[0][1]?.headers).toHaveProperty(
        "Authorization"
      );
    });

    it("should throw error by response status", async function () {
      mockedFetch.mockResolvedValueOnce(new Response("", { status: 400 }));

      await expect(jira.request(`/foo`)).rejects.toThrow();
    });
  });

  describe("getProject", function () {
    it("should fetch project by a projectKey", async function () {
      const projectKey = "ABC";
      const projectResponse: GetProjectResponse = {
        id: "123",
      };
      mockedFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(projectResponse))
      );

      const project = await jira.getProject(projectKey);

      expect(mockedFetch).toHaveBeenCalled();
      expect(mockedFetch.mock.calls[0][0]).toContain(projectKey);
      expect(project).toEqual(projectResponse);
    });
  });

  describe("addVersionToTicket", function () {
    it("should add version to ticket", async function () {
      const versionId = "123";
      const ticketName = "ABC-456";

      mockedFetch.mockResolvedValueOnce(new Response("", { status: 204 }));

      const response = await jira.addVersionToTicket(versionId, ticketName);

      expect(mockedFetch).toHaveBeenCalled();
      expect(mockedFetch.mock.calls[0][0]).toContain(ticketName);
      expect(mockedFetch.mock.calls[0][1]?.body).toContain(versionId);
      expect(mockedFetch.mock.calls[0][1]?.method).toBe("PUT");
      expect(response).toEqual(true);
    });
  });

  describe("createVersion", function () {
    it("should create version for project", async function () {
      const projectId = "456";
      const versionName = "my-app:1.2.3";

      const versionResponse: CreateVersionResponse = {
        name: versionName,
        projectId: projectId,
        id: "678",
        self: "foo",
      };

      mockedFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(versionResponse))
      );

      const response = await jira.createVersion(projectId, versionName);

      expect(mockedFetch).toHaveBeenCalled();
      expect(mockedFetch.mock.calls[0][1]?.method).toBe("POST");
      expect(mockedFetch.mock.calls[0][1]?.body).toContain(versionName);
      expect(mockedFetch.mock.calls[0][1]?.body).toContain(projectId);
      expect(mockedFetch.mock.calls[0][1]?.body).toContain("releaseDate");
      expect(response).toEqual(versionResponse);
    });
  });
});
