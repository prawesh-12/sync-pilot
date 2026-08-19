import { describe, expect, it } from "vitest";
import { findArray, findString, firstArray, readString } from "@/features/gmail/parse";

describe("readString", () => {
  it("returns the first key that holds a non-empty string", () => {
    expect(readString({ a: "", b: "found", c: "later" }, ["a", "b", "c"])).toBe(
      "found",
    );
  });

  it("trims the value it returns", () => {
    expect(readString({ subject: "  Q3 deck  " }, ["subject"])).toBe("Q3 deck");
  });

  it("skips a whitespace-only value", () => {
    expect(readString({ a: "   ", b: "real" }, ["a", "b"])).toBe("real");
  });

  it("skips non-string values", () => {
    expect(readString({ a: 42, b: null, c: "real" }, ["a", "b", "c"])).toBe("real");
  });

  it("returns an empty string when no key matches", () => {
    expect(readString({ a: "value" }, ["x", "y"])).toBe("");
  });

  it("respects the order of the keys, not the object", () => {
    expect(readString({ second: "b", first: "a" }, ["first", "second"])).toBe("a");
  });
});

describe("firstArray", () => {
  it("returns the first key holding an array", () => {
    expect(firstArray({ a: "no", b: [1, 2] }, ["a", "b"])).toEqual([1, 2]);
  });

  it("returns an empty array as a match", () => {
    expect(firstArray({ items: [] }, ["items"])).toEqual([]);
  });

  it("returns null when no key holds an array", () => {
    expect(firstArray({ a: "no" }, ["a", "b"])).toBeNull();
  });
});

describe("findString", () => {
  it("finds a value at the top level", () => {
    expect(findString({ subject: "Q3 deck" }, ["subject"])).toBe("Q3 deck");
  });

  it("finds a value nested several levels down", () => {
    const payload = { data: { response_data: { message: { subject: "Q3 deck" } } } };

    expect(findString(payload, ["subject"])).toBe("Q3 deck");
  });

  it("finds a value inside an array", () => {
    const payload = { data: [{ other: 1 }, { subject: "Q3 deck" }] };

    expect(findString(payload, ["subject"])).toBe("Q3 deck");
  });

  it("prefers a shallower match over a deeper one", () => {
    const payload = { subject: "top", data: { subject: "deep" } };

    expect(findString(payload, ["subject"])).toBe("top");
  });

  it("returns an empty string for a primitive", () => {
    expect(findString("just a string", ["subject"])).toBe("");
  });

  it("returns an empty string for null", () => {
    expect(findString(null, ["subject"])).toBe("");
  });

  it("returns an empty string when the key is absent everywhere", () => {
    expect(findString({ a: { b: { c: 1 } } }, ["subject"])).toBe("");
  });
});

describe("findArray", () => {
  it("finds an array at the top level", () => {
    expect(findArray({ labels: [{ id: "1" }] }, ["labels"])).toEqual([{ id: "1" }]);
  });

  it("finds an array nested several levels down", () => {
    const payload = { data: { response_data: { labels: ["INBOX"] } } };

    expect(findArray(payload, ["labels"])).toEqual(["INBOX"]);
  });

  it("skips an empty match and keeps looking", () => {
    const payload = { data: { labels: [] }, other: { labels: ["INBOX"] } };

    expect(findArray(payload, ["labels"])).toEqual(["INBOX"]);
  });

  it("returns an empty array for a primitive", () => {
    expect(findArray(7, ["labels"])).toEqual([]);
  });

  it("returns an empty array when the key is absent everywhere", () => {
    expect(findArray({ a: { b: 1 } }, ["labels"])).toEqual([]);
  });

  it("searches inside an array of containers", () => {
    const payload = [{ nothing: 1 }, { data: { labels: ["INBOX"] } }];

    expect(findArray(payload, ["labels"])).toEqual(["INBOX"]);
  });
});
