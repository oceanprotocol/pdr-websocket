import Predictoor from "../../utils/contracts/Predictoor";
import { initializeAutorization } from "../initializeAuthorization";

export type TGetMultipleAggPredValsByEpochArgs = {
  currentBlockNumber: number;
  epochStartBlockNumber: number;
  secondsPerEpoch: number;
  epochs: Array<number>;
  contracts: Array<Predictoor>;
  authorizationInstance: Awaited<ReturnType<typeof initializeAutorization>>;
};
