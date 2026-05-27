import { describe, expect, it } from "vitest";
import {
  assertAdminLoginAllowed,
  clearAdminLoginAttempts,
  recordAdminLoginFailure,
} from "./login-rate-limit";

describe("admin login rate limit", () => {
  const key = "test-ip-127.0.0.1";

  it("allows attempts below the limit", () => {
    clearAdminLoginAttempts(key);

    for (let attempt = 0; attempt < 4; attempt++) {
      assertAdminLoginAllowed(key);
      recordAdminLoginFailure(key);
    }

    expect(() => assertAdminLoginAllowed(key)).not.toThrow();
  });

  it("blocks after five failed attempts", () => {
    clearAdminLoginAttempts(key);

    for (let attempt = 0; attempt < 5; attempt++) {
      assertAdminLoginAllowed(key);
      recordAdminLoginFailure(key);
    }

    expect(() => assertAdminLoginAllowed(key)).toThrow(
      "Too many login attempts. Please try again later."
    );
  });

  it("clears attempts after a successful login", () => {
    clearAdminLoginAttempts(key);

    for (let attempt = 0; attempt < 5; attempt++) {
      recordAdminLoginFailure(key);
    }

    clearAdminLoginAttempts(key);
    expect(() => assertAdminLoginAllowed(key)).not.toThrow();
  });
});
