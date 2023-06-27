import {
  TGetContractsSubscriptionResult,
  getContractsSubscription,
} from "../getContractsSubscription";

import { Maybe } from "../../utils/utilitytypes";
import { TUpdatePredictorSubscriptionsArgs } from "./updatePredictorSubscriptions.types";
import { ethers } from "ethers";
import { filterOutUnwantedTypes } from "../../utils/helpers/filterOutUnwantedTypes";
import { getAllInterestingPredictionContracts } from "../../utils/subgraphs/getAllInterestingPredictionContracts";

export const updatePredictoorSubscriptions = async ({
  config,
  user,
  provider,
}: TUpdatePredictorSubscriptionsArgs): Promise<
  Maybe<Array<TGetContractsSubscriptionResult>>
> => {
  try {
    // retrieve all contract details from subgraph
    const predictoorContract = await getAllInterestingPredictionContracts(
      config.subgraph
    );

    // iterate through all deployed predictoors and buy a subscription
    return filterOutUnwantedTypes(
      await Promise.all(
        Object.values(predictoorContract).map((predictoorProps) =>
          getContractsSubscription({ predictoorProps, user, provider })
        )
      )
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return null;
};
