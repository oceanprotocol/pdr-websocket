import { BigNumber, ethers } from "ethers";
import { getEventFromTx, stringToBytes32 } from "../utils";
import {
  TGetAggPredvalResult,
  TGetSubscriptions,
  TProviderFee,
} from "./ContractReturnTypes";
import FixedRateExchange from "./FixedRateExchange";
import Token from "./Token";
import { ERC20Template3ABI } from "../../metadata/abis/ERC20Template3ABI";
import { signHash } from "../signHash";
import { OceanToken } from "./OceanToken";
import { networkProvider } from "../networkProvider";
import { IERC20ABI } from "../../metadata/abis/IERC20ABI";

class Predictoor {
  public provider: ethers.providers.JsonRpcProvider;
  public address: string;
  public instance: ethers.Contract | null;
  public FRE: FixedRateExchange | null;
  public exchangeId: BigNumber;
  public token: Token | null;
  public oceanToken: OceanToken | null;

  public constructor(
    address: string,
    provider: ethers.providers.JsonRpcProvider
  ) {
    this.address = address;
    this.token = null;
    this.provider = provider;
    this.instance = null;
    this.FRE = null;
    this.exchangeId = BigNumber.from(0);
    this.oceanToken = new OceanToken(
      networkProvider.getProvider(),
      "0x2473f4F7bf40ed9310838edFCA6262C17A59DF64",
      IERC20ABI
    );
  }

  async init() {
    this.instance = new ethers.Contract(
      this.address,
      ERC20Template3ABI,
      this.provider
    );

    const stakeToken = await this.instance?.stakeToken();
    this.token = new Token(stakeToken, this.provider);

    const fixedRates = await this.getExchanges();
    console.log("fixedRates: ", fixedRates);

    if (fixedRates) {
      const [fixedRateAddress, exchangeId]: [string, BigNumber] = fixedRates[0];
      const exchange = new FixedRateExchange(fixedRateAddress, this.provider);
      this.FRE = exchange;
      this.exchangeId = exchangeId;
    }
  }

  async isValidSubscription(address: string): Promise<boolean> {
    return this.instance?.isValidSubscription(address);
  }

  async getSubscriptions(address: string): Promise<TGetSubscriptions> {
    return this.instance?.subscriptions(address);
  }

  getEmptyProviderFee(): TProviderFee {
    return {
      providerFeeAddress: ethers.constants.AddressZero,
      providerFeeToken: ethers.constants.AddressZero,
      providerFeeAmount: 0,
      v: 0,
      r: 0,
      s: 0,
      validUntil: 0,
      providerData: 0,
    };
  }

  async getCalculatedProviderFee(user: ethers.Wallet): Promise<TProviderFee> {
    const providerData = JSON.stringify({ timeout: 0 });
    const providerFeeToken = ethers.constants.AddressZero;
    const providerFeeAmount = 0;
    const providerValidUntil = 0;

    const message = ethers.utils.solidityKeccak256(
      ["bytes", "address", "address", "uint256", "uint256"],
      [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(providerData)),
        await user.getAddress(),
        providerFeeToken,
        providerFeeAmount,
        providerValidUntil,
      ]
    );

    const { v, r, s } = await signHash(user.address, message);
    return {
      providerFeeAddress: await user.getAddress(),
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

  async getOrderParams(user: ethers.Wallet) {
    const providerFee = await this.getCalculatedProviderFee(user);
    return {
      consumer: user.address,
      serviceIndex: 0,
      _providerFee: this.getCalculatedProviderFee(user),
      _consumeMarketFee: {
        consumeMarketFeeAddress: ethers.constants.AddressZero,
        consumeMarketFeeToken: ethers.constants.AddressZero,
        consumeMarketFeeAmount: 0,
      },
    };
  }

  async buyFromFreAndOrder(
    user: ethers.Wallet,
    exchangeId: string,
    baseTokenAmount: string
  ): Promise<ethers.ContractReceipt | Error> {
    //console.log("buyFromFreAndOrder worked");
    const orderParams = await this.getOrderParams(user);
    const freParams = {
      exchangeContract: this.FRE.address,
      exchangeId,
      maxBaseTokenAmount: ethers.utils.parseEther(baseTokenAmount),
      swapMarketFee: 0,
      marketFeeAddress: ethers.constants.AddressZero,
    };

    console.log("orderParams: ", orderParams);
    console.log("freParams: ", freParams);

    const estGas = await this.instance
      .connect(user)
      .estimateGas.buyFromFreAndOrder(orderParams, freParams);
    console.log("buyFromFreAndOrderEstGas: ", estGas.toString());
    const tx = await this.instance
      .connect(user)
      .buyFromFreAndOrder(orderParams, freParams, { gasLimit: estGas });
    const receipt = await tx.wait();
    //console.log("receipt: ", receipt);

    return receipt;
  }

  // TODO - Change to buyDT & startOrder, then offer a wrapper
  async buyAndStartSubscription(
    user: ethers.Wallet
  ): Promise<ethers.ContractReceipt | Error | null> {
    console.log("buyAndStartSubscription");
    try {
      const dtPrice: any = await this.FRE?.getDtPrice(
        this.exchangeId?.toString()
      );
      //console.log("dtPrice: ", dtPrice);
      const baseTokenAmount = dtPrice.baseTokenAmount;

      console.log("baseTokenAmount: ", baseTokenAmount.toString());
      if (!baseTokenAmount || baseTokenAmount instanceof Error || !this.token) {
        return Error("Assert token requirements.");
      }

      //console.log("this.exchangeId?.toString()", this.exchangeId?.toString());

      // console.log("dtPrice: ", dtPrice);
      // console.log(
      //   "Buying 1.0 DT with price: ",
      //   ethers.utils.formatEther(baseTokenAmount)
      // );

      const formattedBaseTokenAmount =
        ethers.utils.formatEther(baseTokenAmount);

      await this.approve(user, this.address || "", formattedBaseTokenAmount);

      //this.oceanToken?.approve(user, user.address, baseTokenAmount.toString());

      // console.log(">>>> Buy DT Now...! <<<<");
      /*const result = await this.FRE?.buyDt(
        user,
        this.exchangeId?.toString(),
        baseTokenAmount
      );*/

      return await this.buyFromFreAndOrder(
        user,
        this.exchangeId?.toString(),
        formattedBaseTokenAmount
      );

      // console.log(">>>> Bought DT! <<<<", result);
      const providerFees = this.getEmptyProviderFee();

      // console.log(">>> startOrder");
      const tx = await this.startTheSubscriptionOrder(user, providerFees);

      // console.log("Subscription tx:", tx.hash);
      const receipt = await tx.wait();
      // console.log("startTheSubscriptionOrder receipt: ", receipt);
      //console.log('receipt.gasUsed: ', receipt.gasUsed.toString())
      let event = getEventFromTx(receipt, "OrderStarted");
      // console.log("event: ", event);

      return receipt;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }

  async approve(
    user: ethers.Wallet,
    spender: string,
    amount: string
  ): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      // TODO - Gas estimation
      const gasPrice = await this.provider.getGasPrice();
      const gasLimit = await this.instance
        .connect(user)
        .estimateGas.approve(spender, ethers.utils.parseEther(amount));

      console.log(
        "DT approve gasLimit",
        ethers.utils.formatEther(gasLimit.toString())
      );
      const tx = await this.instance
        .connect(user)
        .approve(spender, ethers.utils.parseEther(amount), {
          gasLimit: gasLimit,
          gasPrice: gasPrice,
        });
      console.log(`Approval DT tx: ${tx.hash}.`);

      const receipt = await tx.wait();
      // console.log(`Got receipt`);

      return receipt;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async startTheSubscriptionOrder(
    user: ethers.Wallet,
    providerFees: TProviderFee
  ): Promise<ethers.ContractTransaction> {
    const args = [
      user.address,
      0,
      [
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
        0,
        stringToBytes32(""),
        stringToBytes32(""),
        providerFees.validUntil,
        ethers.constants.HashZero,
      ],
      [ethers.constants.AddressZero, ethers.constants.AddressZero, 0],
    ];
    const gasLimit = await this.instance
      ?.connect(user)
      .estimateGas.startOrder(...args);

    // console.log("startTheSubscriptionOrder gasLimit: ", gasLimit?.toString());
    const gasPrice = this.provider.getGasPrice();

    return this.instance
      ?.connect(user)
      .startOrder(...args, { gasLimit: gasLimit, gasPrice: gasPrice });
  }

  startOrder(): Promise<ethers.ContractReceipt> {
    return this.instance?.startOrder();
  }

  getExchanges(): Promise<[string, BigNumber][]> {
    return this.instance?.getFixedRates();
  }

  getStakeToken(): Promise<string> {
    return this.instance?.stakeToken();
  }

  async getCurrentEpoch(): Promise<number> {
    const curEpoch: BigNumber = await this.instance?.curEpoch();
    const formattedEpoch: number = parseInt(
      ethers.utils.formatUnits(curEpoch, 0)
    );
    return formattedEpoch;
  }

  async getBlocksPerEpoch(): Promise<number> {
    const blocksPerEpoch: BigNumber = await this.instance?.blocksPerEpoch();
    const formattedBlocksPerEpoch: number = parseInt(
      ethers.utils.formatUnits(blocksPerEpoch, 0)
    );
    return formattedBlocksPerEpoch;
  }

  async getAggPredval(
    block: number,
    user: ethers.Wallet
  ): Promise<TGetAggPredvalResult | null> {
    try {
      if (this.instance) {
        const [nom, denom] = await this.instance
          .connect(user)
          .getAggPredval(block);

        const nominator = ethers.utils.formatUnits(nom, 18);
        const denominator = ethers.utils.formatUnits(nom, 18);

        // TODO - Review in scale/testnet/production.
        // This will be either 1 or 0 right now.
        let confidence: number =
          parseFloat(nominator) / parseFloat(denominator);
        if (isNaN(confidence)) {
          confidence = 0;
        }
        let dir: number = confidence >= 0.5 ? 1 : 0;

        return {
          nom: nominator,
          denom: denominator,
          confidence: confidence,
          dir: dir,
          stake: denom?.toString(),
        };
      }

      return null;
    } catch (e) {
      // console.log("Failed to call getAggPredval");
      console.error(e);
      return null;
    }
  }
}

export default Predictoor;
