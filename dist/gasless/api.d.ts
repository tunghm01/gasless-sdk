import { Connection, Transaction, PublicKey } from "@solana/web3.js";
import { GaslessTypes, NetworkConfig, SignedPuzzle, RawSubmitSolution } from "./types";
export declare function getNetwork(connection: Connection): Promise<NetworkConfig>;
export declare function getGaslessInfo(connection: Connection): Promise<{
    feePayer: PublicKey;
}>;
export declare function sendToGasless(connection: Connection, signed: Transaction, type: GaslessTypes): Promise<string>;
export declare function getPuzzle(connection: Connection, address: PublicKey): Promise<SignedPuzzle>;
export declare function postSolution(connection: Connection, rawSolution: RawSubmitSolution, signed: Transaction): Promise<string>;
