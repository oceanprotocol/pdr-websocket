import gql from "graphql-tag";

export const getPredictContracts = gql`
  query GetPredictContracts(
    $offset: Int!
    $chunkSize: Int!
    $contractAddresses: [String!]!
  ) {
    predictContracts(
      skip: $offset
      first: $chunkSize
      where: { id_in: $contractAddresses }
    ) {
      id
      token {
        id
        name
        symbol
        lastPriceValue
        publishMarketFeeAddress
        publishMarketFeeAmount
        paymentCollector
        publishMarketFeeToken
        nft {
          id
          nftData {
            key
            value
          }
        }
      }
      secondsPerEpoch
      secondsPerSubscription
      truevalSubmitTimeout
    }
  }
`;

export enum NftKeys {
  MARKET = "0xf7e3126f87228afb82c9b18537eed25aaeb8171a78814781c26ed2cfeff27e69",
  INTERVAL = "0x49435d2ff85f9f3594e40e887943d562765d026d50b7383e76891f8190bff4c9",
}

export type TNftDataElement = {
  key: string;
  value: string;
};

type TNftData = {
  id: string;
  nftData: TNftDataElement[];
};

type TPredictToken = {
  id: string;
  name: string;
  symbol: string;
  lastPriceValue: number;
  nft: TNftData;
  publishMarketFeeAddress: string;
  publishMarketFeeAmount: string;
  paymentCollector: string;
  publishMarketFeeToken: string;
};

type TPredictContract = {
  id: string;
  token: TPredictToken;
  secondsPerEpoch: string;
  secondsPerSubscription: string;
  truevalSubmitTimeout: number;
};

export type TGetPredictContractsQueryResult = {
  predictContracts: Array<TPredictContract>;
};
