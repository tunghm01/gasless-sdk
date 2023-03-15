import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import { getMinimumBalanceForRentExemptAccount } from "@solana/spl-token";
import { getNetwork } from "../gasless/api";
import { NetworkConfig } from "../gasless";
import { Artifact, loadArtifacts } from "./artifacts";
import { TokenUtil } from "../helpers/token-util";

export type DappInstruction = { name: string; decodedData: object } & TransactionInstruction;

export class GaslessDapp {
  constructor(
    readonly connection: Connection,
    readonly network: NetworkConfig,
    readonly dapps: Artifact[]
  ) {}

  static async new(connection: Connection): Promise<GaslessDapp> {
    const network = await getNetwork(connection);
    const dapps = await loadArtifacts(network);
    return new GaslessDapp(connection, network, dapps);
  }

  decodeTransaction(transaction: Transaction): DappInstruction[] {
    let dappIxs: DappInstruction[] = [];
    transaction.instructions.forEach((ix) => {
      const dapp = this.dapps.find((dapp) => ix.programId.equals(dapp.programId));
      if (dapp) {
        const decoded = dapp.coder.instruction.decode(ix.data);
        if (decoded) {
          dappIxs.push({ name: dapp.name, decodedData: decoded.data, ...ix });
        }
      }
    });
    return dappIxs;
  }

  hasDappInstruction(transaction: Transaction): boolean {
    const dappIxs = this.decodeTransaction(transaction);
    return dappIxs.length > 0 ? true : false;
  }

  async addBorrowRepayForRentExemption(
    transaction: Transaction,
    wallet: PublicKey,
    feePayer: PublicKey
  ): Promise<Transaction> {
    const rentExemption = await getMinimumBalanceForRentExemptAccount(this.connection);
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: feePayer,
        toPubkey: wallet,
        lamports: rentExemption,
      })
    );
    tx.add(transaction);
    tx.add(
      SystemProgram.transfer({
        fromPubkey: wallet,
        toPubkey: feePayer,
        lamports: rentExemption,
      })
    );
    return tx;
  }

  async build(
    transaction: Transaction,
    wallet: PublicKey,
    feePayer: PublicKey
  ): Promise<Transaction> {
    if (!this.hasDappInstruction(transaction)) {
      throw Error(`dapp instruction not found`);
    }
    const account = TokenUtil.hasInitializeNativeTokenAccountIx(transaction);
    if (account) {
      const isClosed = TokenUtil.hasCloseTokenAccountIx(transaction, account);
      const balance = await this.connection.getBalanceAndContext(wallet);
      if (balance.value === 0 && isClosed) {
        transaction = await this.addBorrowRepayForRentExemption(transaction, wallet, feePayer);
      }
    }
    return transaction;
  }
}
