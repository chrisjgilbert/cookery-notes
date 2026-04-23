import { describe, expect, it } from "vitest";

import { cn, formatMinutes } from "./utils";

describe("formatMinutes", () => {
  it("returns null for null/undefined", () => {
    expect(formatMinutes(null)).toBeNull();
    expect(formatMinutes(undefined)).toBeNull();
  });

  it("formats minutes under 60", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });

  it("formats whole hours", () => {
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formats hours + minutes", () => {
    expect(formatMinutes(95)).toBe("1h 35m");
  });
});

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
  });
});
