import {
  TGetContractsSubscriptionArgs,
  TGetContractsSubscriptionResult,
} from "./getContractsSubscription.types";

import Predictoor from "../../utils/contracts/Predictoor";
import { getFilteredOrders } from "../../utils/subgraphs/getFilteredOrders";
import { getSubscriptionDetails } from "../getSubscriptionDetails";
import { overlapBlockCount } from "../../utils/appconstants";

export const getContractsSubscription = async ({
  predictoorProps,
  user,
  provider,
}: TGetContractsSubscriptionArgs): Promise<TGetContractsSubscriptionResult | null> => {
  try {
    const predictorContract = new Predictoor(predictoorProps.address, provider, predictoorProps);
    await predictorContract.init();

    const subscription = await predictorContract.getSubscriptions(user.address);

    const expireBlock = parseInt(subscription.expires.toString());

    const orders =
      (await getFilteredOrders(predictoorProps.address, user.address))?.data
        ?.orders || [];

    return {
      predictionContract: predictoorProps,
      expires: expireBlock,
      orders: orders,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return null;
};
