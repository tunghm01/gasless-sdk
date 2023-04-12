import { Solution, Puzzle, Question } from "./types";
import { SignedPuzzle } from "../gasless";
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
    static estimateTime(difficulty: bigint): {
        avgTime: number;
        maxTime: number;
    };
    static estHandlingTime(puzzle: SignedPuzzle): number;
    /**
     *
     * @returns time in milliseconds to hash 1M times
     */
    static time100Hashes(): number;
    static estimateNumHashes(difficulty: bigint): bigint;
}
export {};
