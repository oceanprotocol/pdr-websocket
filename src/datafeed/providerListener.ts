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
import { EEpochEmitterNames } from "../metadata/config";

let latestEpoch = 0;

type TProviderListenerArgs = {
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  contractAddresses: string[];
  epochEmitterName: EEpochEmitterNames
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

export const providerListener = async ({
  io,
  contractAddresses,
  epochEmitterName,
}: TProviderListenerArgs) => {
  const provider = networkProvider.getProvider();
  const [contracts, authorizationInstance] = await Promise.all([
    getAllInterestingPredictionContracts(contractAddresses),
    initializeAutorization({
      wallet: predictoorWallet,
    }),
  ]);

  const [predictoorContracts, currentBlock] = await Promise.all([
    initializeContracts({
      contracts: Object.values(contracts),
    }),
    provider.getBlockNumber(),
  ]);

  const block = await provider.getBlock(currentBlock);
  const currentTs = block.timestamp;

  const SPE =
  await predictoorContracts[0]?.getSecondsPerEpoch();

  const subscribedPredictoors = await checkAndSubscribe({
    predictoorContracts,
    currentEpoch: Math.floor(currentTs / SPE) * SPE,
  });

  createDataHolders({
    contracts: subscribedPredictoors.map((item) => item.predictorContract),
  });

  let startedTransactions: Array<string> = [];

  provider.on("block", async (blockNumber) => {
    const block = await provider.getBlock(blockNumber);
    const currentTs = block.timestamp;
    const currentEpoch = Math.floor(currentTs / SPE);

    const renewPredictoors = subscribedPredictoors.filter(
      ({ expires }) => expires < currentTs + overlapBlockCount
    );

    checkAndSubscribe({
      predictoorContracts: renewPredictoors
        .map(({ predictorContract }) => predictorContract)
        .filter((item) => !startedTransactions.includes(item.address)),
      currentEpoch: currentEpoch * SPE,
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

    if (currentTs - latestEpoch * SPE < SPE + PREDICTION_FETCH_EPOCHS_DELAY)
      return;
    //console.log("startedTransactions", startedTransactions);

    latestEpoch = currentEpoch;
    const currentPredictorContracts = subscribedPredictoors.map(
      ({ predictorContract }) => predictorContract
    );
    const predictionEpochs = calculatePredictionEpochs(currentEpoch, SPE);

    const aggPredVals = await getMultipleAggPredValsByEpoch({
      currentTs,
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

    predValDataHolder.setFixedMessage(epochEmitterName, result);
    io.emit('newEpoch', result);
  });
};
