import Predictoor from "../../utils/contracts/Predictoor";
import { initializeAutorization } from "../initializeAuthorization";

export type TGetMultipleAggPredValsByEpochArgs = {
  currentTs: number;
  epochStartTs: number;
  secondsPerEpoch: number;
  epochs: Array<number>;
  contracts: Array<Predictoor>;
  authorizationInstance: Awaited<ReturnType<typeof initializeAutorization>>;
};
