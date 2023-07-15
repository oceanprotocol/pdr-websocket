import { currentConfig, overlapBlockCount } from "../utils/appconstants";
import { checkAndSubscribe } from "../services/checkAndSubscribe";
import {
  TPredictionContract,
  getAllInterestingPredictionContracts,
} from "../utils/subgraphs/getAllInterestingPredictionContracts";
import { initializeContracts } from "../services/initializeContracts";
import { networkProvider } from "../utils/networkProvider";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { createDataHolders } from "../services/createDataHolders";
import { getMultipleAggPredValsByEpoch } from "../services/getMultipleAggPredValsByEpoch";
import { clearPredValDataHolderByEpochs } from "../services/clearPredValDataHolderByEpochs";
import { TGetAggPredvalResult } from "../utils/contracts/ContractReturnTypes";
import { predValDataHolder } from "./dataHolder";
import { calculatePredictionEpochs } from "../utils/utils";

let latestEpoch = 0;

type TProviderListenerArgs = {
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
};

export type TProviderListenerEmitData = Array<{
  predictions: Array<
    TGetAggPredvalResult & {
      epoch: number;
      contractAddress: string;
    }
  >;
  contractInfo: TPredictionContract;
}>;

export const providerListener = async ({ io }: TProviderListenerArgs) => {
  const provider = networkProvider.getProvider();
  const contracts = await getAllInterestingPredictionContracts(
    currentConfig.subgraph
  );

  const filteredContracts = Object.values(contracts).filter((item) =>
    currentConfig.opfProvidedPredictions.includes(item.address)
  );

  const [predictoorContracts, currentBlock] = await Promise.all([
    initializeContracts({
      contracts: filteredContracts,
    }),
    provider.getBlockNumber(),
  ]);

  const subscribedPredictoors = await checkAndSubscribe({
    predictoorContracts,
    currentBlock,
  });

  createDataHolders({
    contracts: subscribedPredictoors.map((item) => item.predictorContract),
  });

  const BPE =
    await subscribedPredictoors[0]?.predictorContract.getBlocksPerEpoch();

  let startedTransactions = [];
  provider.on("block", async (blockNumber) => {
    const currentEpoch = Math.floor(blockNumber / BPE);

    const renewPredictoors = subscribedPredictoors.filter(
      ({ expires }) => expires < blockNumber + overlapBlockCount
    );

    const filteredRenewPredictoors = renewPredictoors.filter(
      ({ predictorContract }) =>
        !startedTransactions.includes(predictorContract.address)
    );
    if (filteredRenewPredictoors.length > 0) {
      startedTransactions.push(
        ...filteredRenewPredictoors.map(
          ({ predictorContract }) => predictorContract.address
        )
      );
      checkAndSubscribe({
        predictoorContracts: filteredRenewPredictoors.map(
          ({ predictorContract }) => predictorContract
        ),
        currentBlock: blockNumber,
      }).then((renewedPredictoors) => {
        startedTransactions = startedTransactions.filter(
          (address) =>
            !renewedPredictoors.some(
              ({ predictorContract }) => predictorContract.address === address
            )
        );

        renewedPredictoors.forEach((renewedPredictoor) => {
          const index = subscribedPredictoors.findIndex(
            ({ predictorContract }) =>
              predictorContract.address ===
              renewedPredictoor.predictorContract.address
          );

          subscribedPredictoors[index] = renewedPredictoor;
        });
      });
    }

    //const epochFromContract =
    //  await subscribedPredictoors[0]?.predictorContract.getCurrentEpoch();
    //console.log("currentEpoch", currentEpoch, "epochFromContract",epochFromContract);

    if (currentEpoch === latestEpoch) return;

    latestEpoch = currentEpoch;

    const currentPredictorContracts = subscribedPredictoors.map(
      ({ predictorContract }) => predictorContract
    );
    const predictionEpochs = calculatePredictionEpochs(currentEpoch, BPE);

    const aggPredVals = await getMultipleAggPredValsByEpoch({
      epochs: predictionEpochs,
      contracts: currentPredictorContracts,
    });

    clearPredValDataHolderByEpochs({
      epochs: predictionEpochs,
      contracts: currentPredictorContracts,
    });

    const result = currentPredictorContracts.map((predictorContract) => ({
      predictions: aggPredVals.filter(
        (item) => item.contractAddress === predictorContract.address
      ),
      contractInfo: contracts[predictorContract.address],
    }));

    predValDataHolder.theFixedMessage = result;
    console.log("newEpoch", result);
    io.emit("newEpoch", result);
  });
};
