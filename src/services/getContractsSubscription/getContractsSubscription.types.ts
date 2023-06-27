import { Maybe } from "../../utils/utilitytypes";
import { TGetFilteredOrdersQueryResult } from "../../utils/subgraphs/queries/getFilteredOrdersQuery";
import { TPredictionContract } from "../../utils/subgraphs/getAllInterestingPredictionContracts";
import { ethers } from "ethers";

export type TGetContractsSubscriptionResult = {
  predictionContract: TPredictionContract;
  expires: Maybe<number>;
  orders: Maybe<TGetFilteredOrdersQueryResult["orders"]>;
};

export type TGetContractsSubscriptionArgs = {
  predictoorProps: TPredictionContract;
  user: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
};
