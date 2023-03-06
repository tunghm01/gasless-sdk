import {
  Connection,
  Signer,
  Transaction,
  TransactionInstruction,
  PublicKey,
} from "@solana/web3.js";
import { getGaslessInfo } from "./api";
import { GaslessDapp } from "../dapp";
import { GaslessTypes } from "./types";

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
    readonly walletPub: PublicKey,
    readonly dapp: GaslessDapp,
    gaslessType: GaslessTypes = GaslessTypes.POW
  ) {
    this.transaction = new Transaction();
    this.signers = [];
    this.gaslessType = gaslessType;
  }

  static fromTransactionBuilder(
    connection: Connection,
    walletPub: PublicKey,
    compressIx: CompressedIx,
    dapp: GaslessDapp
  ): GaslessTransaction {
    const { instructions, cleanupInstructions, signers } = compressIx;

    const _this = new GaslessTransaction(connection, walletPub, dapp);

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

  async build(gaslessType?: GaslessTypes): Promise<Transaction> {
    if (gaslessType) {
      this.gaslessType = gaslessType;
    } else {
      // Automatically detect the dapp type
      if (this.dapp.hasDappInstruction(this.transaction)) {
        this.gaslessType = GaslessTypes.Dapp;
      }
    }
    const { feePayer } = await getGaslessInfo(this.connection);

    if (this.gaslessType === GaslessTypes.Dapp) {
      this.transaction = await this.dapp.build(this.transaction, this.walletPub, feePayer);
    }
    if (this.gaslessType === GaslessTypes.POW) {
    } else {
      throw Error(`${this.gaslessType} not supported`);
    }
    this.transaction.feePayer = feePayer;
    this.transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;

    for (let i = 0; i < this.signers.length; i++) {
      const s = this.signers[i];
      this.transaction.sign(s);
    }
    return this.transaction;
  }
}
