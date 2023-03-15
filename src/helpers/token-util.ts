import {
  NATIVE_MINT,
  decodeInitializeAccountInstruction,
  decodeCloseAccountInstruction,
} from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";

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
}
