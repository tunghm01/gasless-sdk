import { Transaction, Signer, TransactionInstruction } from "@solana/web3.js";
/**
 * @category Transactions Util
 */
export declare const EMPTY_INSTRUCTION: Instruction;
/**
 * @category Transactions Util
 */
export type Instruction = {
    instructions: TransactionInstruction[];
    cleanupInstructions: TransactionInstruction[];
    signers: Signer[];
};
/**
 * @category Transactions Util
 */
export type TransactionPayload = {
    transaction: Transaction;
    signers: Signer[];
};
/**
 * @category Transactions Util
 */
export type SendTxRequest = {
    transaction: Transaction;
    signers?: Array<Signer | undefined>;
};
