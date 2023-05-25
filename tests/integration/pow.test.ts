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
import { Wallet, sleep, RENT_EXEMPT_MINT } from "../../src/helpers";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
} from "@solana/spl-token";

const A_SOL = 1_000_000_000;

describe("POW integration gasless service", () => {
  const DEFAULT_RPC_ENDPOINT_URL = "https://api-testnet.renec.foundation:8899/";
  const connection = new Connection(DEFAULT_RPC_ENDPOINT_URL, "confirmed");
  const alice = Keypair.generate();
  const bob = Keypair.generate();
  const coby = Keypair.generate();

  const aliceWallet = new Wallet(alice);
  let dappUtil: GaslessDapp;
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

    const { transaction, mintToken } = await createMintAndMintTo(alice.publicKey, 100 * A_SOL);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    transaction.partialSign(alice);
    transaction.partialSign(mintToken);

    const txid = await sendAndConfirmRawTransaction(connection, transaction.serialize());
    await sleep(1000);
  }, 25 * 1000);

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

  describe("getPuzzleAndEstimateTime & solveAndSubmit", () => {
    it(
      "should be success when transfer native token",
      async () => {
        const instructions: TransactionInstruction[] = [
          SystemProgram.transfer({
            fromPubkey: alice.publicKey,
            toPubkey: coby.publicKey,
            lamports: 30,
          }),
        ];

        const _gaslessTxn = new GaslessTransaction(connection, aliceWallet, dappUtil);
        const { puzzle, estHandlingTime } = await _gaslessTxn
          .addInstructions(instructions)
          .getPuzzleAndEstimateTime();

        expect(estHandlingTime).toBeGreaterThan(0);
        const txid = await _gaslessTxn.solveAndSubmit(puzzle);
        expect(typeof txid).toBe("string"); // txid in base58 encoding
      },
      60 * 1000
    );

    it(
      "should be success when create new mint account & create new ATA",
      async () => {
        // this is data that the easy token send to wallet
        const { transaction, mintToken } = await createMintAndMintTo(alice.publicKey, A_SOL);

        const _gaslessTxn = new GaslessTransaction(connection, aliceWallet, dappUtil);
        const { puzzle, estHandlingTime } = await _gaslessTxn
          .addInstructions(transaction.instructions)
          .addSigners([mintToken])
          .getPuzzleAndEstimateTime();

        expect(estHandlingTime).toBeGreaterThan(0);
        const txid = await _gaslessTxn.solveAndSubmit(puzzle);
        console.log(txid);
        expect(typeof txid).toBe("string"); // txid in base58 encoding
      },
      60 * 1000
    );
  });
});

async function createMintAndMintTo(
  payer: PublicKey,
  mintAmount: number,
  decimals = 9
): Promise<{
  transaction: Transaction;
  mintToken: Keypair;
}> {
  const mintToken = Keypair.generate();

  const transaction = new Transaction();

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintToken.publicKey,
      space: MintLayout.span,
      lamports: RENT_EXEMPT_MINT,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  transaction.add(
    Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mintToken.publicKey, decimals, payer, null)
  );

  const associatedAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintToken.publicKey,
    payer
  );

  transaction.add(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintToken.publicKey,
      associatedAddress,
      payer,
      payer
    )
  );

  transaction.add(
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mintToken.publicKey,
      associatedAddress,
      payer,
      [],
      mintAmount
    )
  );

  transaction.feePayer = payer;

  return {
    transaction,
    mintToken,
  };
}
