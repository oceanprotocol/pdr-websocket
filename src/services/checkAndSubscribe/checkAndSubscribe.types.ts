import Predictoor from "../../utils/contracts/Predictoor";
import { TPredictionContract } from "../../utils/subgraphs/getAllInterestingPredictionContracts";

export type TCheckAndSubscribeArgs = {
  predictoorContracts: Array<Predictoor>;
  currentEpoch: number;
  startedTransactions?: Array<string>;
};

export type TCheckAndSubscribeResult = Array<{
  active: boolean,
  predictorContract: Predictoor;
  expires: number;
}>;
