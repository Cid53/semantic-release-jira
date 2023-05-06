# semantic-release-jira
A Semantic Release plugin that assigns the release version to tickets belonging to the release.

| Step               | Description                                                                                                 |
|--------------------|-------------------------------------------------------------------------------------------------------------|
| `verifyConditions` | Verify proper config options                                                                                |
| `success`          | Detect tickets belonging to this release, create release version in JIRA, assign release version to tickets |

## Install

```bash
npm i -D 
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["semantic-release-jira", {
      "appName": "my-app",
      "jiraUrl": "https://<my-org>.atlassian.net",
      "projects": ["MYPROJ"]
    }]
  ]
}
```

## Configuration

### Environment Variables

| Name            | Description                                                                                       |
|-----------------|---------------------------------------------------------------------------------------------------|
| JIRA_AUTH_TOKEN | **Required**: Token used for JIRA authentication. See [JIRA Authentication](#jira-authentication) |
| JIRA_AUTH_USER  | User used for JIRA authentication. Can also be set in options.                                    |


### Options

| Option     | Description                                                                                                                         |
|------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `appName`  | Name that will be used to prefix version name in JIRA. Example: `my-app:1.2.3`                                                      |
| `jiraUrl`  | URL to your JIRA instance. Example: `https://<my-org>.atlassian.net`                                                                |
| `authUser` | User used for JIRA authentication. Example: `user@exmaple.com`                                                                      |
| `projects` | List of project keys to use for ticket detection. Example: `["MYPROJ"]` will only detect tickets belonging to the "MYPROJ" project. |

### JIRA Authentication

This plugin uses the JIRA REST API v3 and requires a user and token for basic authentication.

See [Basic auth for REST APIs](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/)