import { currentConfig, predictoorWallet } from "../utils/appconstants";
import { checkAndSubscribe } from "../services/checkAndSubscribe";
import { getAllInterestingPredictionContracts } from "../utils/subgraphs/getAllInterestingPredictionContracts";
import { initializeContracts } from "../services/initializeContracts";
import { networkProvider } from "../utils/networkProvider";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

let latestEpoch = 0;

type TProviderListenerArgs = {
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
};

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

  //subscribedPredictoors.forEach(async (predictorContract) => {
  //  predictorContract.getBlocksPerEpoch();
  //});

  const BPE =
    await subscribedPredictoors[0]?.predictorContract.getBlocksPerEpoch();

  provider.on("block", async (blockNumber) => {
    const currentEpoch = Math.floor(blockNumber / BPE);

    const renewPredictoors = subscribedPredictoors.filter(
      ({ expires }) => expires < blockNumber + 100
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

    if (currentEpoch !== latestEpoch) {
      latestEpoch = currentEpoch;

      const aggPredVals = await Promise.all(
        subscribedPredictoors.map(({ predictorContract }) => {
          return predictorContract.getAggPredval(
            BPE * (currentEpoch - 1),
            predictoorWallet
          );
        })
      );
      
      const result = aggPredVals.map((item, index) => ({
        ...item,
        contractInfo: contracts[predictoorContracts[index].address],
      }));

      //console.log("newEpoch", result);
      io.emit("newEpoch", result);
    }
  });
};
