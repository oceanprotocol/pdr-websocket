import {
  PREDICTION_FETCH_EPOCHS_DELAY,
  currentConfig,
  overlapBlockCount,
  predictoorWallet,
} from "../utils/appconstants";
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
import { initializeAutorization } from "../services/initializeAuthorization";

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
  const [contracts, authorizationInstance] = await Promise.all([
    getAllInterestingPredictionContracts(currentConfig.subgraph),
    initializeAutorization({
      walletAddress: predictoorWallet.address,
    }),
  ]);

  const [predictoorContracts, currentBlock] = await Promise.all([
    initializeContracts({
      contracts: Object.values(contracts),
    }),
    provider.getBlockNumber(),
  ]);
  let block = await provider.getBlock(currentBlock);
  let currentTs = block.timestamp
  const subscribedPredictoors = await checkAndSubscribe({
    predictoorContracts,
    currentTs,
  });

  createDataHolders({
    contracts: subscribedPredictoors.map((item) => item.predictorContract),
  });

  const SPE =
    await subscribedPredictoors[0]?.predictorContract.getSecondsPerEpoch();

  let startedTransactions: Array<string> = [];

  provider.on("block", async (blockNumber) => {
    let block = await provider.getBlock(blockNumber);
    let currentTs = block.timestamp;
    const currentEpoch = Math.floor(currentTs / SPE);
    const currentEpochStartTs =
      await subscribedPredictoors[0]?.predictorContract.getCurrentEpochStartTs(
        currentTs
      );

    const renewPredictoors = subscribedPredictoors.filter(
      ({ expires }) => expires < currentTs + overlapBlockCount
    );

    checkAndSubscribe({
      predictoorContracts: renewPredictoors
        .map(({ predictorContract }) => predictorContract)
        .filter((item) => !startedTransactions.includes(item.address)),
      currentTs,
      startedTransactions: startedTransactions,
    }).then((renewedPredictoors) => {
      renewedPredictoors.forEach((renewedPredictoor) => {
        const index = subscribedPredictoors.findIndex(
          ({ predictorContract }) =>
            predictorContract.address ===
            renewedPredictoor.predictorContract.address
        );
        subscribedPredictoors[index] = renewedPredictoor;
        startedTransactions = startedTransactions.filter(
          (item) => item !== renewedPredictoor.predictorContract.address
        );
      });
    });

    if (
      currentTs - latestEpoch * SPE <
      SPE + PREDICTION_FETCH_EPOCHS_DELAY
    )
      return
    //console.log("startedTransactions", startedTransactions);

    latestEpoch = currentEpoch;
    const currentPredictorContracts = subscribedPredictoors.map(
      ({ predictorContract }) => predictorContract
    );
    const predictionEpochs = calculatePredictionEpochs(currentEpoch, SPE);

    const aggPredVals = await getMultipleAggPredValsByEpoch({
      currentTs,
      epochStartTs: currentEpochStartTs,
      secondsPerEpoch: SPE,
      epochs: predictionEpochs,
      contracts: currentPredictorContracts,
      authorizationInstance,
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
    //console.log("newEpoch", JSON.stringify(result));
    io.emit("newEpoch", result);
  });
};
