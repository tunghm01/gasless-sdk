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

const exampleDapps: DappInfo[] = [
  {
    name: "NemoSwap",
    programId: "7Vd9eYAH2MZxD6LYHEnDs8Eko9Bx3UydvtNvnJ8vKW21",
    idl: WhirlpoolIDL,
  },
];

export function loadArtifacts(network: NetworkConfig): Artifact[] {
  const artifacts: Artifact[] = [];

  // user network to get dapps info
  const dapps = exampleDapps; // get from gasless

  if (dapps.length > 0) {
    dapps.forEach((dapp) => {
      artifacts.push({
        name: dapp.name,
        programId: new PublicKey(dapp.programId),
        coder: new BorshCoder(dapp.idl as Idl),
      });
    });
  }
  return artifacts;
}
