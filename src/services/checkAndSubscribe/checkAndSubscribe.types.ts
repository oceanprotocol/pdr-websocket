import Predictoor from "../../utils/contracts/Predictoor";
import { TPredictionContract } from "../../utils/subgraphs/getAllInterestingPredictionContracts";

export type TCheckAndSubscribeArgs = {
  predictoorContracts: Array<Predictoor>;
  currentBlock: number;
  startedTransactions?: Array<string>;
  contracts: Record<string, TPredictionContract>;
};

export type TCheckAndSubscribeResult = Array<{
  predictorContract: Predictoor;
  expires: number;
}>;
