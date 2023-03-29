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
exports.GaslessTransaction = void 0;
const web3_js_1 = require("@solana/web3.js");
const types_1 = require("./types");
const gasless_1 = require("../gasless");
const pow_1 = require("../pow");
const token_util_1 = require("../helpers/token-util");
class GaslessTransaction {
    constructor(connection, wallet, dapp, gaslessType = types_1.GaslessTypes.POW) {
        this.connection = connection;
        this.wallet = wallet;
        this.dapp = dapp;
        this.transaction = new web3_js_1.Transaction();
        this.signers = [];
        this.gaslessType = gaslessType;
    }
    static fromTransactionBuilder(connection, wallet, compressIx, dappUtil) {
        const { instructions, cleanupInstructions, signers } = compressIx;
        const _this = new GaslessTransaction(connection, wallet, dappUtil);
        _this.addSigners(signers);
        _this.addInstructions(instructions);
        _this.addInstructions(cleanupInstructions);
        return _this;
    }
    addSigners(signers) {
        this.signers = signers;
        return this;
    }
    addInstructions(ixs) {
        for (let i = 0; i < ixs.length; i++) {
            const ix = ixs[i];
            this.transaction.add(ix);
        }
        return this;
    }
    setGaslessType(gaslessType) {
        this.gaslessType = gaslessType;
        return this;
    }
    // async build(gaslessType?: GaslessTypes): Promise<Transaction> {
    //   if (gaslessType) {
    //     this.gaslessType = gaslessType;
    //   } else {
    //     // Automatically detect the dapp type
    //     if (this.dapp.hasDappInstruction(this.transaction)) {
    //       this.gaslessType = GaslessTypes.Dapp;
    //     }
    //   }
    //   const { feePayer } = await getGaslessInfo(this.connection);
    //   if (this.gaslessType === GaslessTypes.Dapp) {
    //     this.transaction = await this.dapp.build(this.transaction, this.wallet.publicKey, feePayer);
    //   } else if (this.gaslessType === GaslessTypes.POW) {
    //     // TODO:
    //   } else {
    //     throw Error(`${this.gaslessType} not supported`);
    //   }
    //   this.transaction.feePayer = feePayer;
    //   this.transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
    //   for (let i = 0; i < this.signers.length; i++) {
    //     const s = this.signers[i];
    //     this.transaction.sign(s);
    //   }
    //   return this.transaction;
    // }
    buildAndExecute() {
        return __awaiter(this, void 0, void 0, function* () {
            // Automatically detect the dapp type
            if (this.dapp.hasDappInstruction(this.transaction)) {
                this.gaslessType = types_1.GaslessTypes.Dapp;
            }
            const { feePayer } = yield (0, gasless_1.getGaslessInfo)(this.connection);
            if (this.gaslessType === types_1.GaslessTypes.Dapp) {
                this.transaction = yield this.dapp.build(this.transaction, this.wallet.publicKey, feePayer);
                this.transaction.feePayer = feePayer;
                this.transaction.recentBlockhash = (yield this.connection.getRecentBlockhash()).blockhash;
                for (let i = 0; i < this.signers.length; i++) {
                    const s = this.signers[i];
                    this.transaction.sign(s);
                }
                this.transaction = yield this.wallet.signTransaction(this.transaction);
                const txid = yield (0, gasless_1.sendToGasless)(this.connection, this.transaction, this.gaslessType);
                return txid;
            }
            else if (this.gaslessType === types_1.GaslessTypes.POW) {
                const puzzle = yield (0, gasless_1.getPuzzle)(this.connection, this.wallet.publicKey);
                const solution = yield pow_1.POWPuzzle.solveAsync(pow_1.Question.fromObject(puzzle.question));
                const rawSolution = Object.assign({ address: this.wallet.publicKey.toBase58(), solution: solution.toString(16) }, puzzle);
                // pay for initializing token account fee
                this.transaction = token_util_1.TokenUtil.replaceFundingAccountOfCreateATAIx(this.transaction, feePayer);
                this.transaction.feePayer = feePayer;
                this.transaction.recentBlockhash = (yield this.connection.getRecentBlockhash()).blockhash;
                for (let i = 0; i < this.signers.length; i++) {
                    const s = this.signers[i];
                    this.transaction.sign(s);
                }
                this.transaction = yield this.wallet.signTransaction(this.transaction);
                const txid = yield (0, gasless_1.postSolution)(this.connection, rawSolution, this.transaction);
                return txid;
            }
            else {
                throw Error(`${this.gaslessType} not supported`);
            }
        });
    }
    asyncBuildAndExecute(cb) {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const txid = yield this.buildAndExecute();
                cb(null, txid);
            }
            catch (e) {
                cb(e, "");
            }
        }), 0);
    }
}
exports.GaslessTransaction = GaslessTransaction;
