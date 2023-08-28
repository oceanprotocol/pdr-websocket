import Predictoor from "../../utils/contracts/Predictoor";
import { PromiseReturnType } from "../../utils/utilitytypes";
import { initializeAutorization } from "../initializeAuthorization";

export type TGetMultipleAggPredValsByEpochArgs = {
  currentTs: number;
  secondsPerEpoch: number;
  epochs: Array<number>;
  contracts: Array<Predictoor>;
  authorizationInstance: PromiseReturnType<typeof initializeAutorization>;
};
