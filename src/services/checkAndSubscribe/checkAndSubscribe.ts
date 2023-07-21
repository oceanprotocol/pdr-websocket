import Predictoor from "../../utils/contracts/Predictoor";
import {
  TCheckAndSubscribeArgs,
  TCheckAndSubscribeResult,
} from "./checkAndSubscribe.types";
import { overlapBlockCount, predictoorWallet } from "../../utils/appconstants";

export const checkAndSubscribe = async ({
  predictoorContracts,
  currentBlock,
  startedTransactions,
}: TCheckAndSubscribeArgs): Promise<TCheckAndSubscribeResult> =>
  await Promise.all(
    predictoorContracts.map(async (predictorContract) => {
      const subscription = await predictorContract.getSubscriptions(
        predictoorWallet.address
      );

      let expirationBlock = subscription.expires.toNumber();
      const isValid = expirationBlock > currentBlock + overlapBlockCount;

      if (!isValid) {
        startedTransactions.push(predictorContract.address);
        await predictorContract.buyAndStartSubscription(predictoorWallet);
        const subscription = await predictorContract.getSubscriptions(
          predictoorWallet.address
        );

        expirationBlock = subscription.expires.toNumber();
      }

      return {
        predictorContract,
        expires: expirationBlock,
      };
    })
  );
