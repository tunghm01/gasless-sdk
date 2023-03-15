import { PublicKey, TransactionInstruction, Signer } from "@solana/web3.js";
export type Instruction = {
    instructions: TransactionInstruction[];
    cleanupInstructions: TransactionInstruction[];
    signers: Signer[];
};
export type ResolvedTokenAddressInstruction = {
    address: PublicKey;
} & Instruction;
export declare function createWSOLAccountInstructions(walletAddress: PublicKey, amountIn: BigInt, rentExemptLamports: number): ResolvedTokenAddressInstruction;
