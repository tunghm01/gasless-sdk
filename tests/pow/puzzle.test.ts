import { POWPuzzle, Solution, Puzzle, rng, sha256 } from "../../src";

describe("puzzle in pow", () => {
  describe("generate", () => {
    it("should throw an error if difficulty is not positive", () => {
      const difficulty = BigInt(0);
      expect(() => POWPuzzle.generate(difficulty)).toThrowError("The difficulty must be positive");
    });

    it("should create a new puzzle object with a difficulty, salt, and solution", () => {
      const difficulty = BigInt(100);
      const puzzle: Puzzle = POWPuzzle.generate(difficulty);
      expect(puzzle.question.difficulty).toEqual(difficulty);
      expect(typeof puzzle.question.salt).toEqual("bigint");
      expect(puzzle.solution).toBeGreaterThanOrEqual(0);
      expect(puzzle.solution).toBeLessThanOrEqual(difficulty);
      expect(puzzle.question.hash).toEqual(
        POWPuzzle.hashSolution({ salt: puzzle.question.salt, solution: puzzle.solution })
      );
    });
  });

  describe("solve", () => {
    it("should find the correct solution non-blocking", (done) => {
      const difficulty = BigInt(100);
      const puzzle: Puzzle = POWPuzzle.generate(difficulty);

      POWPuzzle.solve(puzzle.question, (solution: Solution) => {
        expect(solution).toBeGreaterThanOrEqual(0);
        expect(solution).toBeLessThanOrEqual(difficulty);
        expect(puzzle.question.hash).toEqual(
          POWPuzzle.hashSolution({ salt: puzzle.question.salt, solution })
        );
        done();
      });
    });
  });

  describe("solveAsync", () => {
    it("should return the correct solution blocking", async () => {
      const difficulty = BigInt(100);
      const puzzle: Puzzle = POWPuzzle.generate(difficulty);
      const solution: Solution = await POWPuzzle.solveAsync(puzzle.question);
      expect(solution).toBeGreaterThanOrEqual(0);
      expect(solution).toBeLessThanOrEqual(difficulty);
      expect(puzzle.question.hash).toEqual(
        POWPuzzle.hashSolution({ salt: puzzle.question.salt, solution })
      );
    });
  });

  describe("isValidSolution", () => {
    it("should return true when input params are valid and equal to the target", () => {
      const salt = rng();
      const solution = rng(2);
      const hash = POWPuzzle.hashSolution({ salt, solution });
      const isValid = POWPuzzle.isValidSolution({ salt, solution }, hash);
      expect(isValid).toBeTruthy();
    });

    it("should return false when input params are valid but not equal to the target", () => {
      const salt = rng();
      const solution = rng(2);
      const hash = sha256("invalid");
      const isValid = POWPuzzle.isValidSolution({ salt, solution }, hash);
      expect(isValid).toBeFalsy();
    });
  });

  describe("hashSolution", () => {
    it("should return a valid sha256 hash", () => {
      const salt = rng();
      const solution = rng(2);
      const expectedHash = sha256(`${salt.toString(16)}${solution.toString(16)}`);
      const actualHash = POWPuzzle.hashSolution({ salt, solution });
      expect(actualHash).toEqual(expectedHash);
    });
  });

  describe("estimateDifficulty", () => {
    it("should return a valid estimate of the difficulty given a time in seconds", () => {
      const seconds = 10;
      const difficulty = POWPuzzle.estimateDifficulty(seconds);
      expect(difficulty).toBeGreaterThan(0);
    });
  });

  describe("estimateTime", () => {
    it("should return an object with valid estimates for average and max times given a difficulty", () => {
      const difficulty = BigInt(1_000_000);
      const estimates = POWPuzzle.estimateTime(difficulty);
      expect(estimates.maxTime).toBeGreaterThan(estimates.avgTime);
    });
  });

  describe("time100Hashes", () => {
    it("should return an accurate time in milliseconds to hash 1 million times", () => {
      const actualTime = POWPuzzle.time100Hashes();
      expect(actualTime).toBeGreaterThan(0);
    });
  });

  describe("estimateNumHashes", () => {
    it("should return a valid estimate for the number of hashes needed to solve the puzzle for the given difficulty", () => {
      const difficulty = BigInt(100);
      const expectedNumHashes = BigInt((BigInt(1) + difficulty) / BigInt(2));
      const actualNumHashes = POWPuzzle.estimateNumHashes(difficulty);
      expect(actualNumHashes).toEqual(expectedNumHashes);
    });
  });
});
