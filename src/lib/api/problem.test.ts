import { describe, expect, it } from "vitest";

import { problemFieldErrors, problemMessage } from "./problem";

describe("problemFieldErrors", () => {
  it("maps the API's property names to form fields, first message each", () => {
    const body = {
      status: 400,
      errors: {
        Email: ["'Email' is not a valid email address."],
        FirstName: ["'First Name' must not be empty.", "second"],
      },
    };
    expect(problemFieldErrors(body)).toEqual({
      email: "'Email' is not a valid email address.",
      firstName: "'First Name' must not be empty.",
    });
  });

  it("is empty for anything else", () => {
    expect(problemFieldErrors(undefined)).toEqual({});
    expect(problemFieldErrors("Bad request")).toEqual({});
  });
});

describe("problemMessage", () => {
  it("shows the API's explanation for client errors", () => {
    expect(problemMessage(401, { detail: "Invalid email or password." })).toBe(
      "Invalid email or password.",
    );
  });

  it("never shows server internals", () => {
    expect(problemMessage(500, { detail: "NpgsqlException: ..." })).toMatch(
      /our side/,
    );
  });

  it("explains rate limiting, which has no body", () => {
    expect(problemMessage(429, undefined)).toMatch(/Wait a minute/);
  });
});
