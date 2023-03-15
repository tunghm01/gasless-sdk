import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as assert from "assert";
import { POWPuzzle } from "../src";
import { GaslessTransaction } from "../src/gasless";

const bn = BigInt;

describe("POW package", () => {
  const difficulty = bn(50_000_000);
  const signer = Keypair.generate();

  // it("POWSignature - sign a message then validate that signature", async () => {
  //   const pow = new POWSignature(signer);
  //   const message = "hello world";
  //   const signature = pow.signMessage(message);
  // });

  //   it("POWPuzzle - generate a puzzle with the given difficulty", async () => {
  //     const puzzle = POWPuzzle.generate(difficulty);
  //     const hash = POWPuzzle.hashSolution({
  //       salt: puzzle.question.salt,
  //       solution: puzzle.solution,
  //     });

  //     assert.equal(puzzle.question.difficulty, difficulty);
  //     assert.equal(puzzle.question.hash, hash);
  //     assert.ok(puzzle.solution <= difficulty, "'solution' must be less than 'difficulty'");
  //   });

  //   it("POWPuzzle - solve a puzzle with difficulty = 100M", async () => {
  //     const { question, solution } = POWPuzzle.generate(difficulty);

  //     const found = await POWPuzzle.solveAsync(question);
  //     assert.equal(found, solution);
  //   });

  //   it("POWPuzzle - solve a puzzle with difficulty = 5M", async () => {
  //     const { question, solution } = POWPuzzle.generate(bn(5_000_000));

  //     const found = await POWPuzzle.solveAsync(question);
  //     assert.equal(found, solution);
  //   });

  //   it("POWPuzzle - solve a puzzle with difficulty = 10M", async () => {
  //     const { question, solution } = POWPuzzle.generate(difficulty);

  //     const found = await POWPuzzle.solveAsync(question);
  //     assert.equal(found, solution);
  //   });

  //   it("POWPuzzle - max time to solve a puzzle with difficulty = 10M is", async () => {
  //     const hashes = POWPuzzle.estimateNumHashes(difficulty);
  //     console.log(hashes, POWPuzzle.estimateTime(difficulty));
  //   });

  it("POWPuzzle - solve a puzzle with difficulty = 100M", async () => {
    // const { question, solution } = POWPuzzle.generate(difficulty);

    const diff = POWPuzzle.estimateDifficulty(60);
    console.log(diff);

    const time = POWPuzzle.estimateTime(diff);
    console.log(time);
    // assert.equal(found, solution);
  });
});
