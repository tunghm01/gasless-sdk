import { Solution, Puzzle, Question } from "./types";
import { randomInRange, sha256, rng } from "./crypto";
import { SignedPuzzle } from "../gasless";

const bn = BigInt;

type HashParams = {
  salt: bigint;
  solution: bigint;
};

const A_HUNDRED = bn(100);

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
    let time100Hashes = this.time100Hashes();
    const difficulty = Math.floor((seconds * 1000 * Number(A_HUNDRED)) / time100Hashes);
    return bn(difficulty) * bn(2) - bn(1);
  }

  static estimateTime(difficulty: bigint): { avgTime: number; maxTime: number } {
    let time100Hashes = this.time100Hashes();
    const numHashes = this.estimateNumHashes(difficulty);
    const avgTimeInMs = Math.floor((Number(numHashes) * time100Hashes) / Number(A_HUNDRED) / 1000);
    const maxTimeInMs = Math.floor((Number(difficulty) * time100Hashes) / Number(A_HUNDRED) / 1000);
    return { avgTime: Math.max(avgTimeInMs, 1), maxTime: Math.max(maxTimeInMs, 1) };
  }

  static estHandlingTime(puzzle: SignedPuzzle): number {
    const estTimes = this.estimateTime(BigInt(puzzle.question.difficulty));

    const now = Math.floor(Date.now() / 1000);
    const minHandlingTime = now < puzzle.allowedSubmissionAt ? puzzle.allowedSubmissionAt - now : 0;
    return Math.max(minHandlingTime, estTimes.avgTime);
  }

  /**
   *
   * @returns time in milliseconds to hash 1M times
   */
  static time100Hashes(): number {
    const salt = rng();
    const hash = rng().toString(16);
    let temp = bn(0);

    const start = Date.now();
    while (!this.isValidSolution({ salt, solution: temp }, hash) && temp <= A_HUNDRED) {
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
