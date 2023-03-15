import { Keypair } from "@solana/web3.js";
import { Signature } from "./types";
export declare class POWSignature {
    private readonly signer;
    constructor(signer: Keypair);
    signerAddress(): string;
    signMessage(message: string): Signature;
    validateSignature(message: string, signature: Signature): boolean;
    toMessage(msg: string): string;
}
