import { Connection, Signer, Transaction, TransactionInstruction } from "@solana/web3.js";
import { GaslessDapp } from "../dapp";
import { GaslessTypes, SignedPuzzle } from "./types";
import { Wallet } from "@project-serum/anchor";
export type CompressedIx = {
    instructions: TransactionInstruction[];
    cleanupInstructions: TransactionInstruction[];
    signers: Signer[];
};
export declare class GaslessTransaction {
    readonly connection: Connection;
    readonly wallet: Wallet;
    readonly dapp: GaslessDapp;
    transaction: Transaction;
    signers: Signer[];
    gaslessType: GaslessTypes;
    constructor(connection: Connection, wallet: Wallet, dapp: GaslessDapp, gaslessType?: GaslessTypes);
    static fromTransactionBuilder(connection: Connection, wallet: Wallet, compressIx: CompressedIx, dappUtil: GaslessDapp): GaslessTransaction;
    addSigners(signers: Signer[]): GaslessTransaction;
    addInstructions(ixs: TransactionInstruction[]): GaslessTransaction;
    setGaslessType(gaslessType: GaslessTypes): GaslessTransaction;
    getPuzzleAndEstimateTime(): Promise<{
        puzzle: SignedPuzzle;
        estHandlingTime: number;
    }>;
    solveAndSubmit(puzzle: SignedPuzzle): Promise<string>;
    buildAndExecute(): Promise<string>;
    private _solveAndSubmitPuzzle;
    asyncBuildAndExecute(cb: (error: any, txid: string) => void): void;
}
