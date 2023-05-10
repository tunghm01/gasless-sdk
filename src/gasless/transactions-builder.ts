import {
  Connection,
  Signer,
  Transaction,
  TransactionInstruction,
  PublicKey,
} from "@solana/web3.js";
import { GaslessDapp } from "../dapp";
import { GaslessTypes, SignedPuzzle } from "./types";
import {
  RawSubmitSolution,
  getPuzzle,
  postSolution,
  getGaslessInfo,
  sendToGasless,
} from "../gasless";
import { POWPuzzle, Question } from "../pow";
import { Wallet } from "@project-serum/anchor";
import { TokenUtil, sleep } from "../helpers";

export type CompressedIx = {
  instructions: TransactionInstruction[];
  cleanupInstructions: TransactionInstruction[];
  signers: Signer[];
};

export class GaslessTransaction {
  public transaction: Transaction;
  public signers: Signer[];
  public gaslessType: GaslessTypes;

  constructor(
    readonly connection: Connection,
    readonly wallet: Wallet,
    readonly dapp: GaslessDapp,
    gaslessType: GaslessTypes = GaslessTypes.POW
  ) {
    this.transaction = new Transaction();
    this.signers = [];
    this.gaslessType = gaslessType;
  }

  static fromTransactionBuilder(
    connection: Connection,
    wallet: Wallet,
    compressIx: CompressedIx,
    dappUtil: GaslessDapp
  ): GaslessTransaction {
    const { instructions, cleanupInstructions, signers } = compressIx;

    const _this = new GaslessTransaction(connection, wallet, dappUtil);

    _this.addSigners(signers);
    _this.addInstructions(instructions);
    _this.addInstructions(cleanupInstructions);

    return _this;
  }

  addSigners(signers: Signer[]): GaslessTransaction {
    this.signers = signers;
    return this;
  }

  addInstructions(ixs: TransactionInstruction[]): GaslessTransaction {
    for (let i = 0; i < ixs.length; i++) {
      const ix = ixs[i];
      this.transaction.add(ix);
    }
    return this;
  }

  setGaslessType(gaslessType: GaslessTypes): GaslessTransaction {
    this.gaslessType = gaslessType;
    return this;
  }

  async getPuzzleAndEstimateTime(): Promise<{ puzzle: SignedPuzzle; estHandlingTime: number }> {
    if (this.gaslessType !== GaslessTypes.POW) {
      throw Error(`${this.gaslessType} not supported`);
    }
    const puzzle = await getPuzzle(this.connection, this.wallet.publicKey);
    return { puzzle, estHandlingTime: POWPuzzle.estHandlingTime(puzzle) };
  }

  async solveAndSubmit(puzzle: SignedPuzzle): Promise<string> {
    if (this.gaslessType !== GaslessTypes.POW) {
      throw Error(`${this.gaslessType} not supported`);
    }
    const { feePayer } = await getGaslessInfo(this.connection);
    const txid = await this._solveAndSubmitPuzzle(feePayer, puzzle);
    return txid;
  }

  async buildAndExecute(): Promise<string> {
    // Automatically detect the dapp type
    if (this.dapp.hasDappInstruction(this.transaction)) {
      this.gaslessType = GaslessTypes.Dapp;
    }
    const { feePayer } = await getGaslessInfo(this.connection);

    if (this.gaslessType === GaslessTypes.Dapp) {
      this.transaction = await this.dapp.build(this.transaction, this.wallet.publicKey, feePayer);
      this.transaction.feePayer = feePayer;
      this.transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
      for (let i = 0; i < this.signers.length; i++) {
        const s = this.signers[i];
        this.transaction.sign(s);
      }
      this.transaction = await this.wallet.signTransaction(this.transaction);
      const txid = await sendToGasless(this.connection, this.transaction, this.gaslessType);
      return txid;
    } else if (this.gaslessType === GaslessTypes.POW) {
      const puzzle = await getPuzzle(this.connection, this.wallet.publicKey);
      const txid = await this._solveAndSubmitPuzzle(feePayer, puzzle);
      return txid;
    } else {
      throw Error(`${this.gaslessType} not supported`);
    }
  }

  private async _solveAndSubmitPuzzle(feePayer: PublicKey, puzzle: SignedPuzzle): Promise<string> {
    const solution = await POWPuzzle.solveAsync(Question.fromObject(puzzle.question));
    const rawSolution: RawSubmitSolution = {
      address: this.wallet.publicKey.toBase58(),
      solution: solution.toString(16),
      ...puzzle,
    };

    // pay for initializing mint account fee if needed
    this.transaction = TokenUtil.replaceFundingAccountOfCreateMintAccountIx(
      this.transaction,
      feePayer
    );

    // pay for initializing token account fee if needed
    this.transaction = TokenUtil.replaceFundingAccountOfCreateATAIx(this.transaction, feePayer);

    // check if we can submit solution at this point (now >= puzzle.allowedSubmissionAt)
    const now = Math.floor(Date.now() / 1000);
    if (puzzle.allowedSubmissionAt && now < puzzle.allowedSubmissionAt) {
      await sleep((puzzle.allowedSubmissionAt - now) * 1000);
    }

    this.transaction.feePayer = feePayer;
    this.transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;

    for (let i = 0; i < this.signers.length; i++) {
      const s = this.signers[i];
      this.transaction.sign(s);
    }
    this.transaction = await this.wallet.signTransaction(this.transaction);
    const txid = await postSolution(this.connection, rawSolution, this.transaction);
    return txid;
  }

  asyncBuildAndExecute(cb: (error: any, txid: string) => void): void {
    setTimeout(async () => {
      try {
        const txid = await this.buildAndExecute();
        cb(null, txid);
      } catch (e) {
        cb(e, "");
      }
    }, 0);
  }
}
