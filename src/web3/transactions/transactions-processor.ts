import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { Commitment, Connection, PublicKey, Signer, Transaction } from "@solana/web3.js";
import { SendTxRequest } from "./types";

export class TransactionProcessor {
  constructor(
    readonly connection: Connection,
    readonly wallet: Wallet,
    readonly commitment: Commitment = "confirmed"
  ) {}

  public async signTransaction(txRequest: SendTxRequest): Promise<{
    transaction: Transaction;
    lastValidBlockHeight: number;
    blockhash: string;
  }> {
    const { transactions, lastValidBlockHeight, blockhash } = await this.signTransactions([
      txRequest,
    ]);
    return { transaction: transactions[0], lastValidBlockHeight, blockhash };
  }

  public async signTransactions(txRequests: SendTxRequest[]): Promise<{
    transactions: Transaction[];
    lastValidBlockHeight: number;
    blockhash: string;
  }> {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash(
      this.commitment
    );
    const feePayer = this.wallet.publicKey;
    const pSignedTxs = txRequests.map((txRequest) => {
      return rewriteTransaction(txRequest, feePayer, blockhash);
    });
    const transactions = await this.wallet.signAllTransactions(pSignedTxs);
    return {
      transactions,
      lastValidBlockHeight,
      blockhash,
    };
  }

  public async sendTransaction(
    transaction: Transaction,
    lastValidBlockHeight: number,
    blockhash: string
  ): Promise<string> {
    const execute = this.constructSendTransactions([transaction], lastValidBlockHeight, blockhash);
    const txs = await execute();
    const ex = txs[0];
    if (ex.status === "fulfilled") {
      return ex.value;
    } else {
      throw ex.reason;
    }
  }

  public constructSendTransactions(
    transactions: Transaction[],
    lastValidBlockHeight: number,
    blockhash: string,
    parallel: boolean = true
  ): () => Promise<PromiseSettledResult<string>[]> {
    const executeTx = async (tx: Transaction) => {
      const rawTxs = tx.serialize();
      return this.connection.sendRawTransaction(rawTxs, {
        preflightCommitment: this.commitment,
      });
    };

    const confirmTx = async (txId: string) => {
      const result = await this.connection.confirmTransaction(
        {
          signature: txId,
          lastValidBlockHeight: lastValidBlockHeight,
          blockhash,
        },
        this.commitment
      );

      if (result.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(result.value)}`);
      }
    };

    return async () => {
      if (parallel) {
        const results = transactions.map(async (tx) => {
          const txId = await executeTx(tx);
          await confirmTx(txId);
          return txId;
        });

        return Promise.allSettled(results);
      } else {
        const results = [];
        for (const tx of transactions) {
          const txId = await executeTx(tx);
          await confirmTx(txId);
          results.push(txId);
        }
        return Promise.allSettled(results);
      }
    };
  }

  public async signAndConstructTransaction(txRequest: SendTxRequest): Promise<{
    signedTx: Transaction;
    execute: () => Promise<string>;
  }> {
    const { transaction, lastValidBlockHeight, blockhash } = await this.signTransaction(txRequest);
    return {
      signedTx: transaction,
      execute: async () => this.sendTransaction(transaction, lastValidBlockHeight, blockhash),
    };
  }

  public async signAndConstructTransactions(
    txRequests: SendTxRequest[],
    parallel: boolean = true
  ): Promise<{
    signedTxs: Transaction[];
    execute: () => Promise<PromiseSettledResult<string>[]>;
  }> {
    const { transactions, lastValidBlockHeight, blockhash } = await this.signTransactions(
      txRequests
    );
    const execute = this.constructSendTransactions(
      transactions,
      lastValidBlockHeight,
      blockhash,
      parallel
    );
    return { signedTxs: transactions, execute };
  }
}

function rewriteTransaction(txRequest: SendTxRequest, feePayer: PublicKey, blockhash: string) {
  const signers = txRequest.signers ?? [];
  const tx = txRequest.transaction;
  tx.feePayer = feePayer;
  tx.recentBlockhash = blockhash;
  signers.filter((s): s is Signer => s !== undefined).forEach((keypair) => tx.partialSign(keypair));
  return tx;
}
