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
  baseToken: string;
  quoteToken: string;
  interval: string;
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
  contractAddresses: string[]
): Promise<Record<string, TPredictionContract>> => {
  const chunkSize = 1000;
  //const contractAddresses = currentConfig.opfProvidedPredictions;
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
      let market = "";
      let baseToken = "";
      let quoteToken = "";
      let interval = "";
      market = "binance";
      let qbtks = item.token.name.split("/");
      baseToken = qbtks[0];
      quoteToken = qbtks[1];
      interval = item.secondsPerEpoch == "300" ? "5m" : "1h";
      contracts[item.id] = {
        name: item.token.name,
        price: item.token.lastPriceValue,
        market: market,
        baseToken: baseToken,
        quoteToken: quoteToken,
        interval: interval,
        address: item.id,
        symbol: item.token.symbol,
        secondsPerEpoch: item.secondsPerEpoch,
        secondsPerSubscription: item.secondsPerSubscription,
        last_submitted_epoch: 0,
        nftId: item.token.nft ? item.token.nft.owner.id : "",
        publishMarketFeeAddress: "0x0000000000000000000000000000000000000000",
        publishMarketFeeAmount: "0",
        paymentCollector: "0x0000000000000000000000000000000000000000",
        publishMarketFeeToken: "0x0000000000000000000000000000000000000000",
      };
      console.log(contracts[item.id]);
    }

    offset += chunkSize;
  }

  return contracts;
};
