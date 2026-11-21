import { describe, expect, it } from "vitest";

import { registerSchema, signInSchema, validate } from "./schemas";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  return data;
}

const valid = {
  firstName: " Ada ",
  lastName: "Lovelace",
  email: " ada@example.com ",
  password: "engine1843",
};

describe("registerSchema", () => {
  it("accepts a valid form and trims names and email", () => {
    expect(validate(registerSchema, form(valid)).data).toEqual({
      ...valid,
      firstName: "Ada",
      email: "ada@example.com",
    });
  });

  it("applies the API's password policy", () => {
    const check = (password: string) =>
      validate(registerSchema, form({ ...valid, password })).errors?.password;

    expect(check("short1")).toBe("Use at least 8 characters.");
    expect(check("onlyletters")).toBe("Include at least one digit.");
    expect(check("12345678")).toBe("Include at least one letter.");
    expect(check("x1".repeat(51))).toBe("Use 100 characters or fewer.");
  });

  it("reports one message per field", () => {
    const { errors } = validate(
      registerSchema,
      form({ firstName: "", lastName: "", email: "ada", password: "" }),
    );
    expect(errors).toEqual({
      firstName: "Enter your first name.",
      lastName: "Enter your last name.",
      email: "Enter a valid email address.",
      password: "Use at least 8 characters.",
    });
  });
});

describe("signInSchema", () => {
  it("does not hold existing passwords to the current policy", () => {
    expect(
      validate(signInSchema, form({ email: "a@b.co", password: "x" })).errors,
    ).toBeUndefined();
  });

  it("asks for both fields", () => {
    expect(
      validate(signInSchema, form({ email: " ", password: "" })).errors,
    ).toEqual({
      email: "Enter your email address.",
      password: "Enter your password.",
    });
  });
});
