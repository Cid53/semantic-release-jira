import fetch, { RequestInit } from "node-fetch";
import { trim } from "lodash";

export interface CreateVersionResponse {
  id: string;
  self: string;
  name: string;
  projectId: string;
}

export interface GetProjectResponse {
  id: string;
}

export default class Jira {
  url: string;
  authToken: string;

  constructor(jiraUrl: string, authUser: string, authToken: string) {
    this.url = trim(jiraUrl, "/");
    this.authToken = Buffer.from(`${authUser}:${authToken}`).toString("base64");
  }

  async request(endpoint: string, options: RequestInit = { method: "GET" }) {
    const response = await fetch(`${this.url}/${trim(endpoint, "/")}`, {
      headers: {
        Authorization: `Basic ${this.authToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (response.status >= 400) {
      throw Error(
        `JIRA Request failed: (${options.method} ${endpoint}) ${response.statusText}`
      );
    }

    return response;
  }

  async createVersion(projectId: string, name: string) {
    const body = {
      name,
      projectId,
      releaseDate: new Date().toISOString(),
    };

    const response = await this.request("/rest/api/3/version", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return (await response.json()) as CreateVersionResponse;
  }

  async addVersionToTicket(versionId: string, ticketName: string) {
    const body = {
      update: {
        fixVersions: [{ add: { id: versionId } }],
      },
    };

    const response = await this.request(`/rest/api/3/issue/${ticketName}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return response.status === 204;
  }

  async getProject(projectKey: string) {
    const response = await this.request(`/rest/api/3/project/${projectKey}`);

    return (await response.json()) as GetProjectResponse;
  }
}
