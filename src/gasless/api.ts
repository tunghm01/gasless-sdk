import axios from "axios";
import base58 from "bs58";
import { Connection, Transaction, PublicKey } from "@solana/web3.js";
import { GaslessTypes, NetworkConfig, SignedPuzzle, RawSubmitSolution } from "./types";
import configs from "../configs.json";

export async function getNetwork(connection: Connection): Promise<NetworkConfig> {
  const genesisHash = await connection.getGenesisHash();
  const network: NetworkConfig | undefined = configs.find((obj) => obj.genesisHash === genesisHash);
  if (!network) {
    throw new Error(`Network is unknown. Please connect to Renec mainnet or testnet.`);
  }
  return network;
}

export async function getGaslessInfo(connection: Connection) {
  const network = await getNetwork(connection);
  const response = (
    await axios.get(network.gasLessServiceURL, {
      headers: { Accept: "application/json" },
    })
  ).data;
  const feePayer = new PublicKey(response.feePayer);
  return { feePayer };
}

export async function sendToGasless(
  connection: Connection,
  signed: Transaction,
  type: GaslessTypes
): Promise<string> {
  const network = await getNetwork(connection);
  const buff = signed.serialize({ requireAllSignatures: false });
  const serializedBs58 = base58.encode(buff);
  const response = (
    await axios.post(network.gasLessServiceURL + `/v1/dapp/send`, {
      transaction: serializedBs58,
    })
  ).data;
  const txid = response?.signature;
  return txid;
}

export async function getPendingPuzzles(
  connection: Connection,
  address: PublicKey
): Promise<number> {
  const network = await getNetwork(connection);
  const response = (
    await axios.get(network.gasLessServiceURL + `/v1/pow/pending-puzzles`, {
      headers: { Accept: "application/json" },
      params: {
        userAddress: address.toBase58(),
      },
    })
  ).data;

  const pendingPuzzles = response?.pendingPuzzles;
  return pendingPuzzles as number;
}

export async function getPuzzle(connection: Connection, address: PublicKey): Promise<SignedPuzzle> {
  const network = await getNetwork(connection);
  const response = (
    await axios.get(network.gasLessServiceURL + `/v1/pow/puzzle`, {
      headers: { Accept: "application/json" },
      params: {
        userAddress: address.toBase58(),
      },
    })
  ).data;

  const puzzle = response?.puzzle;
  return puzzle as SignedPuzzle;
}

export async function postSolution(
  connection: Connection,
  rawSolution: RawSubmitSolution,
  signed: Transaction
): Promise<string> {
  const network = await getNetwork(connection);
  const buff = signed.serialize({ requireAllSignatures: false });
  const serializedBs58 = base58.encode(buff);
  const response = (
    await axios.post(network.gasLessServiceURL + `/v1/pow/solution`, {
      solution: rawSolution,
      transaction: serializedBs58,
    })
  ).data;
  const txid = response?.signature;
  return txid;
}
