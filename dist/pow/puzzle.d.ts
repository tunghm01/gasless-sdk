import { Solution, Puzzle, Question } from "./types";
type HashParams = {
    salt: bigint;
    solution: bigint;
};
export declare class POWPuzzle {
    constructor();
    static generate(difficulty: bigint): Puzzle;
    static solve(question: Question, onResult: (solution: Solution, question: Question) => void): void;
    static solveAsync(question: Question): Promise<Solution>;
    static isValidSolution(input: HashParams, target: string): boolean;
    static hashSolution(hashParams: HashParams): string;
    static estimateDifficulty(seconds: number): bigint;
    static estimateTime(difficulty: bigint): object;
    /**
     *
     * @returns time in milliseconds to hash 1M times
     */
    static time1MHashes(): number;
    static estimateNumHashes(difficulty: bigint): bigint;
}
export {};
