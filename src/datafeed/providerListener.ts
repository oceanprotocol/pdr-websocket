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

  const [predictoorContracts, currentBlock] = await Promise.all([
    initializeContracts({
      contracts: Object.values(contracts),
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

  console.log("provider", provider);
  provider.on("block", async (blockNumber) => {
    console.log("blockNumber", blockNumber)
    const currentEpoch = Math.floor(blockNumber / BPE);

    const renewPredictoors = subscribedPredictoors.filter(
      ({ expires }) => expires < blockNumber + overlapBlockCount
    );

    if (renewPredictoors.length > 0) {
      checkAndSubscribe({
        predictoorContracts: renewPredictoors.map(
          ({ predictorContract }) => predictorContract
        ),
        currentBlock: blockNumber,
      }).then((renewedPredictoors) => {
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

    console.log("currentEpoch Start", currentEpoch)
    latestEpoch = currentEpoch;

    const currentPredictorContracts = subscribedPredictoors.map(
      ({ predictorContract }) => predictorContract
    );
    const predictionEpochs = [
      BPE * (currentEpoch - 1),
      BPE * currentEpoch,
      BPE * (currentEpoch + 1),
    ];
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
