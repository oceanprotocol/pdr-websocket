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
      let isValid = expirationTs > currentEpoch;

     if (!isValid) {
        await predictorContract.buyAndStartSubscription(predictoorWallet);
        const subscription = await predictorContract.getSubscriptions(
          predictoorWallet.address
        );
        if(subscription) isValid = true
        expirationTs = subscription.expires.toNumber();
      }

      return {
        active: isValid,
        predictorContract,
        expires: expirationTs,
      };
    })
  );
