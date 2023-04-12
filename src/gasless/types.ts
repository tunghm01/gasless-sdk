import { QuestionObject } from "../pow";

export type NetworkConfig = {
  name: string;
  genesisHash: string;
  gasLessServiceURL: string;
};

export enum GaslessTypes {
  POW = "pow",
  Dapp = "dapp",
  Pay = "pay",
}

export type SignedPuzzle = {
  question: QuestionObject;
  expired: number;
  allowedSubmissionAt: number;
  signature: string;
  feePayer: string;
};

export type RawSubmitSolution = { address: string; solution: string } & SignedPuzzle;
