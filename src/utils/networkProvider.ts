import { ethers } from 'ethers'
import networksData from '../metadata/networks.json'

type NetworkNames = 'barge' | 'staging' | 'production'

type NetworkConfig = Record<NetworkNames, string>

// Define your network configuration mapping the env variable to the network URL
const networkConfig: NetworkConfig = {
  barge: process.env.DEV_AWS_URL || 'http://localhost:8545',
  staging: 'https://testnet.sapphire.oasis.dev',
  production: 'https://sapphire.oasis.io'
}

class NetworkProvider {
  provider: ethers.providers.JsonRpcProvider

  constructor() {
    const env = process.env.ENVIRONMENT || 'barge'

    const networkURL =
      networkConfig[env as NetworkNames] || networkConfig['barge']

    this.provider = new ethers.providers.JsonRpcProvider(networkURL)
  }

  async init() {
    await this.provider.send('eth_accounts', [])
  }

  getProvider() {
    return this.provider
  }

  getNetworkName(chainId: number): string | undefined {
    return networksData.find((data) => data.chainId == chainId)?.name
  }

  getSigner(address: string) {
    return this.provider.getSigner(address)
  }
}

const networkProvider = new NetworkProvider()

export { networkProvider }
