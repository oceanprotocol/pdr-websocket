import { ethers } from "ethers";
import { currentConfig } from "./appconstants";

/* eslint-env mocha */
/* global */

export function getEventFromTx(
  txReceipt: ethers.ContractReceipt,
  eventName: string
): ethers.Event | undefined {
  return txReceipt.events?.filter((log: any) => {
    return log.event === eventName;
  })[0];
}

export function stringToBytes32(data: string): string {
  const hexData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data));
  return ethers.utils.hexZeroPad(hexData, 32);
}

export const calculatePredictionEpochs = (
  currentEpoch: number,
  SPE: number
): number[] => [
  SPE * (currentEpoch - 2),
  SPE * (currentEpoch - 1),
  SPE * currentEpoch,
];

export const isSapphireNetwork = (): boolean =>
  currentConfig.chainId === "23295";
