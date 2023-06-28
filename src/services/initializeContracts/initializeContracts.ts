import Predictoor from "../../utils/contracts/Predictoor";
import { TInitializeContractsArgs } from "./initializeContracts.types";
import { networkProvider } from "../../utils/networkProvider";

export const initializeContracts = async ({
  contracts,
}: TInitializeContractsArgs): Promise<Array<Predictoor>> =>
  await Promise.all(
    contracts.map(async (contract) => {
      const predictoor = new Predictoor(
        contract.address,
        networkProvider.getProvider()
      );
      await predictoor.init();
      return predictoor;
    })
  );
