import gql from "graphql-tag";

export const getPredictContracts = gql`
  query GetPredictContracts($offset: Int!, $chunkSize: Int!, $contractAddresses: [String!]!) {
    predictContracts(skip: $offset, first: $chunkSize, where: { id_in: $contractAddresses }) {
      id
      token {
        id
        name
        symbol
      }
      blocksPerEpoch
      blocksPerSubscription
      truevalSubmitTimeoutBlock
    }
  }
`;

type TPredictToken = {
  id: string;
  name: string;
  symbol: string;
};

type TPredictContract = {
  id: string;
  token: TPredictToken;
  blocksPerEpoch: string;
  blocksPerSubscription: string;
  truevalSubmitTimeoutBlock: number;
};

export type TGetPredictContractsQueryResult = {
  predictContracts: Array<TPredictContract>;
};
