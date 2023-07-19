import { ethers } from "ethers";
import { graphqlClientInstance } from "../graphqlClient";
import {
  NftKeys,
  TGetPredictContractsQueryResult,
  getPredictContracts,
} from "./queries/getPredictContracts";
import {TNft} from "./queries/getPredictContracts";

export type TPredictionContract = {
  name: string;
  address: string;
  price: number;
  market: string;
  symbol: string;
  blocksPerEpoch: string;
  blocksPerSubscription: string;
  last_submitted_epoch: number;
};

function keccak256ToString(hash) {
  // Convert hexadecimal hash to byte array
  const byteArray = hash.match(/.{1,2}/g).map(byte => parseInt(byte, 16));

  // Convert byte array to string using UTF-8 encoding
  const string = new TextDecoder('utf-8').decode(new Uint8Array(byteArray));

  return string;
}

export const getAllInterestingPredictionContracts = async (
  subgraphURL: string
): Promise<Record<string, TPredictionContract>> => {
  const chunkSize = 1000;
  let offset = 0;
  const contracts: Record<string, TPredictionContract> = {};
  const whileValue = true;
  while (whileValue) {
    const variables = {
      offset,
      chunkSize,
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
      let market
      item.token.nft.nftData.forEach((i:TNft) => {
        if(i.key == NftKeys.MARKET){
          market = Buffer.from(i.value.slice(2), 'hex').toString('utf8')
        }
      })
      contracts[item.id] = {
        name: item.token.name,
        price: item.token.lastPriceValue,
        market: market,
        address: item.id,
        symbol: item.token.symbol,
        blocksPerEpoch: item.blocksPerEpoch,
        blocksPerSubscription: item.blocksPerSubscription,
        last_submitted_epoch: 0,
      };
    }

    offset += chunkSize;
  }

  return contracts;
};
