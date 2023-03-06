import { randomBytes, createHash } from "crypto";
import { Keypair } from "@solana/web3.js";
randomBytes(256, (err, buf) => {
  if (err) throw err;
  console.log(`${buf.length} bytes of random data: ${buf.toString("hex")}`);
});

export type Difficulty = {
  level: number;
  difficulty: bigint;
};

export type Question = {
  difficulty: bigint;
  salt: string;
  hash: string;
};

export type Solution = bigint;

export type Puzzle = {
  question: Question;
  solution: Solution;
};

const bn = BigInt;

export class POW {
  constructor() {}

  static generatePuzzle(diff: Difficulty) {
    const difficulty = diff.difficulty;
    const salt = randomBytes(256).toString("hex");
    const solution = randomInRange(0, difficulty);
    const hash = createHash("sha256").update(salt).update(solution.toString(16)).digest("hex");

    if (difficulty <= bn(0)) throw new Error("The difficulty must be positive");

    const a = Keypair.generate();
  }
}

function randomInRange(min: number | bigint, max: number | bigint): bigint {
  min = bn(min);
  max = bn(max);

  if (min < bn(0) || max < bn(0)) throw new Error("Negative ranges are not supported");
  if (max <= min) throw new Error('"max" must be at least equal to "min" plus 1');

  const entropy = bn(`0x${randomBytes(32).toString("hex")}`);
  const rangeFromZero = entropy % (max - min + bn(1));

  return rangeFromZero + min;
}
