import { Maybe } from "graphql/jsutils/Maybe";

export type TRunEnvironments = "staging" | "production" | "barge";

export type TTimeFrames = "5m" //| "1h";
export type TOpfProvidedPredictions = Record<TTimeFrames, Maybe<Array<string>>>;
export type TRuntimeConfig = Record<
  TRunEnvironments,
  {
    chainId: string;
    subgraph: string;
    oceanTokenAddress: `0x${string}`;
    tokenPredictions: Array<{
      tokenName: string;
      pairName: string;
      market: string;
    }>;
    opfProvidedPredictions: TOpfProvidedPredictions;
    opfOwnerAddress: string;
  }
>;

export const config: TRuntimeConfig = {
  staging: {
    chainId: "23295",
    oceanTokenAddress: "0x973e69303259b0c2543a38665122b773d28405fb",
    subgraph:
      "https://v4.subgraph.sapphire-testnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    tokenPredictions: [
      {
        tokenName: "ETH",
        pairName: "USDC",
        market: "univ3",
      },
    ],
    opfProvidedPredictions: {
      "5m": ["0xda1e3c0ac74f2f10bb0c7635c9dc68bd3da0c95b"],
      //"1h": ["0xc2c5c790b411a835742ed0d517df68fea958058d"],
    },
    opfOwnerAddress: "0xe02a421dfc549336d47efee85699bd0a3da7d6ff",
  },
  production: {
    chainId: "23295",
    oceanTokenAddress: "0x973e69303259b0c2543a38665122b773d28405fb",
    subgraph:
      "https://v4.subgraph.sapphire-testnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    tokenPredictions: [
      {
        tokenName: "ETH",
        pairName: "USDC",
        market: "univ3",
      },
    ],
    opfProvidedPredictions: {
      "5m": null,
      //"1h": null,
    },
    opfOwnerAddress: "0xe02a421dfc549336d47efee85699bd0a3da7d6ff",
  },
  barge: {
    chainId: "8996",
    oceanTokenAddress: "0x9A677a02a1Aa03d8798F4a7be9425E5d6d919fFc",
    subgraph: process.env.DEV_GRAPHQL_URL
      ? `${process.env.DEV_GRAPHQL_URL}/subgraphs/name/oceanprotocol/ocean-subgraph`
      : "http://172.15.0.15:8000/subgraphs/name/oceanprotocol/ocean-subgraph",
    opfProvidedPredictions: {
      "5m": ["0x3586b0ff8e98dbdcb1cb7d8620bf6cd9246a47a5"],
      //"1h": null,
    },
    opfOwnerAddress: "0xe02a421dfc549336d47efee85699bd0a3da7d6ff",
    tokenPredictions: [
      {
        tokenName: "ETH",
        pairName: "USDC",
        market: "univ3",
      },
    ],
  },
};

export type TDataFeedPaths = Record<keyof TOpfProvidedPredictions, string>;

export const dataFeedPaths: TDataFeedPaths = {
  "5m": "api/datafeed/5m",
  //"1h": "api/datafeed/1h",
};
