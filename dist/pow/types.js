"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Puzzle = exports.Question = void 0;
const crypto_1 = require("./crypto");
class Question {
    constructor(difficulty, salt, hash) {
        this.difficulty = difficulty;
        this.salt = salt;
        this.hash = hash;
    }
    static fromObject(obj) {
        return new Question(BigInt("0x" + obj.difficulty), BigInt("0x" + obj.salt), obj.hash);
    }
    toObject() {
        return {
            difficulty: this.difficulty.toString(16),
            salt: this.salt.toString(16),
            hash: this.hash,
        };
    }
    toString() {
        return this.difficulty.toString(16) + this.salt.toString(16) + this.hash;
    }
}
exports.Question = Question;
class Puzzle {
    constructor(question, solution) {
        this.question = question;
        this.solution = solution;
    }
    toObject() {
        return Object.assign({ solution: this.solution.toString(16) }, this.question);
    }
    toString() {
        return this.question.toString() + this.solution.toString(16);
    }
    key() {
        return (0, crypto_1.sha256)(this.toString());
    }
}
exports.Puzzle = Puzzle;
