import {
  AccountLayout,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  createInitializeAccountInstruction,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Instruction } from "../web3/transactions/types";

export type ResolvedTokenAddressInstruction = {
  address: PublicKey;
} & Instruction;

// TODO use native-mint instead
export function createWSOLAccountInstructions(
  walletAddress: PublicKey,
  amountIn: BigInt,
  rentExemptLamports: number
): ResolvedTokenAddressInstruction {
  const tempAccount = new Keypair();

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: walletAddress,
    newAccountPubkey: tempAccount.publicKey,
    lamports: Number(amountIn) + rentExemptLamports,
    space: AccountLayout.span,
    programId: TOKEN_PROGRAM_ID,
  });

  const initAccountInstruction = createInitializeAccountInstruction(
    tempAccount.publicKey,
    NATIVE_MINT,
    walletAddress
  );

  const closeWSOLAccountInstruction = createCloseAccountInstruction(
    tempAccount.publicKey,
    walletAddress,
    walletAddress,
    []
  );

  return {
    address: tempAccount.publicKey,
    instructions: [createAccountInstruction, initAccountInstruction],
    cleanupInstructions: [closeWSOLAccountInstruction],
    signers: [tempAccount],
  };
}
