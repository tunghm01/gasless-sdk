import { Transaction, PublicKey } from "@solana/web3.js";
/**
 * @category Util
 */
export declare class TokenUtil {
    /**
     *
     * @param transaction
     * @returns Number of InitializeTokenAccount instructions
     */
    static hasInitializeNativeTokenAccountIx(transaction: Transaction): PublicKey | null;
    /**
     *
     * @param transaction
     * @returns Number of CloseAccountInstruction instructions
     */
    static hasCloseTokenAccountIx(transaction: Transaction, closedAccount: PublicKey): boolean;
    static replaceFundingAccountOfCreateATAIx(transaction: Transaction, feePayer: PublicKey): Transaction;
}
