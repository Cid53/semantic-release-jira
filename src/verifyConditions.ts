import { isString, isEmpty, isArray } from "lodash";
import { Context } from "semantic-release";
import { Config, getConfig } from "./config";
import SemanticReleaseError from "@semantic-release/error";
import AggregateError from "aggregate-error";
const isNonEmptyString = (value: any) =>
  isString(value) && !isEmpty(value.trim());
const isArrayOfNonEmptyStrings = (value: any) =>
  isArray(value) && !isEmpty(value) && value.every(isNonEmptyString);

export enum ErrorCode {
  JiraUrl = "EINVALIDJIRAURL",
  AuthUser = "EINVALIDAUTHUSER",
  AuthToken = "EINVALIDAUTHTOKEN",
  AppName = "EINVALIDAPPNAME",
  Projects = "EINVALIDPROJECTS",
}

interface Validator {
  check: (value: any) => boolean;
  code: ErrorCode;
  message: (value: any) => string;
}

const VALIDATORS: Record<keyof Config, Validator> = {
  jiraUrl: {
    check: isNonEmptyString,
    code: ErrorCode.JiraUrl,
    message: (value) =>
      `Invalid option "jiraUrl". Must be a non-empty String. (Value: "${value}")`,
  },
  authUser: {
    check: isNonEmptyString,
    code: ErrorCode.AuthUser,
    message: (value) =>
      `Invalid option "authUser". Must be a non-empty String. (Value: "${value}")`,
  },
  authToken: {
    check: isNonEmptyString,
    code: ErrorCode.AuthToken,
    message: () =>
      `Invalid JIRA auth token. Environment variable JIRA_AUTH_TOKEN must be a non-empty String.`,
  },
  appName: {
    check: isNonEmptyString,
    code: ErrorCode.AppName,
    message: (value) =>
      `Invalid option "appName". Must be a non-empty String. (Value: "${value}")`,
  },
  projects: {
    check: isArrayOfNonEmptyStrings,
    code: ErrorCode.Projects,
    message: (value) =>
      `Invalid option "projects". Must be an array of non-empty strings. (Value: "${value}")`,
  },
};

export function verifyConditions(pluginConfig: Config, context: Context) {
  const config = getConfig(pluginConfig, context);
  const errors: Error[] = [];

  Object.entries(config).forEach(([option, value]) => {
    const validator = VALIDATORS[option as keyof Config];

    if (!validator.check(value)) {
      errors.push(
        new SemanticReleaseError(validator.message(value), validator.code)
      );
    }
  });

  if (errors.length > 0) {
    throw new AggregateError<SemanticReleaseError>(errors);
  }
}
