import sha256 from "crypto-js/sha256";
import { ethers } from "ethers";

/**
 * Generates a valid DID
 * @param {string} nftAddress - The NFT address
 * @param {number} chainId - The chain ID
 * @returns {string} - The DID
 */
export function generateDid(nftAddress: string, chainId: number): string {
  const tempNftAddress = ethers.utils.getAddress(nftAddress);
  console.log("tempNftAddress", tempNftAddress);
  const checksum = sha256(tempNftAddress + chainId.toString(10));
  return `did:op:${checksum.toString()}`;
}
