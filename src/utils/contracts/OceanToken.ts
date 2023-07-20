import { ethers, Contract, providers } from "ethers";

export class OceanToken {
  private provider: providers.Provider;
  private contract: Contract;

  constructor(provider: providers.Provider, contractAddress: string, abi: any) {
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, abi, provider);
  }

  async balanceOf(address: string): Promise<string> {
    const balance = await this.contract.balanceOf(address);
    return balance.toString();
  }

  async transfer(
    to: string,
    value: number,
    overrides?: ethers.PayableOverrides
  ): Promise<string> {
    const tx = await this.contract.transfer(to, value, overrides);
    return tx.hash;
  }

  async approve(
    user: ethers.Wallet,
    spender: string,
    value: string,
    overrides?: ethers.PayableOverrides
  ): Promise<string> {
    const tx = await this.contract
      .approve(spender, ethers.utils.parseEther(value), overrides);
    return tx.hash;
  }
}
