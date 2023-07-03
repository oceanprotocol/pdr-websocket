import { predValDataHolder } from "../../datafeed/dataHolder";
import { TCreateDataHoldersArgs } from "./createDataHolders.types";

export const createDataHolders = ({ contracts }: TCreateDataHoldersArgs) =>
  contracts.forEach((contract) => {
    predValDataHolder.setContract(contract.address, []);
  });
