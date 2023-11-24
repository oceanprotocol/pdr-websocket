import Predictoor from "../../utils/contracts/Predictoor";
import {
  TCheckAndSubscribeArgs,
  TCheckAndSubscribeResult,
} from "./checkAndSubscribe.types";
import { overlapBlockCount, predictoorWallet } from "../../utils/appconstants";

export const checkAndSubscribe = async ({
  predictoorContracts,
  currentEpoch,
  startedTransactions,
}: TCheckAndSubscribeArgs): Promise<TCheckAndSubscribeResult> =>
  await Promise.all(
    predictoorContracts.map(async (predictorContract) => {
      startedTransactions?.push(predictorContract.address);

      const subscription = await predictorContract.getSubscriptions(
        predictoorWallet.address
      );

      let expirationTs = subscription.expires.toNumber();
      const isValid = expirationTs > currentEpoch;

      if (!isValid) {
        await predictorContract.buyAndStartSubscription(predictoorWallet);
        const subscription = await predictorContract.getSubscriptions(
          predictoorWallet.address
        );

        expirationTs = subscription.expires.toNumber();
      }

      return {
        predictorContract,
        expires: expirationTs,
      };
    })
  );
