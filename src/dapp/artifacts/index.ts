import axios from "axios";
import { PublicKey } from "@solana/web3.js";
import { BorshCoder, Idl } from "@project-serum/anchor";
import WhirlpoolIDL from "./whirlpool.json";
import { NetworkConfig } from "../../gasless";

export type Artifact = {
  name: string;
  programId: PublicKey;
  coder: BorshCoder;
};

export type DappInfo = {
  name: string;
  programId: string;
  idl: Object;
};

const dappsDevnet: DappInfo[] = [
  {
    name: "NemoSwap",
    programId: "7yyFRQehBQjdSpWYV93jWh4558YbWmc4ofbMWzKTPyJL",
    idl: WhirlpoolIDL,
  },
];

const dappsTestnet: DappInfo[] = [
  {
    name: "NemoSwap",
    programId: "7yyFRQehBQjdSpWYV93jWh4558YbWmc4ofbMWzKTPyJL",
    idl: WhirlpoolIDL,
  },
];

const dappsMainnet: DappInfo[] = [
  {
    name: "NemoSwap",
    programId: "7rh7ZtPzHqdY82RWjHf1Q8NaQiWnyNqkC48vSixcBvad",
    idl: WhirlpoolIDL,
  },
];

const dapps = {
  devnet: dappsDevnet,
  testnet: dappsTestnet,
  mainnet: dappsMainnet,
};

export function loadArtifacts(network: NetworkConfig): Artifact[] {
  const artifacts: Artifact[] = [];

  // use network to get dapps info
  if (network.name !== "devnet" && network.name !== "testnet" && network.name !== "mainnet") {
    throw new Error("network is unsupport");
  }
  const _dapps = dapps[network.name];

  if (_dapps.length > 0) {
    _dapps.forEach((dapp) => {
      artifacts.push({
        name: dapp.name,
        programId: new PublicKey(dapp.programId),
        coder: new BorshCoder(dapp.idl as Idl),
      });
    });
  }
  return artifacts;
}
