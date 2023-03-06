import {
  AccountLayout,
  NATIVE_MINT,
  Account,
  createTransferCheckedInstruction,
  decodeInitializeAccountInstruction,
  decodeCloseAccountInstruction,
} from "@solana/spl-token";
import { Connection, Transaction, PublicKey, SystemProgram } from "@solana/web3.js";
import invariant from "tiny-invariant";
import { deriveATA, Instruction, resolveOrCreateATA } from "../web3";

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

  public static isNativeMint(mint: PublicKey) {
    return mint.equals(NATIVE_MINT);
  }

  public static deserializeTokenAccount = (data: Buffer | undefined): Account | null => {
    if (!data) {
      return null;
    }

    const accountInfo: any = AccountLayout.decode(data);
    accountInfo.mint = new PublicKey(accountInfo.mint);
    accountInfo.owner = new PublicKey(accountInfo.owner);
    accountInfo.amount = accountInfo.amount;

    if (accountInfo.delegateOption === 0) {
      accountInfo.delegate = null;
      accountInfo.delegatedAmount = BigInt(0);
    } else {
      accountInfo.delegate = new PublicKey(accountInfo.delegate);
      accountInfo.delegatedAmount = accountInfo.delegatedAmount;
    }

    accountInfo.isInitialized = accountInfo.state !== 0;
    accountInfo.isFrozen = accountInfo.state === 2;

    if (accountInfo.isNativeOption === 1) {
      accountInfo.rentExemptReserve = accountInfo.isNative;
      accountInfo.isNative = true;
    } else {
      accountInfo.rentExemptReserve = null;
      accountInfo.isNative = false;
    }

    if (accountInfo.closeAuthorityOption === 0) {
      accountInfo.closeAuthority = null;
    } else {
      accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
    }

    return accountInfo as Account;
  };

  /**
   * Create an ix to send a spl-token / native-mint to another wallet.
   * This function will handle the associated token accounts internally for spl-token.
   * SOL is sent directly to the user's wallet.
   *
   * @param connection - Connection object
   * @param sourceWallet - PublicKey for the sender's wallet
   * @param destinationWallet - PublicKey for the receiver's wallet
   * @param tokenMint - Mint for the token that is being sent.
   * @param tokenDecimals - Decimal for the token that is being sent.
   * @param amount - Amount of token to send
   * @param getAccountRentExempt - Fn to fetch the account rent exempt value
   * @param payer - PublicKey for the payer that would fund the possibly new token-accounts. (must sign the txn)
   * @returns
   */
  static async createSendTokensToWalletInstruction(
    connection: Connection,
    sourceWallet: PublicKey,
    destinationWallet: PublicKey,
    tokenMint: PublicKey,
    tokenDecimals: number,
    amount: bigint,
    getAccountRentExempt: () => Promise<number>,
    payer?: PublicKey
  ): Promise<Instruction> {
    invariant(amount > BigInt(0), "SendToken transaction must send more than 0 tokens.");

    // Specifically handle SOL, which is not a spl-token.
    if (tokenMint.equals(NATIVE_MINT)) {
      const sendSolTxn = SystemProgram.transfer({
        fromPubkey: sourceWallet,
        toPubkey: destinationWallet,
        lamports: BigInt(amount.toString()),
      });
      return {
        instructions: [sendSolTxn],
        cleanupInstructions: [],
        signers: [],
      };
    }

    const sourceTokenAccount = await deriveATA(sourceWallet, tokenMint);
    const { address: destinationTokenAccount, ...destinationAtaIx } = await resolveOrCreateATA(
      connection,
      destinationWallet,
      tokenMint,
      getAccountRentExempt,
      amount,
      payer
    );

    const transferIx = createTransferCheckedInstruction(
      sourceTokenAccount,
      tokenMint,
      destinationTokenAccount,
      sourceWallet,
      amount,
      tokenDecimals,
      []
    );

    return {
      instructions: destinationAtaIx.instructions.concat(transferIx),
      cleanupInstructions: destinationAtaIx.cleanupInstructions,
      signers: destinationAtaIx.signers,
    };
  }
}
