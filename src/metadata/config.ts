export type TRunEnvironments = "staging" | "production" | "barge";
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
    opfProvidedPredictions: Array<string>;
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
    opfProvidedPredictions: ['0xa852af820eacc7f6eb526bc07ebb23057e26063b'],
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
    opfProvidedPredictions: [],
    opfOwnerAddress: "0xe02a421dfc549336d47efee85699bd0a3da7d6ff",
  },
  barge: {
    chainId: "8996",
    oceanTokenAddress: "0x9A677a02a1Aa03d8798F4a7be9425E5d6d919fFc",
    subgraph: process.env.DEV_GRAPHQL_URL
      ? `${process.env.DEV_GRAPHQL_URL}/subgraphs/name/oceanprotocol/ocean-subgraph`
      : "http://172.15.0.15:8000/subgraphs/name/oceanprotocol/ocean-subgraph",
    opfProvidedPredictions: ["0x3586b0ff8e98dbdcb1cb7d8620bf6cd9246a47a5"],
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
