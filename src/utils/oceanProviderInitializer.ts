import fetch from "cross-fetch";
import { generateDid } from "./generateDid";

export interface ProviderFees {
  providerFeeAddress: string;
  providerFeeToken: string;
  providerFeeAmount: string;
  v: string;
  r: string;
  s: string;
  providerData: string;
  validUntil: string;
}

export interface ProviderInitialize {
  datatoken: string;
  nonce: string;
  computeAddress: string;
  providerFee: ProviderFees;
}

export type TProviderInitializerArgs = {
  nftAddress: string;
  chainId: number;
  serviceId: string;
  fileIndex: number;
  consumerAddress: string;
  initializeUrl: string;
};

export const oceanProviderInitializer = async ({
  nftAddress,
  chainId,
  serviceId,
  fileIndex,
  consumerAddress,
  initializeUrl,
}: TProviderInitializerArgs) => {
  const did = generateDid(nftAddress, chainId);
  if (!initializeUrl) return null;
  initializeUrl += `?documentId=${did}`;
  initializeUrl += `&serviceId=${serviceId}`;
  initializeUrl += `&fileIndex=${fileIndex}`;
  initializeUrl += `&consumerAddress=${consumerAddress}`;

  console.log("initializeUrl", initializeUrl);
  
  let response;
  try {
    response = await fetch(initializeUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    throw new Error(`Provider initialize failed url: ${initializeUrl} `);
  }
  if (response?.ok) {
    const results: ProviderInitialize = await response.json();
    return results;
  }
  const resolvedResponse = await response.json();
  throw new Error(JSON.stringify(resolvedResponse));
};
