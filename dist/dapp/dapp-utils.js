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
exports.GaslessDapp = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const api_1 = require("../gasless/api");
const artifacts_1 = require("./artifacts");
const token_util_1 = require("../helpers/token-util");
class GaslessDapp {
    constructor(connection, network, dapps) {
        this.connection = connection;
        this.network = network;
        this.dapps = dapps;
    }
    static new(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const network = yield (0, api_1.getNetwork)(connection);
            const dapps = yield (0, artifacts_1.loadArtifacts)(network);
            return new GaslessDapp(connection, network, dapps);
        });
    }
    decodeTransaction(transaction) {
        let dappIxs = [];
        transaction.instructions.forEach((ix) => {
            const dapp = this.dapps.find((dapp) => ix.programId.equals(dapp.programId));
            if (dapp) {
                const decoded = dapp.coder.instruction.decode(ix.data);
                if (decoded) {
                    dappIxs.push(Object.assign({ name: dapp.name, decodedData: decoded.data }, ix));
                }
            }
        });
        return dappIxs;
    }
    hasDappInstruction(transaction) {
        const dappIxs = this.decodeTransaction(transaction);
        return dappIxs.length > 0 ? true : false;
    }
    addBorrowRepayForRentExemption(transaction, wallet, feePayer) {
        return __awaiter(this, void 0, void 0, function* () {
            const rentExemption = yield (0, spl_token_1.getMinimumBalanceForRentExemptAccount)(this.connection);
            const tx = new web3_js_1.Transaction();
            tx.add(web3_js_1.SystemProgram.transfer({
                fromPubkey: feePayer,
                toPubkey: wallet,
                lamports: rentExemption,
            }));
            tx.add(transaction);
            tx.add(web3_js_1.SystemProgram.transfer({
                fromPubkey: wallet,
                toPubkey: feePayer,
                lamports: rentExemption,
            }));
            return tx;
        });
    }
    build(transaction, wallet, feePayer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasDappInstruction(transaction)) {
                throw Error(`dapp instruction not found`);
            }
            const account = token_util_1.TokenUtil.hasInitializeNativeTokenAccountIx(transaction);
            if (account) {
                const isClosed = token_util_1.TokenUtil.hasCloseTokenAccountIx(transaction, account);
                const balance = yield this.connection.getBalanceAndContext(wallet);
                if (balance.value === 0 && isClosed) {
                    transaction = yield this.addBorrowRepayForRentExemption(transaction, wallet, feePayer);
                }
            }
            return transaction;
        });
    }
}
exports.GaslessDapp = GaslessDapp;
