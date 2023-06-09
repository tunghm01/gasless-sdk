import { NATIVE_MINT, MintLayout } from "@solana/spl-token";
import { Transaction, PublicKey, SystemInstruction } from "@solana/web3.js";
import {
  decodeCloseAccountInstruction,
  decodeInitializeAccountInstruction,
  decodeCreateAssociatedTokenInstruction,
} from "./decoder";

export const RENT_EXEMPT_MINT = 1461600;

/**
 * @category Util
 */
export class TokenUtil {
  /**
   *
   * @param transaction
   * @returns Number of InitializeTokenAccount instructions
   */
  public static hasInitializeNativeTokenAccountIx(transaction: Transaction): PublicKey | null {
    const accounts: PublicKey[] = [];
    transaction.instructions.forEach((ix) => {
      try {
        const init = decodeInitializeAccountInstruction(ix);
        if (init.keys.mint.pubkey.equals(NATIVE_MINT)) {
          accounts.push(init.keys.account.pubkey);
        }
      } catch (e) {
        // ignore
      }
    });
    if (accounts.length > 1) {
      throw new Error(
        `Only one InitializeNativeTokenAccount instruction is allowed. You have ${accounts.length} instructions`
      );
    }
    if (accounts.length === 1) {
      return accounts[0];
    }
    return null;
  }

  /**
   *
   * @param transaction
   * @returns Number of CloseAccountInstruction instructions
   */
  public static hasCloseTokenAccountIx(
    transaction: Transaction,
    closedAccount: PublicKey
  ): boolean {
    transaction.instructions.forEach((ix) => {
      try {
        const close = decodeCloseAccountInstruction(ix);
        if (close.keys.account.pubkey.equals(closedAccount)) {
          return true;
        }
      } catch (e) {
        // ignore
      }
    });
    return false;
  }

  public static replaceFundingAccountOfCreateATAIx(
    transaction: Transaction,
    feePayer: PublicKey
  ): Transaction {
    transaction.instructions.forEach((ix) => {
      try {
        decodeCreateAssociatedTokenInstruction(ix);
        // reassign funding account to fee payer
        ix.keys[0].pubkey = feePayer;
      } catch (e) {
        // ignore
      }
    });
    return transaction;
  }

  public static replaceFundingAccountOfCreateMintAccountIx(
    transaction: Transaction,
    feePayer: PublicKey
  ): Transaction {
    transaction.instructions.forEach((ix) => {
      try {
        const createAccountParams = SystemInstruction.decodeCreateAccount(ix);

        if (
          createAccountParams.space === MintLayout.span &&
          createAccountParams.lamports === RENT_EXEMPT_MINT &&
          createAccountParams.fromPubkey.toBase58() === ix.keys[0].pubkey.toBase58()
        ) {
          // reassign funding account to fee payer
          ix.keys[0].pubkey = feePayer;
        }
      } catch (e) {
        // ignore
      }
    });
    return transaction;
  }
}
