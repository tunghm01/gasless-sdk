import { sha256 } from "./crypto";

export type Signature = string;

export type Solution = bigint;

export type QuestionObject = {
  difficulty: string;
  salt: string;
  hash: string;
};

export class Question {
  constructor(readonly difficulty: bigint, readonly salt: bigint, readonly hash: string) {}

  static fromObject(obj: QuestionObject): Question {
    return new Question(BigInt("0x" + obj.difficulty), BigInt("0x" + obj.salt), obj.hash);
  }

  toObject(): QuestionObject {
    return {
      difficulty: this.difficulty.toString(16),
      salt: this.salt.toString(16),
      hash: this.hash,
    };
  }

  toString(): string {
    return this.difficulty.toString(16) + this.salt.toString(16) + this.hash;
  }
}

export class Puzzle {
  constructor(readonly question: Question, readonly solution: Solution) {}

  toObject(): object {
    return { solution: this.solution.toString(16), ...this.question.toObject() };
  }

  toString(): string {
    return this.question.toString() + this.solution.toString(16);
  }

  key(): string {
    return sha256(this.toString());
  }
}
