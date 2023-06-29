import { predValDataHolder } from "../../datafeed/dataHolder";
import { TClearPredValDataHolderByEpochsArgs } from "./clearPredValDataHolderByEpochs.types";

export const clearPredValDataHolderByEpochs = ({
  epochs,
  contracts,
}: TClearPredValDataHolderByEpochsArgs) =>
  contracts.forEach((contract) => {
    predValDataHolder.removeItemFromContractByItemKeyValue(
      contract.address,
      "epoch",
      epochs
    );
  });
