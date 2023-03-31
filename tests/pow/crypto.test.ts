import { DEFAULT_RANDOM_SIZE, rng, randomInRange, sha256 } from "../../src";

describe("crypto in pow", () => {
  it("rng() returns a BigInt", () => {
    expect(typeof rng()).toBe("bigint");
  });

  it(`rng() returns a ${DEFAULT_RANDOM_SIZE}-byte bigint`, () => {
    expect(rng().toString(16).length).toBe(DEFAULT_RANDOM_SIZE * 2);
  });

  it("randomInRange() returns a number within the range", () => {
    const min = 1000;
    const max = 100000;
    const num = randomInRange(min, max);
    expect(num).toBeGreaterThanOrEqual(min);
    expect(num).toBeLessThanOrEqual(max);
  });

  it("randomInRange() throws an error if max <= min", () => {
    const min = 1000;
    const max = 999;
    expect(() => {
      randomInRange(min, max);
    }).toThrow('"max" must be at least equal to "min" plus 1');
  });

  it("randomInRange() throws an error if min < 0 or max < 0", () => {
    const min = -2;
    const max = -1;
    expect(() => {
      randomInRange(min, max);
    }).toThrow("Negative ranges are not supported");
  });

  it("sha256() returns a string", () => {
    expect(typeof sha256("hello world")).toBe("string");
  });

  it("sha256() returns the correct hash", () => {
    expect(sha256("hello world")).toBe(sha256("hello world"));
  });
});
