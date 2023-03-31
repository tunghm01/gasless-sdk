"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const spl_token_1 = require("@solana/spl-token");
const decoder_1 = require("./decoder");
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
}
exports.TokenUtil = TokenUtil;
