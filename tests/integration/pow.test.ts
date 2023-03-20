import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as assert from "assert";
import { POWPuzzle, Question } from "../../src";
import { GaslessTransaction, RawSubmitSolution, getPuzzle, postSolution } from "../../src/gasless";
import { GaslessDapp } from "../../src/dapp";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  createMint,
  mintTo,
} from "@solana/spl-token";
import { Wallet } from "@project-serum/anchor";
import { sleep } from "../common";

describe("POW integration gasless service", () => {
  const DEFAULT_RPC_ENDPOINT_URL = "http://127.0.0.1:8899";
  const connection = new Connection(DEFAULT_RPC_ENDPOINT_URL, "confirmed");
  const alice = Keypair.generate();
  const bob = Keypair.generate();
  const aliceWallet = new Wallet(alice);
  const gaslessPayer = new PublicKey("7ynuZQDBNg3Nu6ApAps11wcSJaVrTkmM3EAhAAFSidTL");

  it(
    "get puzzle",
    async () => {
      await connection.requestAirdrop(alice.publicKey, 100_000_000);
      await connection.requestAirdrop(gaslessPayer, 1_000_000_000);
      await sleep(500);
      const normalTx = await createTransferTx(
        connection,
        alice,
        alice.publicKey,
        bob.publicKey,
        20_000_000
      );

      // Gasless SDK
      const dappUtil = await GaslessDapp.new(connection); // should init only once
      const gaslessTx = new GaslessTransaction(connection, aliceWallet, dappUtil);
      gaslessTx.addInstructions(normalTx.instructions);

      gaslessTx.asyncBuildAndExecute((error: any, txid: string) => {
        console.log("asyncBuildAndExecute");
        console.log(error, txid);
      });

      console.log("waiting...");
      await sleep(10 * 1000);
      //   //
      //   const puzzle = await getPuzzle(connection, alice.publicKey);
      //   const solution = await POWPuzzle.solveAsync(Question.fromObject(puzzle.question));
      //   const rawSolution: RawSubmitSolution = {
      //     address: alice.publicKey.toBase58(),
      //     solution: solution.toString(16),
      //     ...puzzle,
      //   };

      //   const unsigned = await gaslessTx.build();
      //   const signed = await aliceWallet.signTransaction(unsigned);
      //   try {
      //     const txid = await postSolution(connection, rawSolution, signed);
      //     console.log(txid);
      //   } catch (e) {
      //     console.log(e);
      //   }
    },
    20 * 1000
  );
});

async function createTransferTx(
  connection: Connection,
  payer: Keypair,
  fromPub: PublicKey,
  toPub: PublicKey,
  amount: number
): Promise<Transaction> {
  const mintPub = await createMint(connection, payer, payer.publicKey, null, 9);
  await sleep(500);
  const ataFrom = await getOrCreateAssociatedTokenAccount(connection, payer, mintPub, fromPub);
  const ataTo = await getOrCreateAssociatedTokenAccount(connection, payer, mintPub, toPub);
  await sleep(500);
  await mintTo(connection, payer, mintPub, ataFrom.address, payer, amount);

  // this is normal transaction
  const transaction = new Transaction();

  // Add transfer
  transaction.add(createTransferInstruction(ataFrom.address, ataTo.address, fromPub, amount));
  return transaction;
}

// 959064n {
//     question: {
//       difficulty: '31e1b1',
//       salt: '57ab508e58e152b695bca0aac52224ba4afad1f12a751b2931ea0b184cf0570f',
//       hash: 'a6aca12a56c7c3e55d0a4209045badd2c60ee105f607f8a710c8eae7ac4fd444'
//     },
//     expired: 1678774368,
//     signature: '2zGRg9twxS2PPtdwf1m9yqYYzcjG6nuoW6KSaS39Ko2PmdACHt5vJpKi58aR8UhA7PceBxi6uL9E9kPGWpY4A8Ho'
//   }
