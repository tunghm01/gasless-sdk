import { Solution, Puzzle, Question } from "./types";
type HashParams = {
    salt: bigint;
    solution: bigint;
};
export declare class POWPuzzle {
    constructor();
    generate(difficulty: bigint): Puzzle;
    solve(question: Question, onResult: (solution: Solution, question: Question) => void): Promise<Solution>;
    verifyResult(input: HashParams, target: string): boolean;
    hashSolution(hashParams: HashParams): string;
}
export {};
