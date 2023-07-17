import Predictoor from "../../utils/contracts/Predictoor";

export type TGetMultipleAggPredValsByEpochArgs = {
  currentBlockNumber: number;
  epochStartBlockNumber: number;
  blocksPerEpoch: number;
  epochs: Array<number>;
  contracts: Array<Predictoor>;
};
