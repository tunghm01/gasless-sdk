import { struct, u8 } from "@solana/buffer-layout";
import type { AccountMeta } from "@solana/web3.js";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenInstruction } from "./types";
import {
  TokenInvalidInstructionProgramError,
  TokenInvalidInstructionDataError,
  TokenInvalidInstructionKeysError,
  TokenInvalidInstructionTypeError,
} from "./errors";

// CloseAccountInstruction
/** TODO: docs */
export interface CloseAccountInstructionData {
  instruction: TokenInstruction.CloseAccount;
}

/** TODO: docs */
export const closeAccountInstructionData = struct<CloseAccountInstructionData>([u8("instruction")]);

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
export function decodeCloseAccountInstruction(
  instruction: TransactionInstruction,
  programId = TOKEN_PROGRAM_ID
): DecodedCloseAccountInstruction {
  if (!instruction.programId.equals(programId)) throw new TokenInvalidInstructionProgramError();
  if (instruction.data.length !== closeAccountInstructionData.span)
    throw new TokenInvalidInstructionDataError();

  const {
    keys: { account, destination, authority, multiSigners },
    data,
  } = decodeCloseAccountInstructionUnchecked(instruction);
  if (data.instruction !== TokenInstruction.CloseAccount)
    throw new TokenInvalidInstructionTypeError();
  if (!account || !destination || !authority) throw new TokenInvalidInstructionKeysError();

  // TODO: key checks?

  return {
    programId,
    keys: {
      account,
      destination,
      authority,
      multiSigners,
    },
    data,
  };
}

/**
 * Decode a CloseAccount instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @return Decoded, non-validated instruction
 */
export function decodeCloseAccountInstructionUnchecked({
  programId,
  keys: [account, destination, authority, ...multiSigners],
  data,
}: TransactionInstruction): DecodedCloseAccountInstructionUnchecked {
  return {
    programId,
    keys: {
      account,
      destination,
      authority,
      multiSigners,
    },
    data: closeAccountInstructionData.decode(data),
  };
}
