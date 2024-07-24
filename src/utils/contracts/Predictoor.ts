import { BigNumber, ethers } from "ethers";
import { getEventFromTx, isSapphireNetwork, stringToBytes32 } from "../utils";
import {
  TFreParams,
  TGetAggPredvalResult,
  TGetSubscriptions,
  TProviderFee,
} from "./ContractReturnTypes";
import FixedRateExchange from "./FixedRateExchange";
import Token from "./Token";
import { ERC20Template3ABI } from "../../metadata/abis/ERC20Template3ABI";
import { signHash, signHashWithUser } from "../signHash";
import { TAuthorizationUser } from "../../services/initializeAuthorization";
import { TPredictionContract } from "../subgraphs/getAllInterestingPredictionContracts";
import { networkProvider } from "../networkProvider";
import { PromiseReturnType } from "../utilitytypes";
// Predictoor class
class Predictoor {
  public provider: ethers.providers.JsonRpcProvider;
  public address: string;
  public instance: ethers.Contract | null;
  public FRE: FixedRateExchange | null;
  public exchangeId: BigNumber;
  public token: Token | null;
  public details: TPredictionContract;
  // Constructor
  public constructor(
    address: string,
    provider: ethers.providers.JsonRpcProvider,
    details: TPredictionContract
  ) {
    this.address = address;
    this.token = null;
    this.provider = provider;
    this.instance = null;
    this.FRE = null;
    this.details = details;
    this.exchangeId = BigNumber.from(0);
  }
  // Initialize method
  async init() {
    // Create contract instance
    this.instance = new ethers.Contract(
      this.address,
      ERC20Template3ABI,
      this.provider
    );
    // Get stake token and create new token instance
    const stakeToken = await this.instance?.stakeToken();
    this.token = new Token(stakeToken, this.provider);
    // Get exchanges and log fixed rates
    const fixedRates = await this.getExchanges();

    // If there are fixed rates, set exchange and exchangeId
    if (fixedRates) {
      const [fixedRateAddress, exchangeId]: [string, BigNumber] = fixedRates[0];
      const exchange = new FixedRateExchange(fixedRateAddress, this.provider);
      this.FRE = exchange;
      this.exchangeId = exchangeId;
    }
  }
  // Check if subscription is valid
  async isValidSubscription(address: string): Promise<boolean> {
    return this.instance?.isValidSubscription(address);
  }
  // Get subscriptions
  async getSubscriptions(address: string): Promise<TGetSubscriptions> {
    return this.instance?.subscriptions(address);
  }
  // Calculate provider fee
  async getCalculatedProviderFee(user: ethers.Wallet): Promise<TProviderFee> {
    const fastBlockNumber = await networkProvider
      .getProvider()
      ._getFastBlockNumber();
    const userAddress = await user.getAddress();
    const providerData = JSON.stringify({
      timeout: 0,
    });

    const providerFeeToken = ethers.constants.AddressZero;
    const providerFeeAmount = 0;
    const providerValidUntil = 0;
    // Create message to sign
    const message = ethers.utils.solidityKeccak256(
      ["bytes", "address", "address", "uint256", "uint256"],
      [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(providerData)),
        userAddress,
        providerFeeToken,
        providerFeeAmount,
        providerValidUntil,
      ]
    );
    // Sign the message
    const { v, r, s } = await signHashWithUser(user, message);

    return {
      providerFeeAddress: userAddress,
      providerFeeToken,
      providerFeeAmount,
      v,
      r,
      s,
      providerData: ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(providerData)
      ),
      validUntil: providerValidUntil,
    };
  }
  // Get order parameters
  async getOrderParams(user: ethers.Wallet) {
    const providerFee = await this.getCalculatedProviderFee(user);
    return {
      consumer: user.address,
      serviceIndex: 0,
      _providerFee: providerFee,
      _consumeMarketFee: {
        consumeMarketFeeAddress: this.details.publishMarketFeeAddress,
        consumeMarketFeeToken: this.details.publishMarketFeeToken,
        consumeMarketFeeAmount: this.details.publishMarketFeeAmount,
      },
    };
  }

  async getBuyFromFreGasLimit(
    user: ethers.Wallet,
    orderParams: PromiseReturnType<typeof this.getOrderParams>,
    freParams: TFreParams
  ): Promise<BigNumber> {
    const isBarge = process.env.ENVIRONMENT === "barge";
    return isBarge
      ? (await networkProvider.getProvider().getBlock("latest")).gasLimit
      : this.instance
          .connect(user)
          .estimateGas.buyFromFreAndOrder(orderParams, freParams);
  }

  // Buy from Fixed Rate Exchange (FRE) and order
  async buyFromFreAndOrder(
    user: ethers.Wallet,
    exchangeId: string,
    baseTokenAmount: string
  ): Promise<ethers.ContractReceipt | Error> {
    try {
      console.log("buyFromFreAndOrder");
      console.log(await this.getExchanges())
      const orderParams = await this.getOrderParams(user);

      const freParams = {
        exchangeContract: this.FRE.address,
        exchangeId,
        maxBaseTokenAmount: ethers.utils.parseEther(baseTokenAmount),
        swapMarketFee: 0,
        marketFeeAddress: ethers.constants.AddressZero,
      };
      // Get gas price and limit
      const gasPrice = await this.provider.getGasPrice();
      const gasLimit = await this.getBuyFromFreGasLimit(
        user,
        orderParams,
        freParams
      );
      // Execute transaction and wait for receipt
      const tx = await this.instance
        .connect(user)
        .buyFromFreAndOrder(orderParams, freParams, {
          gasLimit,
          gasPrice,
        });

      const receipt = await tx.wait();

      return receipt;
    } catch (e: any) {
      console.error(e);
      return e;
    }
  }
  // Buy and start subscription
  async buyAndStartSubscription(
    user: ethers.Wallet
  ): Promise<ethers.ContractReceipt | Error | null> {
    try {
      const dtPrice: any = await this.FRE?.getDtPrice(
        this.exchangeId?.toString()
      );

      const baseTokenAmount = dtPrice.baseTokenAmount;
      // Check if baseTokenAmount is valid and token exists
      if (!baseTokenAmount || baseTokenAmount instanceof Error || !this.token) {
        return Error("Assert token requirements.");
      }
      const formattedBaseTokenAmount =
        ethers.utils.formatEther(baseTokenAmount);
      // Approve token and execute buy and order
      await this.token.approve(
        user,
        this.address || "",
        ethers.utils.formatEther(baseTokenAmount),
        this.provider
      );
      return await this.buyFromFreAndOrder(
        user,
        this.exchangeId?.toString(),
        formattedBaseTokenAmount
      );
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }
  // Start order
  startOrder(): Promise<ethers.ContractReceipt> {
    return this.instance?.startOrder();
  }
  // Get exchanges
  getExchanges(): Promise<[string, BigNumber][]> {
    return this.instance?.getFixedRates();
  }
  // Get stake token
  getStakeToken(): Promise<string> {
    return this.instance?.stakeToken();
  }
  // Get current epoch
  async getCurrentEpoch(): Promise<number> {
    const curEpoch: BigNumber = await this.instance?.curEpoch();
    const formattedEpoch: number = parseInt(
      ethers.utils.formatUnits(curEpoch, 0)
    );
    return formattedEpoch;
  }
  // Get seconds per epoch
  async getSecondsPerEpoch(): Promise<number> {
    const secondsPerEpoch: BigNumber = await this.instance?.secondsPerEpoch();
    const formattedSecondsPerEpoch: number = parseInt(
      ethers.utils.formatUnits(secondsPerEpoch, 0)
    );
    return formattedSecondsPerEpoch;
  }

  async getCurrentEpochStartTs(seconds: number): Promise<number> {
    const soonestTsToPredict: BigNumber = await this.instance?.toEpochStart(
      seconds
    );
    const formattedSoonestTsToPredict: number = parseInt(
      ethers.utils.formatUnits(soonestTsToPredict, 0)
    );
    return formattedSoonestTsToPredict;
  }

  async getAggPredval(
    ts: number,
    user: ethers.Wallet,
    authorizationMessage: TAuthorizationUser
  ): Promise<TGetAggPredvalResult | null> {
    try {
      if (this.instance) {
        const [nom, denom] = await this.instance
          .connect(user)
          .getAggPredval(ts, authorizationMessage);

        const nominator = ethers.utils.formatUnits(nom, 18);
        const denominator = ethers.utils.formatUnits(denom, 18);

        let confidence: number =
          parseFloat(nominator) / parseFloat(denominator);
        let dir: number = confidence >= 0.5 ? 1 : 0;
        if (confidence > 0.5) {
          confidence -= 0.5;
        } else {
          confidence = 0.5 - confidence;
        }
        confidence = (confidence / 0.5) * 100;

        return {
          nom: nominator,
          denom: denominator,
          confidence: confidence,
          dir: dir,
          stake: parseFloat(ethers.utils.formatUnits(denom, 18)),
        };
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
export default Predictoor;
