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
class POWPuzzle {
    constructor() { }
    generate(difficulty) {
        if (difficulty <= bn(0))
            throw new Error("The difficulty must be positive");
        const salt = (0, crypto_1.rng)();
        const solution = (0, crypto_1.randomInRange)(0, difficulty);
        const hash = this.hashSolution({ salt, solution });
        return new types_1.Puzzle(new types_1.Question(difficulty, salt, hash), solution);
    }
    solve(question, onResult) {
        return __awaiter(this, void 0, void 0, function* () {
            const { salt, hash } = question;
            const difficulty = question.difficulty;
            let nonce = bn(0);
            while (!this.verifyResult({ salt, solution: nonce }, hash) && nonce <= difficulty) {
                nonce++;
            }
            onResult(nonce, question);
            return nonce;
        });
    }
    verifyResult(input, target) {
        return this.hashSolution(input) === target;
    }
    hashSolution(hashParams) {
        const { salt, solution } = hashParams;
        const msg = `${salt.toString(16)}${solution.toString(16)}`;
        return (0, crypto_1.sha256)(msg);
    }
}
exports.POWPuzzle = POWPuzzle;
