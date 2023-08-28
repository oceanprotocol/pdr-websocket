import { ethers } from "ethers";
import { signHash, signHashWithUser } from "./signHash";

export async function authorize(wallet: ethers.Wallet, validity = 86400) {
  const address = await wallet.getAddress();
  const validUntil = Math.round(Date.now() / 1000) + validity;
  const message = ethers.utils.solidityKeccak256(
    ["address", "uint256"],
    [address, validUntil]
  );
  const signedMessage = await signHashWithUser(wallet, message);
  return {
    userAddress: address,
    v: signedMessage.v,
    r: signedMessage.r,
    s: signedMessage.s,
    validUntil: validUntil,
  };
}
