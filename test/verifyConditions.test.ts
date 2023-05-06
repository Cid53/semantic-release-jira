import { verifyConditions } from "../src";
import createContext, { contextWithAuth } from "./__helpers__/createContext";
import AggregateError from "aggregate-error";
import { ErrorCode } from "../src/verifyConditions";
import SemanticReleaseError from "@semantic-release/error";
import createConfig from "./__helpers__/createConfig";

const config = createConfig();

const catchErrors = (func: () => any) => {
  const errors: SemanticReleaseError[] = [];

  try {
    func();
  } catch (e) {
    errors.push(...(e as AggregateError<SemanticReleaseError>));
  }

  return errors;
};

describe("verifyConditions", () => {
  [
    ["appName", ErrorCode.AppName],
    ["authUser", ErrorCode.AuthUser],
    ["jiraUrl", ErrorCode.JiraUrl],
    ["projects", ErrorCode.Projects],
  ].forEach(([option, errorCode]) => {
    it(`should error if invalid ${option}`, async () => {
      const errorsUndefined = catchErrors(() =>
        verifyConditions({ ...config, [option]: undefined }, contextWithAuth)
      );

      const errorsEmptyString = catchErrors(() =>
        verifyConditions({ ...config, [option]: "" }, contextWithAuth)
      );

      const errors = [...errorsEmptyString, ...errorsUndefined];

      expect(errors.length).toBe(2);
      errors.forEach((error) => {
        expect(error.name).toBe("SemanticReleaseError");
        expect(error.code).toBe(errorCode);
      });
    });
  });

  it("should error if projects is not an array of non-empty strings", function () {
    const errorsEmptyArray = catchErrors(() =>
      verifyConditions({ ...config, projects: [] }, contextWithAuth)
    );

    const errorsEmptyStrings = catchErrors(() =>
      verifyConditions({ ...config, projects: ["", ""] }, contextWithAuth)
    );

    const errorsNonStrings = catchErrors(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      verifyConditions({ ...config, projects: [1] }, contextWithAuth)
    );

    const errors = [
      ...errorsEmptyArray,
      ...errorsEmptyStrings,
      ...errorsNonStrings,
    ];

    expect(errors.length).toBe(3);

    errors.forEach((error) => {
      expect(error.name).toBe("SemanticReleaseError");
      expect(error.code).toBe(ErrorCode.Projects);
    });
  });

  it("should error if JIRA_AUTH_TOKEN is not set", function () {
    const errors = catchErrors(() => verifyConditions(config, createContext()));

    expect(errors.length).toBe(1);
    expect(errors[0].name).toBe("SemanticReleaseError");
    expect(errors[0].code).toBe(ErrorCode.AuthToken);
  });

  it("should not error with correct config", () => {
    expect(() => verifyConditions(config, contextWithAuth)).not.toThrow();
  });
});
