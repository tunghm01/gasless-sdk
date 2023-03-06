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
