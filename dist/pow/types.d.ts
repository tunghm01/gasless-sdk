export type Signature = string;
export type Solution = bigint;
export type QuestionObject = {
    difficulty: string;
    salt: string;
    hash: string;
};
export declare class Question {
    readonly difficulty: bigint;
    readonly salt: bigint;
    readonly hash: string;
    constructor(difficulty: bigint, salt: bigint, hash: string);
    static fromObject(obj: QuestionObject): Question;
    toObject(): QuestionObject;
    toString(): string;
}
export declare class Puzzle {
    readonly question: Question;
    readonly solution: Solution;
    constructor(question: Question, solution: Solution);
    toObject(): object;
    toString(): string;
    key(): string;
}
