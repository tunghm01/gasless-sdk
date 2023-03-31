import { struct, u8 } from "@solana/buffer-layout";
import type { AccountMeta } from "@solana/web3.js";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AssociatedTokenInstruction } from "./types";
import {
  TokenInvalidInstructionProgramError,
  TokenInvalidInstructionDataError,
  TokenInvalidInstructionKeysError,
  TokenInvalidInstructionTypeError,
} from "./errors";

export interface CreateAssociatedTokenInstructionData {
  instruction: AssociatedTokenInstruction.Create;
}

export const createAssociatedTokenInstructionData = struct<CreateAssociatedTokenInstructionData>([
  u8("instruction"),
]);

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

export function decodeCreateAssociatedTokenInstruction(
  instruction: TransactionInstruction,
  programId = ASSOCIATED_TOKEN_PROGRAM_ID
): DecodedCreateAssociatedTokenInstruction {
  if (!instruction.programId.equals(programId)) throw new TokenInvalidInstructionProgramError();
  if (
    instruction.data.length !== 0 &&
    instruction.data.length !== createAssociatedTokenInstructionData.span
  )
    throw new TokenInvalidInstructionDataError();

  const {
    keys: { fundingAccount, ataAccount, wallet, mint, systemProgram, splTokenProgram },
    data,
  } = decodeCreateAssociatedTokenInstructionUnchecked(instruction);
  if (data.instruction !== AssociatedTokenInstruction.Create)
    throw new TokenInvalidInstructionTypeError();
  if (!fundingAccount || !ataAccount || !wallet || !mint || !systemProgram || !splTokenProgram)
    throw new TokenInvalidInstructionKeysError();

  return {
    programId,
    keys: { fundingAccount, ataAccount, wallet, mint, systemProgram, splTokenProgram },
    data,
  };
}

export function decodeCreateAssociatedTokenInstructionUnchecked({
  programId,
  keys: [fundingAccount, ataAccount, wallet, mint, systemProgram, splTokenProgram],
  data,
}: TransactionInstruction): DecodedCreateAssociatedTokenInstructionUnchecked {
  return {
    programId,
    keys: {
      fundingAccount,
      ataAccount,
      wallet,
      mint,
      systemProgram,
      splTokenProgram,
    },
    data:
      data.length > 0
        ? createAssociatedTokenInstructionData.decode(data)
        : { instruction: AssociatedTokenInstruction.Create }, // default is create
  };
}
