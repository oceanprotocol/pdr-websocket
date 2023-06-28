import { TGetSubscriptionDetailsArgs } from "./getSubscriptionDetails.types";
import { TGetSubscriptions } from "../../utils/contracts/ContractReturnTypes";

export const getSubscriptionDetails = ({
  predictorContract,
  userAddress,
  provider,
}: TGetSubscriptionDetailsArgs): Promise<
  [TGetSubscriptions, number, boolean, number]
> =>
  Promise.all([
    predictorContract.getSubscriptions(userAddress),
    provider.getBlockNumber(),
    predictorContract.isValidSubscription(userAddress),
    predictorContract.getCurrentEpoch(),
  ]);
