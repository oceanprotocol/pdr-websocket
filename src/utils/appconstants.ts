import { config } from "../metadata/config";
import { ethers } from "ethers";
import { networkProvider } from "./networkProvider";

export const predictoorPK = process.env.PREDICTOOR_PK || "";

export const predictoorWallet = new ethers.Wallet(
  predictoorPK,
  networkProvider.getProvider()
);

export const overlapBlockCount = 100;
export const PREDICTION_FETCH_EPOCHS_DELAY = 5;

export const currentConfig = process.env.ENVIRONMENT
  ? config[process.env.ENVIRONMENT as keyof typeof config]
  : config["staging"];
