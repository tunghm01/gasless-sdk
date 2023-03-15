"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POWPuzzle = void 0;
const types_1 = require("./types");
const crypto_1 = require("./crypto");
const bn = BigInt;
const A_MILLION = bn(1000000);
class POWPuzzle {
    constructor() { }
    static generate(difficulty) {
        if (difficulty <= bn(0))
            throw new Error("The difficulty must be positive");
        const salt = (0, crypto_1.rng)();
        const solution = (0, crypto_1.randomInRange)(0, difficulty);
        const hash = this.hashSolution({ salt, solution });
        return new types_1.Puzzle(new types_1.Question(difficulty, salt, hash), solution);
    }
    static solve(question, onResult) {
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
    static solveAsync(question) {
        return __awaiter(this, void 0, void 0, function* () {
            const { salt, hash } = question;
            const difficulty = question.difficulty;
            let solution = bn(0);
            while (!this.isValidSolution({ salt, solution }, hash) && solution <= difficulty) {
                solution++;
            }
            return solution;
        });
    }
    static isValidSolution(input, target) {
        return this.hashSolution(input) === target;
    }
    static hashSolution(hashParams) {
        const { salt, solution } = hashParams;
        const msg = `${salt.toString(16)}${solution.toString(16)}`;
        return (0, crypto_1.sha256)(msg);
    }
    static estimateDifficulty(seconds) {
        let time1MHashes = this.time1MHashes();
        const difficulty = Math.floor((seconds * 1000 * Number(A_MILLION)) / time1MHashes);
        return bn(difficulty) * bn(2) - bn(1);
    }
    static estimateTime(difficulty) {
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
    static time1MHashes() {
        const salt = (0, crypto_1.rng)();
        const hash = (0, crypto_1.rng)().toString(16);
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
    static estimateNumHashes(difficulty) {
        return (difficulty + bn(1)) / bn(2);
    }
}
exports.POWPuzzle = POWPuzzle;
