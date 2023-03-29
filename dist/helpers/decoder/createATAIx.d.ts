import type { AccountMeta } from "@solana/web3.js";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { AssociatedTokenInstruction } from "./types";
export interface CreateAssociatedTokenInstructionData {
    instruction: AssociatedTokenInstruction.Create;
}
export declare const createAssociatedTokenInstructionData: import("@solana/buffer-layout").Structure<CreateAssociatedTokenInstructionData>;
export interface DecodedCreateAssociatedTokenInstruction {
    programId: PublicKey;
    keys: {
        fundingAccount: AccountMeta;
        ataAccount: AccountMeta;
        wallet: AccountMeta;
        mint: AccountMeta;
        systemProgram: AccountMeta;
        splTokenProgram: AccountMeta;
    };
    data: {
        instruction: AssociatedTokenInstruction.Create;
    };
}
export interface DecodedCreateAssociatedTokenInstructionUnchecked {
    programId: PublicKey;
    keys: {
        fundingAccount: AccountMeta | undefined;
        ataAccount: AccountMeta | undefined;
        wallet: AccountMeta | undefined;
        mint: AccountMeta | undefined;
        systemProgram: AccountMeta | undefined;
        splTokenProgram: AccountMeta | undefined;
    };
    data: {
        instruction: AssociatedTokenInstruction.Create;
    };
}
export declare function decodeCreateAssociatedTokenInstruction(instruction: TransactionInstruction, programId?: PublicKey): DecodedCreateAssociatedTokenInstruction;
export declare function decodeCreateAssociatedTokenInstructionUnchecked({ programId, keys: [fundingAccount, ataAccount, wallet, mint, systemProgram, splTokenProgram], data, }: TransactionInstruction): DecodedCreateAssociatedTokenInstructionUnchecked;
