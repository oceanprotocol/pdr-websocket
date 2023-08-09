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
  baseToken: string,
  quoteToken: string,
  interval: string,
  symbol: string;
  blocksPerEpoch: string;
  blocksPerSubscription: string;
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
      let market = '';
      let baseToken = '';
      let quoteToken = '';
      let interval = '';
      item.token.nft.nftData.forEach((i: TNftDataElement) => {
        const valueHex = i.value.slice(2);
        const decodedValue = Buffer.from(valueHex, 'hex').toString('utf8');
        switch (i.key) {
            case NftKeys.MARKET:
                market = decodedValue;
                break;
            case NftKeys.BASE:
                baseToken = decodedValue;
                break;
            case NftKeys.QUOTE:
                quoteToken = decodedValue;
                break;
            case NftKeys.INTERVAL:
                interval = decodedValue;
                break;
        }
      });
      contracts[item.id] = {
        name: item.token.name,
        price: item.token.lastPriceValue,
        market: market,
        baseToken: baseToken,
        quoteToken: quoteToken,
        interval: interval,
        address: item.id,
        symbol: item.token.symbol,
        blocksPerEpoch: item.blocksPerEpoch,
        blocksPerSubscription: item.blocksPerSubscription,
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
