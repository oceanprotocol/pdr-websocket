import { ethers } from "ethers";

export type TInitializeAutorizationArgs = {
  wallet: ethers.Wallet;
};

export type TAuthorizationUser = {
  userAddress: string;
  v: number | string;
  r: string;
  s: string;
  validUntil: number;
};
