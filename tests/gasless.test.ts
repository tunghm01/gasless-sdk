import {
  SystemProgram,
  Connection,
  Signer,
  Transaction,
  TransactionInstruction,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";

import {
  AccountLayout,
  getMinimumBalanceForRentExemptAccount,
  decodeInitializeAccountInstruction,
  decodeInitializeAccountInstructionUnchecked,
} from "@solana/spl-token";
import { GaslessTransaction } from "../src/gasless";
import { TokenUtil, resolveOrCreateATA } from "../src/web3";
import { createWSOLAccountInstructions } from "../src/helpers/token-instructions";
describe("gasless", () => {
  it("gasless", async () => {
    const DEFAULT_RPC_ENDPOINT_URL = "http://localhost:8899";

    const connection = new Connection(DEFAULT_RPC_ENDPOINT_URL, "confirmed");
    const wallet = new Wallet(Keypair.generate());

    const transaction = new Transaction();
    const rentExemptLamports = await getMinimumBalanceForRentExemptAccount(connection);
    const ix = createWSOLAccountInstructions(wallet.publicKey, BigInt(0), rentExemptLamports);

    ix.instructions.forEach((_ix) => {
      try {
        transaction.add(_ix);
      } catch (e) {
        console.log(e);
      }
    });

    console.log(TokenUtil.hasInitializeNativeTokenAccountIx(transaction));
  });
});
