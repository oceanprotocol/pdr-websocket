import Predictoor from "../../utils/contracts/Predictoor";

export type TGetMultipleAggPredValsByEpochArgs = {
  epochs: Array<number>;
  contracts: Array<Predictoor>;
};
