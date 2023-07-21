export type TInitializeAutorizationArgs = {
  walletAddress: string;
};

export type TAuthorizationUser = {
  userAddress: string;
  v: string;
  r: string;
  s: string;
  validUntil: number;
};
