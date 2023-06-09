import { AnchorProvider } from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { ConfirmOptions, Connection, Signer } from "@solana/web3.js";
import { Instruction, TransactionPayload } from "./types";
/**
 * @category Transactions Util
 */
export type BuildOptions = {
    latestBlockhash: {
        blockhash: string;
        lastValidBlockHeight: number;
    } | undefined;
};
/**
 * @category Transactions Util
 */
export declare class TransactionBuilder {
    readonly connection: Connection;
    readonly wallet: Wallet;
    private instructions;
    private signers;
    constructor(connection: Connection, wallet: Wallet);
    /**
     * Append an instruction into this builder.
     * @param instruction - An Instruction
     * @returns Returns this transaction builder.
     */
    addInstruction(instruction: Instruction): TransactionBuilder;
    /**
     * Append a list of instructions into this builder.
     * @param instructions - A list of Instructions
     * @returns Returns this transaction builder.
     */
    addInstructions(instructions: Instruction[]): TransactionBuilder;
    /**
     * Prepend a list of instructions into this builder.
     * @param instruction - An Instruction
     * @returns Returns this transaction builder.
     */
    prependInstruction(instruction: Instruction): TransactionBuilder;
    /**
     * Prepend a list of instructions into this builder.
     * @param instructions - A list of Instructions
     * @returns Returns this transaction builder.
     */
    prependInstructions(instructions: Instruction[]): TransactionBuilder;
    addSigner(signer: Signer): TransactionBuilder;
    isEmpty(): boolean;
    /**
     * Compresses all instructions & signers in this builder
     * into one single instruction
     * @param compressPost Compress all post instructions into the instructions field
     * @returns Instruction object containing all
     */
    compressIx(compressPost: boolean): Instruction;
    /**
     * Returns the size of the current transaction in bytes.
     * @returns the size of the current transaction in bytes.
     * @throws error if transaction is over maximum package size.
     */
    txnSize(options?: BuildOptions): Promise<number>;
    /**
     * Constructs a transaction payload with the gathered instructions
     * @returns a TransactionPayload object that can be excuted or agregated into other transactions
     */
    build(options?: BuildOptions): Promise<TransactionPayload>;
    /**
     * Constructs a transaction payload with the gathered instructions, sign it with the provider and send it out
     * @returns the txId of the transaction
     */
    buildAndExecute(): Promise<string>;
    /**
     * Send multiple transactions at once.
     * @deprecated This method is here for legacy reasons and we prefer the use of TransactionProcessor
     */
    static sendAll(provider: AnchorProvider, txns: TransactionBuilder[], opts?: ConfirmOptions): Promise<string[]>;
}
