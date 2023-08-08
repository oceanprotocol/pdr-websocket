import Predictoor from "../../utils/contracts/Predictoor";

export type TCheckAndSubscribeArgs = {
  predictoorContracts: Array<Predictoor>;
  currentTs: number;
  startedTransactions?: Array<string>;
};

export type TCheckAndSubscribeResult = Array<{
  predictorContract: Predictoor;
  expires: number;
}>;
