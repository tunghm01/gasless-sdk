import type { AccountMeta } from "@solana/web3.js";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TokenInstruction } from "./types";
/** TODO: docs */
export interface CloseAccountInstructionData {
    instruction: TokenInstruction.CloseAccount;
}
/** TODO: docs */
export declare const closeAccountInstructionData: import("@solana/buffer-layout").Structure<CloseAccountInstructionData>;
/** A decoded, valid CloseAccount instruction */
export interface DecodedCloseAccountInstruction {
    programId: PublicKey;
    keys: {
        account: AccountMeta;
        destination: AccountMeta;
        authority: AccountMeta;
        multiSigners: AccountMeta[];
    };
    data: {
        instruction: TokenInstruction.CloseAccount;
    };
}
/** A decoded, non-validated CloseAccount instruction */
export interface DecodedCloseAccountInstructionUnchecked {
    programId: PublicKey;
    keys: {
        account: AccountMeta | undefined;
        destination: AccountMeta | undefined;
        authority: AccountMeta | undefined;
        multiSigners: AccountMeta[];
    };
    data: {
        instruction: number;
    };
}
/**
 * Decode a CloseAccount instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @return Decoded, valid instruction
 */
export declare function decodeCloseAccountInstruction(instruction: TransactionInstruction, programId?: PublicKey): DecodedCloseAccountInstruction;
/**
 * Decode a CloseAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export declare function decodeCloseAccountInstructionUnchecked({ programId, keys: [account, destination, authority, ...multiSigners], data, }: TransactionInstruction): DecodedCloseAccountInstructionUnchecked;
