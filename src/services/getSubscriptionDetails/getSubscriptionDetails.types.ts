import Predictoor from "../../utils/contracts/Predictoor";
import { ethers } from "ethers";

export type TGetSubscriptionDetailsArgs = {
  predictorContract: Predictoor;
  userAddress: string;
  provider: ethers.providers.JsonRpcProvider;
};
