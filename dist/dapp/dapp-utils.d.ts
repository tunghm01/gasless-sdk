import { Connection, PublicKey, TransactionInstruction, Transaction } from "@solana/web3.js";
import { NetworkConfig } from "../gasless";
import { Artifact } from "./artifacts";
export type DappInstruction = {
    name: string;
    decodedData: object;
} & TransactionInstruction;
export declare class GaslessDapp {
    readonly connection: Connection;
    readonly network: NetworkConfig;
    readonly dapps: Artifact[];
    constructor(connection: Connection, network: NetworkConfig, dapps: Artifact[]);
    static new(connection: Connection): Promise<GaslessDapp>;
    decodeTransaction(transaction: Transaction): DappInstruction[];
    hasDappInstruction(transaction: Transaction): boolean;
    addBorrowRepayForRentExemption(transaction: Transaction, wallet: PublicKey, feePayer: PublicKey): Promise<Transaction>;
    build(transaction: Transaction, wallet: PublicKey, feePayer: PublicKey): Promise<Transaction>;
}
