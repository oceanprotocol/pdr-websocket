import {
  TPredValDataHolderItem,
  predValDataHolder,
} from "../../datafeed/dataHolder";
import { predictoorWallet } from "../../utils/appconstants";
import { TGetMultipleAggPredValsByEpochArgs } from "./getMultipleAggPredValsByEpoch.types";

export const getMultipleAggPredValsByEpoch = ({
  currentTs,
  secondsPerEpoch,
  epochs,
  contracts,
  authorizationInstance,
}: TGetMultipleAggPredValsByEpochArgs): Promise<
  Array<TPredValDataHolderItem & { contractAddress: string }>
> =>
  Promise.all(
    epochs.flatMap((epoch) =>
      contracts.map(async (contract) => {
        const cachedValue = predValDataHolder.getItemFromContractByItemKeyValue(
          contract.address,
          "epoch",
          epoch
        );
        if (cachedValue) {
          return { ...cachedValue, contractAddress: contract.address };
        }
        const predVal = {
          ...(await contract.getAggPredval(
            epoch,
            predictoorWallet,
            authorizationInstance.getAuthorizationData()
          )),
          epoch,
          currentTs,
          epochStartTs: epoch,
          secondsPerEpoch,
        };
        predValDataHolder.setItemToContract(contract.address, predVal);
        return { ...predVal, contractAddress: contract.address };
      })
    )
  );
