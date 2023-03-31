import { randomBytes, createHash } from "crypto";
const bn = BigInt;

export const DEFAULT_RANDOM_SIZE = 32; // 32-bytes

export function rng(size: number = DEFAULT_RANDOM_SIZE): bigint {
  return bn(`0x${randomBytes(size).toString("hex")}`);
}

export function randomInRange(min: number | bigint, max: number | bigint): bigint {
  min = bn(min);
  max = bn(max);

  if (min < bn(0) || max < bn(0)) throw new Error("Negative ranges are not supported");
  if (max <= min) throw new Error('"max" must be at least equal to "min" plus 1');

  const entropy = rng();
  const rangeFromZero = entropy % (max - min + bn(1));

  return rangeFromZero + min;
}

export function sha256(msg: string): string {
  return createHash("sha256").update(msg).digest("hex");
}