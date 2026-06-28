import { describe, it, expect } from "vitest";

import { PLACEHOLDER } from "../optimizer";

// Day 1 smoke test: proves Vitest is wired up correctly.
// Real engine tests arrive on Day 2.
describe("optimizer (placeholder)", () => {
  it("exports a string placeholder", () => {
    expect(typeof PLACEHOLDER).toBe("string");
  });
});
