import Predictoor from "../../utils/contracts/Predictoor";

export type TCheckAndSubscribeArgs = {
  predictoorContracts: Array<Predictoor>;
  currentBlock: number;
};

export type TCheckAndSubscribeResult = Array<{
  predictorContract: Predictoor;
  expires: number;
}>;