import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  TransactionInstruction,
  Signer,
} from "@solana/web3.js";
import * as assert from "assert";
import { POWPuzzle, Question, TokenUtil } from "../../src";
import {
  GaslessTransaction,
  RawSubmitSolution,
  getPuzzle,
  postSolution,
  getGaslessInfo,
  GaslessTypes,
} from "../../src/gasless";
import { GaslessDapp } from "../../src/dapp";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Wallet } from "@project-serum/anchor";
import { sleep } from "../common";

describe("POW integration gasless service", () => {
  const DEFAULT_RPC_ENDPOINT_URL = "http://127.0.0.1:8899";
  const connection = new Connection(DEFAULT_RPC_ENDPOINT_URL, "confirmed");
  const alice = Keypair.generate();
  const bob = Keypair.generate();
  const aliceWallet = new Wallet(alice);
  let dappUtil;
  let gaslessTxn: GaslessTransaction;
  let mockMint: Token;
  let aliceATA: PublicKey;
  let feePayer: PublicKey;

  beforeEach(async () => {
    // set up variables for testing
    dappUtil = await GaslessDapp.new(connection); // should init only once
    gaslessTxn = new GaslessTransaction(connection, aliceWallet, dappUtil);

    // send a fund to fee payer
    feePayer = (await getGaslessInfo(connection)).feePayer;
    await connection.requestAirdrop(feePayer, 1_000_000_000);
    await connection.requestAirdrop(alice.publicKey, 1_000_000_000);
    await sleep(500);
  });

  it("GaslessTransaction can be created", async () => {
    expect(gaslessTxn).toBeInstanceOf(GaslessTransaction);
  });

  it("addSigners should correctly add signers to GaslessTransaction", () => {
    const signers: Signer[] = [alice];
    const addedSigners = gaslessTxn.addSigners(signers).signers;

    expect(addedSigners).toHaveLength(1);
    expect(addedSigners[0].publicKey).toEqual(alice.publicKey);
  });

  it("addInstructions should correctly add instructions to GaslessTransaction", () => {
    const randomMint = Keypair.generate();
    const ix = Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      randomMint.publicKey,
      9,
      alice.publicKey,
      null
    );
    const instructions: TransactionInstruction[] = [ix];
    const addedInstructions = gaslessTxn.addInstructions(instructions).transaction.instructions;

    expect(addedInstructions).toHaveLength(1);
  });

  it("setGaslessType should correctly set the gaslessType of GaslessTransaction", () => {
    const gaslessType: GaslessTypes = GaslessTypes.Dapp;
    const setGaslessType = gaslessTxn.setGaslessType(gaslessType).gaslessType;

    expect(setGaslessType).toEqual(gaslessType);
  });

  describe("buildAndExecute", () => {
    // it(
    //   "buildAndExecute should correctly build and execute transaction with Dapp gaslessType",
    //   async () => {
    //     const instructions: TransactionInstruction[] = [
    //       SystemProgram.transfer({
    //         fromPubkey: alice.publicKey,
    //         toPubkey: bob.publicKey,
    //         lamports: 0,
    //       }),
    //     ];

    //     const txid = await gaslessTxn.addInstructions(instructions).buildAndExecute();
    //     expect(typeof txid).toBe("string"); // txid in base58 encoding
    //   },
    //   20 * 1000
    // );

    it(
      "buildAndExecute should replace fee payer of create ata instruction",
      async () => {
        mockMint = await Token.createMint(
          connection,
          alice,
          alice.publicKey,
          null,
          9,
          TOKEN_PROGRAM_ID
        );
        await sleep(1000);
        aliceATA = await mockMint.createAssociatedTokenAccount(alice.publicKey);
        await sleep(1000);
        await mockMint.mintTo(aliceATA, alice, [], 1_000_000_000);
        await sleep(1000);
        const bobATA = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mockMint.publicKey,
          bob.publicKey
        );
        const instructions: TransactionInstruction[] = [
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mockMint.publicKey,
            bobATA,
            bob.publicKey,
            alice.publicKey
          ),
          Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            aliceATA,
            bobATA,
            alice.publicKey,
            [],
            10
          ),
        ];
        // gaslessTxn.addInstructions(instructions);
        // console.log("================================================");
        // console.log(gaslessTxn.transaction.instructions[0].data);
        // TokenUtil.replaceFundingAccountOfCreateATAIx(gaslessTxn.transaction, feePayer);
        try {
          const txid = await gaslessTxn.addInstructions(instructions).buildAndExecute();
        } catch (e) {
          console.log(e);
        }

        // console.log(txid);
        // expect(typeof txid).toBe("string"); // txid in base58 encoding
      },
      20 * 1000
    );
  });

  it(
    "get puzzle",
    async () => {
      // await connection.requestAirdrop(alice.publicKey, 100_000_000);
      // await connection.requestAirdrop(gaslessPayer, 1_000_000_000);
      // await sleep(500);
      // const normalTx = await createTransferTx(
      //   connection,
      //   alice,
      //   alice.publicKey,
      //   bob.publicKey,
      //   20_000_000
      // );
      // // Gasless SDK
      // const dappUtil = await GaslessDapp.new(connection); // should init only once
      // const gaslessTx = new GaslessTransaction(connection, aliceWallet, dappUtil);
      // gaslessTx.addInstructions(normalTx.instructions);
      // gaslessTx.asyncBuildAndExecute((error: any, txid: string) => {
      //   console.log("asyncBuildAndExecute");
      //   console.log(error, txid);
      // });
      // console.log("waiting...");
      // await sleep(10 * 1000);
      //   //
      const puzzle = await getPuzzle(connection, alice.publicKey);
      console.log(puzzle);
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

  // beforeAll(async () => {
  //   // set up variables for testing
  //   connection = new Connection("http://localhost:8899");
  //   wallet = Wallet.generateNewWallet();
  //   dapp = new GaslessDapp(connection);
  //   const ix = new TransactionInstruction();
  //   compressedIx = { instructions: [ix], cleanupInstructions: [], signers: [] };
  // });

  // describe("build", () => {

  //   test("build should correctly build transaction with POW gaslessType", async () => {
  //     const gaslessTxn = new GaslessTransaction(connection, wallet, dapp);

  //     const solution = "0xa";
  //     spyOn(POWPuzzle, "solveAsync").and.returnValue(Promise.resolve(solution));
  //     const rawSubmit: RawSubmitSolution = {
  //       address: wallet.publicKey.toBase58(),
  //       solution,
  //       puzzle: { question: { data: "test data" } },
  //       cost: 1,
  //     };
  //     spyOn(TokenUtil, "replaceFundingAccountOfCreateATAIx").and.returnValue(new Transaction());
  //     spyOn(connection, "getRecentBlockhash").and.returnValue(Promise.resolve({ blockhash: "test blockhash" }));
  //     spyOn(wallet, "signTransaction").and.returnValue(Promise.resolve(new Transaction()));
  //     spyOn(postSolution, "postSolution").and.returnValue(Promise.resolve("test txid"));

  //     const builtTxn = await gaslessTxn.build(GaslessTypes.POW);

  //     expect(builtTxn.recentBlockhash).toBeDefined();
  //     expect(builtTxn.feePayer).toBeDefined();
  //     expect(builtTxn.instructions).toHaveLength(1);
  //   });

  // });

  // describe("buildAndExecute", () => {
  //   test("buildAndExecute should correctly build and execute transaction with Dapp gaslessType", async () => {
  //     const gaslessTxn = new GaslessTransaction(connection, wallet, dapp);

  //     const { feePayer } = await getGaslessInfo(connection);
  //     const instructions: TransactionInstruction[] = [new TransactionInstruction()];

  //     const executedTxn = await gaslessTxn
  //       .addInstructions(instructions)
  //       .buildAndExecute();

  //     expect(executedTxn).toBeDefined();
  //   });

  //   test("buildAndExecute should correctly build and execute transaction with POW gaslessType", async () => {
  //     const gaslessTxn = new GaslessTransaction(connection, wallet, dapp);

  //     const solution = "0xa";
  //     spyOn(POWPuzzle, "solveAsync").and.returnValue(Promise.resolve(solution));
  //     const rawSubmit: RawSubmitSolution = {
  //       address: wallet.publicKey.toBase58(),
  //       solution,
  //       puzzle: { question: { data: "test data" } },
  //       cost: 1,
  //     };
  //     spyOn(TokenUtil, "replaceFundingAccountOfCreateATAIx").and.returnValue(new Transaction());
  //     spyOn(connection, "getRecentBlockhash").and.returnValue(Promise.resolve({ blockhash: "test blockhash" }));
  //     spyOn(wallet, "signTransaction").and.returnValue(Promise.resolve(new Transaction()));
  //     spyOn(postSolution, "postSolution").and.returnValue(Promise.resolve("test txid"));

  //     const executedTxn = await gaslessTxn
  //       .setGaslessType(GaslessTypes.POW)
  //       .addInstructions([new TransactionInstruction()])
  //       .buildAndExecute();

  //     expect(executedTxn).toBeDefined();
  //   });

  //   test("buildAndExecute should throw error when gaslessType is not supported", async () => {
  //     const gaslessTxn = new GaslessTransaction(connection, wallet, dapp);

  //     try {
  //       await gaslessTxn
  //         .setGaslessType("invalid gaslessType")
  //         .addInstructions([new TransactionInstruction()])
  //         .buildAndExecute();
  //     } catch (e) {
  //       expect(e.message).toEqual("invalid gaslessType not supported");
  //     }
  //   });
  // });
});

// async function createTransferTx(
//   connection: Connection,
//   payer: Keypair,
//   fromPub: PublicKey,
//   toPub: PublicKey,
//   amount: number
// ): Promise<Transaction> {
//   const mintPub = await Token.createMint(
//     connection,
//     payer,
//     payer.publicKey,
//     null,
//     9,
//     TOKEN_PROGRAM_ID
//   );
//   await sleep(500);
//   const ataFrom = await Token.getOrCreateAssociatedTokenAccount(
//     connection,
//     payer,
//     mintPub,
//     fromPub
//   );
//   const ataTo = await getOrCreateAssociatedTokenAccount(connection, payer, mintPub, toPub);
//   await sleep(500);
//   await Token.createMintToInstruction(connection, payer, mintPub, ataFrom.address, payer, amount);

//   // this is normal transaction
//   const transaction = new Transaction();

//   // Add transfer
//   transaction.add(createTransferInstruction(ataFrom.address, ataTo.address, fromPub, amount));
//   return transaction;
// }

// 959064n {
//     question: {
//       difficulty: '31e1b1',
//       salt: '57ab508e58e152b695bca0aac52224ba4afad1f12a751b2931ea0b184cf0570f',
//       hash: 'a6aca12a56c7c3e55d0a4209045badd2c60ee105f607f8a710c8eae7ac4fd444'
//     },
//     expired: 1678774368,
//     signature: '2zGRg9twxS2PPtdwf1m9yqYYzcjG6nuoW6KSaS39Ko2PmdACHt5vJpKi58aR8UhA7PceBxi6uL9E9kPGWpY4A8Ho'
//   }
