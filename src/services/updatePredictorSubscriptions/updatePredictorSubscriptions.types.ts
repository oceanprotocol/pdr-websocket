import { ethers } from "ethers";

export type TUpdatePredictorSubscriptionsArgs = {
  config: any;
  user: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
};
