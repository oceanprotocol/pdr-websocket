import { currentConfig } from "../appconstants";
import { graphqlClientInstance } from "../graphqlClient";
import {
  NftKeys,
  TGetPredictContractsQueryResult,
  getPredictContracts,
} from "./queries/getPredictContracts";
import { TNftDataElement } from "./queries/getPredictContracts";

export type TPredictionContract = {
  name: string;
  address: string;
  price: number;
  market: string;
  symbol: string;
  secondsPerEpoch: string;
  secondsPerSubscription: string;
  last_submitted_epoch: number;
  nftId: string;
  publishMarketFeeAddress: string;
  publishMarketFeeAmount: string;
  paymentCollector: string;
  publishMarketFeeToken: string;
};

export const getAllInterestingPredictionContracts = async (
  subgraphURL: string
): Promise<Record<string, TPredictionContract>> => {
  const chunkSize = 1000;
  const contractAddresses = currentConfig.opfProvidedPredictions;
  let offset = 0;
  const contracts: Record<string, TPredictionContract> = {};
  const whileValue = true;
  while (whileValue) {
    const variables = {
      offset,
      chunkSize,
      contractAddresses,
    };
    const { data, errors } =
      await graphqlClientInstance.queryWithRetry<TGetPredictContractsQueryResult>(
        getPredictContracts,
        variables
      );

    const predictContracts = data?.predictContracts;

    if (errors || !predictContracts || predictContracts.length === 0) {
      break;
    }

    for (const item of predictContracts) {
      let market;
      item.token.nft.nftData.forEach((i: TNftDataElement) => {
        if (i.key == NftKeys.MARKET) {
          market = Buffer.from(i.value.slice(2), "hex").toString("utf8");
        }
      });
      contracts[item.id] = {
        name: item.token.name,
        price: item.token.lastPriceValue,
        market: market,
        address: item.id,
        symbol: item.token.symbol,
        secondsPerEpoch: item.secondsPerEpoch,
        secondsPerSubscription: item.secondsPerSubscription,
        last_submitted_epoch: 0,
        nftId: item.token.nft.id,
        publishMarketFeeAddress: item.token.publishMarketFeeAddress,
        publishMarketFeeAmount: item.token.publishMarketFeeAmount,
        paymentCollector: item.token.paymentCollector,
        publishMarketFeeToken: item.token.publishMarketFeeToken,
      };
    }

    offset += chunkSize;
  }

  return contracts;
};
