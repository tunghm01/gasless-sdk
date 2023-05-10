"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = exports.RENT_EXEMPT_MINT = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const decoder_1 = require("./decoder");
exports.RENT_EXEMPT_MINT = 1461600;
/**
 * @category Util
 */
class TokenUtil {
    /**
     *
     * @param transaction
     * @returns Number of InitializeTokenAccount instructions
     */
    static hasInitializeNativeTokenAccountIx(transaction) {
        const accounts = [];
        transaction.instructions.forEach((ix) => {
            try {
                const init = (0, decoder_1.decodeInitializeAccountInstruction)(ix);
                if (init.keys.mint.pubkey.equals(spl_token_1.NATIVE_MINT)) {
                    accounts.push(init.keys.account.pubkey);
                }
            }
            catch (e) {
                // ignore
            }
        });
        if (accounts.length > 1) {
            throw new Error(`Only one InitializeNativeTokenAccount instruction is allowed. You have ${accounts.length} instructions`);
        }
        if (accounts.length === 1) {
            return accounts[0];
        }
        return null;
    }
    /**
     *
     * @param transaction
     * @returns Number of CloseAccountInstruction instructions
     */
    static hasCloseTokenAccountIx(transaction, closedAccount) {
        transaction.instructions.forEach((ix) => {
            try {
                const close = (0, decoder_1.decodeCloseAccountInstruction)(ix);
                if (close.keys.account.pubkey.equals(closedAccount)) {
                    return true;
                }
            }
            catch (e) {
                // ignore
            }
        });
        return false;
    }
    static replaceFundingAccountOfCreateATAIx(transaction, feePayer) {
        transaction.instructions.forEach((ix) => {
            try {
                (0, decoder_1.decodeCreateAssociatedTokenInstruction)(ix);
                // reassign funding account to fee payer
                ix.keys[0].pubkey = feePayer;
            }
            catch (e) {
                // ignore
            }
        });
        return transaction;
    }
    static replaceFundingAccountOfCreateMintAccountIx(transaction, feePayer) {
        transaction.instructions.forEach((ix) => {
            try {
                const createAccountParams = web3_js_1.SystemInstruction.decodeCreateAccount(ix);
                if (createAccountParams.space === spl_token_1.MintLayout.span &&
                    createAccountParams.lamports === exports.RENT_EXEMPT_MINT &&
                    createAccountParams.fromPubkey.toBase58() === ix.keys[0].pubkey.toBase58()) {
                    // reassign funding account to fee payer
                    ix.keys[0].pubkey = feePayer;
                }
            }
            catch (e) {
                // ignore
            }
        });
        return transaction;
    }
}
exports.TokenUtil = TokenUtil;
