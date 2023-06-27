import { Request, Response, NextFunction } from "express";
import { getAllInterestingPredictionContracts } from "../../utils/subgraphs/getAllInterestingPredictionContracts";
import { currentConfig, predictoorWallet } from "../../utils/appconstants";
import { networkProvider } from "../../utils/networkProvider";
import { getSubscriptionDetails } from "../../services/getSubscriptionDetails";
import { initializeContracts } from "../../services/initializeContracts";

export const initialData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const predictoorContracts = await getAllInterestingPredictionContracts(
      currentConfig.subgraph
    );

    const contracts = await initializeContracts({
      contracts: Object.values(predictoorContracts),
    });

    if (contracts.length === 0) {
      throw new Error("No contracts found");
    }

    const BPE = await contracts[0].getBlocksPerEpoch();

    const allContractSubscriptions = await Promise.all(
      contracts.map(async (predictorContract) => {
        const [subscription, blockNumber, isValid, currentEpoch] =
          await getSubscriptionDetails({
            predictorContract,
            userAddress: predictoorWallet.address,
            provider: networkProvider.getProvider(),
          });

        let aggPredVal = null;
        if (isValid) {
          aggPredVal = await predictorContract.getAggPredval(
            BPE * (currentEpoch - 1),
            predictoorWallet
          );
        }

        return {
          contractInfo: predictoorContracts[predictorContract.address],
          blockNumber,
          isValid,
          aggPredVal,
        };
      })
    );

    // Send a JSON response
    res.status(200).json({
      results: allContractSubscriptions,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};
