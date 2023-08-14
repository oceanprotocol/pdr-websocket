export default {
  staging: {
    chainId: "23295",
    oceanAddress: "0x4dD281EB67DED07E76E413Df16176D66ae69e240",
    subgraph:
      "https://v4.subgraph.goerli.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    opfProvidedPredictions: [],
    tokenPredictions: [
      {
        blocks_per_epoch: 4000,
        tokenName: "ETH",
        tokenAddress: "0x",
        pairName: "USDC",
        pairAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        exchange: "univ3",
        serviceIndex: 1,
        subscription_lifetime_hours: 24,
        predictoorAddress: "0x9497d1d64F2aFeBcd4f9916Eef3d9094E5Df962f",
        predictoorAddressWithPublishFee:
          "0x9497d1d64F2aFeBcd4f9916Eef3d9094E5Df962f",
        predictoorFeeToken: "0x4dD281EB67DED07E76E413Df16176D66ae69e240",
        cg_id: "ethereum",
        cg_vs_currencies: "usd",
      },
    ],
  },
  production: {
    chainId: "23295",
    oceanAddress: "0x4dD281EB67DED07E76E413Df16176D66ae69e240",
    subgraph:
      "https://v4.subgraph.mainnet.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
    opfProvidedPredictions: [],
    tokenPredictions: [
      {
        blocks_per_epoch: 4000,
        tokenName: "ETH",
        tokenAddress: "0x",
        pairName: "USDC",
        pairAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        exchange: "univ3",
        serviceIndex: 1,
        subscription_lifetime_hours: 24,
        predictoorAddress: "0x9497d1d64F2aFeBcd4f9916Eef3d9094E5Df962f",
        predictoorAddressWithPublishFee:
          "0x9497d1d64F2aFeBcd4f9916Eef3d9094E5Df962f",
        predictoorFeeToken: "0x4dD281EB67DED07E76E413Df16176D66ae69e240",
        cg_id: "ethereum",
        cg_vs_currencies: "usd",
      },
    ],
  },
  barge: {
    chainId: "8996",
    oceanAddress: "0x9A677a02a1Aa03d8798F4a7be9425E5d6d919fFc",
    subgraph: process.env.DEV_GRAPHQL_URL
      ? `${process.env.DEV_GRAPHQL_URL}/subgraphs/name/oceanprotocol/ocean-subgraph`
      : "http://172.15.0.15:8000/subgraphs/name/oceanprotocol/ocean-subgraph",
    opfProvidedPredictions: ["0x5466cc46354f55f0345c2cc3e9e3a65a4eeb31c6"],
    tokenPredictions: [
      {
        blocks_per_epoch: 4000,
        tokenName: "ETH",
        tokenAddress: "0x",
        pairName: "USDT",
        pairAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        exchange: "binance",
        serviceIndex: 1,
        subscription_lifetime_hours: 24,
        predictoorAddress: "0x1733696512e69cd0c4430f909dcbf54c54c15441",
        predictoorAddressWithPublishFee:
          "0x1733696512e69cd0c4430f909dcbf54c54c15441",
        predictoorFeeToken: "0x1733696512e69cd0c4430f909dcbf54c54c15441",
        cg_id: "ethereum",
        cg_vs_currencies: "usd",
      },
    ],
  },
  mock: {
    chainId: "23295",
    oceanAddress: "0x4dD281EB67DED07E76E413Df16176D66ae69e240",
    subgraph:
      "http://localhost:9000/subgraphs/name/oceanprotocol/ocean-subgraph",
    opfProvidedPredictions: [
      "0x1f2712f0175d51701c3081b00b66741ea1b05df8",
      "0x378d956f0f0483c53a24560e0a70db4b1c2c20c0",
    ],
    tokenPredictions: [
      {
        blocks_per_epoch: 4000,
        tokenName: "ETH",
        tokenAddress: "0x",
        pairName: "USDC",
        pairAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        exchange: "univ3",
        serviceIndex: 1,
        subscription_lifetime_hours: 24,
        predictoorAddress: "0x28a6873c1145326bb0d79f904b107fd91bd668ad",
        predictoorAddressWithPublishFee:
          "0x9497d1d64F2aFeBcd4f9916Eef3d9094E5Df962f",
        predictoorFeeToken: "0x4dD281EB67DED07E76E413Df16176D66ae69e240",
        cg_id: "ethereum",
        cg_vs_currencies: "usd",
      },
    ],
  },
};
