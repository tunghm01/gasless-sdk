import { Solution, Puzzle, Question } from "./types";
import { randomInRange, sha256, rng } from "./crypto";

const bn = BigInt;

type HashParams = {
  salt: bigint;
  solution: bigint;
};

const A_MILLION = bn(1_000_000);

export class POWPuzzle {
  constructor() {}

  static generate(difficulty: bigint): Puzzle {
    if (difficulty <= bn(0)) throw new Error("The difficulty must be positive");
    const salt = rng();
    const solution = randomInRange(0, difficulty);
    const hash = this.hashSolution({ salt, solution });
    return new Puzzle(new Question(difficulty, salt, hash), solution);
  }

  static solve(question: Question, onResult: (solution: Solution, question: Question) => void) {
    const { salt, hash } = question;
    const difficulty = question.difficulty;

    setTimeout(() => {
      let solution = bn(0);
      while (!this.isValidSolution({ salt, solution }, hash) && solution <= difficulty) {
        solution++;
      }
      if (onResult) {
        onResult(solution, question);
      }
    }, 0);
  }

  static async solveAsync(question: Question): Promise<Solution> {
    const { salt, hash } = question;
    const difficulty = question.difficulty;
    let solution = bn(0);
    while (!this.isValidSolution({ salt, solution }, hash) && solution <= difficulty) {
      solution++;
    }
    return solution;
  }

  static isValidSolution(input: HashParams, target: string): boolean {
    return this.hashSolution(input) === target;
  }

  static hashSolution(hashParams: HashParams): string {
    const { salt, solution } = hashParams;
    const msg = `${salt.toString(16)}${solution.toString(16)}`;
    return sha256(msg);
  }

  static estimateDifficulty(seconds: number): bigint {
    let time1MHashes = this.time1MHashes();
    const difficulty = Math.floor((seconds * 1000 * Number(A_MILLION)) / time1MHashes);
    return bn(difficulty) * bn(2) - bn(1);
  }

  static estimateTime(difficulty: bigint): { avgTime: number; maxTime: number } {
    let time1MHashes = this.time1MHashes();
    const numHashes = this.estimateNumHashes(difficulty);
    const avgTimeInMs = (Number(numHashes) * time1MHashes) / Number(A_MILLION);
    const maxTimeInMs = (Number(difficulty) * time1MHashes) / Number(A_MILLION);
    return { avgTime: Math.floor(avgTimeInMs / 1000), maxTime: Math.floor(maxTimeInMs / 1000) };
  }

  /**
   *
   * @returns time in milliseconds to hash 1M times
   */
  static time1MHashes(): number {
    const salt = rng();
    const hash = rng().toString(16);
    let temp = bn(0);

    const start = Date.now();
    while (!this.isValidSolution({ salt, solution: temp }, hash) && temp <= A_MILLION) {
      temp++;
    }
    return Date.now() - start;
  }

  // avg = (1 + 2 +  3 + 4 + 5 + .. + difficulty) / difficulty
  //     = [difficulty * (1 + difficulty) / 2]  / difficulty
  //     = (1 + difficulty) / 2
  static estimateNumHashes(difficulty: bigint): bigint {
    return (difficulty + bn(1)) / bn(2);
  }
}
