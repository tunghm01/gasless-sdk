import {
  Keypair,
  Connection,
  PublicKey,
  TransactionInstruction,
  sendAndConfirmRawTransaction,
  Transaction,
  Signer,
  SystemProgram,
} from "@solana/web3.js";
import {
  GaslessTransaction,
  getGaslessInfo,
  GaslessTypes,
  getPendingPuzzles,
} from "../../src/gasless";
import { GaslessDapp } from "../../src/dapp";
import { Wallet, sleep } from "../../src/helpers";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

const A_SOL = 1_000_000_000;

describe("POW integration gasless service", () => {
  const DEFAULT_RPC_ENDPOINT_URL = "http://127.0.0.1:8899";
  const connection = new Connection(DEFAULT_RPC_ENDPOINT_URL, "confirmed");
  const alice = Keypair.generate();
  const bob = Keypair.generate();
  const coby = Keypair.generate();

  const aliceWallet = new Wallet(alice);
  let dappUtil;
  let gaslessTxn: GaslessTransaction;
  let mockMint: Token;
  let aliceATA: PublicKey;
  let cobyATA: PublicKey;
  let feePayer: PublicKey;

  beforeAll(async () => {
    // send a fund to fee payer
    feePayer = (await getGaslessInfo(connection)).feePayer;
    await connection.requestAirdrop(feePayer, A_SOL);
    await connection.requestAirdrop(alice.publicKey, A_SOL);
    await connection.requestAirdrop(coby.publicKey, A_SOL);
    await sleep(1000);

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
    cobyATA = await mockMint.createAssociatedTokenAccount(coby.publicKey);
    await sleep(1000);
    await mockMint.mintTo(aliceATA, alice, [], A_SOL);
    await sleep(1000);
  }, 20 * 1000);

  beforeEach(async () => {
    // set up variables for testing
    dappUtil = await GaslessDapp.new(connection); // should init only once
    gaslessTxn = new GaslessTransaction(connection, aliceWallet, dappUtil);
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
    it(
      "buildAndExecute should be success when transfer native token",
      async () => {
        const instructions: TransactionInstruction[] = [
          SystemProgram.transfer({
            fromPubkey: alice.publicKey,
            toPubkey: coby.publicKey,
            lamports: 30,
          }),
        ];

        // const transaction = new Transaction();
        // transaction.add(instructions[0]);
        // transaction.feePayer = alice.publicKey;
        // transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
        // transaction.partialSign(alice);

        // const txid = await sendAndConfirmRawTransaction(connection, transaction.serialize(), {
        //   commitment: "confirmed",
        // });

        // console.log(txid);

        // try {
        const txid = await gaslessTxn.addInstructions(instructions).buildAndExecute();
        expect(typeof txid).toBe("string"); // txid in base58 encoding
        // } catch (error) {
        //   console.log(error);
        // }
      },
      10 * 1000
    );

    it(
      "buildAndExecute should be success",
      async () => {
        const instructions: TransactionInstruction[] = [
          Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            aliceATA,
            cobyATA,
            alice.publicKey,
            [],
            10
          ),
        ];
        const txid = await gaslessTxn.addInstructions(instructions).buildAndExecute();
        expect(typeof txid).toBe("string"); // txid in base58 encoding
      },
      10 * 1000
    );

    it(
      "buildAndExecute should replace fee payer of create ata instruction",
      async () => {
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

        const txid = await gaslessTxn.addInstructions(instructions).buildAndExecute();
        expect(typeof txid).toBe("string"); // txid in base58 encoding
      },
      10 * 1000
    );
  });

  it(
    "asyncBuildAndExecute should be success when transfer native token",
    async () => {
      const instructions: TransactionInstruction[] = [
        SystemProgram.transfer({
          fromPubkey: alice.publicKey,
          toPubkey: coby.publicKey,
          lamports: 30,
        }),
      ];

      gaslessTxn.addInstructions(instructions).asyncBuildAndExecute((error, txid) => {
        expect(error).toBe(null);
        expect(typeof txid).toBe("string"); // txid in base58 encoding
      });

      await sleep(1000);
      const pendingPuzzles = await getPendingPuzzles(connection, alice.publicKey);
      expect(pendingPuzzles).toBe(1);
    },
    10 * 1000
  );
});
