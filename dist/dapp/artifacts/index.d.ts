import { PublicKey } from "@solana/web3.js";
import { BorshCoder } from "@project-serum/anchor";
import { NetworkConfig } from "../../gasless";
export type Artifact = {
    name: string;
    programId: PublicKey;
    coder: BorshCoder;
};
export type DappInfo = {
    name: string;
    programId: string;
    idl: Object;
};
export declare function loadArtifacts(network: NetworkConfig): Artifact[];
