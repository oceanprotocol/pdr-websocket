import {
  EEpochEmitterNames,
  TOpfProvidedPredictions,
} from "../metadata/config";
import { TGetAggPredvalResult } from "../utils/contracts/ContractReturnTypes";
import { ValueOf } from "../utils/utilitytypes";
import { TProviderListenerEmitData } from "./providerListener";

class DataHolder<T, U extends Record<string, unknown>> {
  private data: { [key: string]: Array<T> };
  public theFixedMessage: U;

  public constructor() {
    this.data = {};
  }

  public setContract(key: string, value: Array<T>): void {
    this.data[key] = value;
  }

  public getContract(key: string): Array<T> {
    return this.data[key];
  }

  public setItemToContract(key: string, item: T): void {
    this.data[key].push(item);
  }

  public clearContract(key: string): void {
    this.data[key] = [];
  }

  public getItemFromContractByItemKeyValue(
    key: string,
    itemKey: string,
    itemValue: unknown
  ): T | undefined {
    return this.data[key].find((item) => item[itemKey] === itemValue);
  }

  public removeItemFromContractByItemKeyValue(
    key: string,
    itemKey: string,
    itemValues: Array<unknown>
  ): void {
    this.data[key] = this.data[key].filter((item) =>
      itemValues.includes(item[itemKey])
    );
  }

  get allData(): { [key: string]: Array<T> } {
    return this.data;
  }

  public setFixedMessage(timeframe: keyof U, message: ValueOf<U>): void {
    this.theFixedMessage = {
      ...this.theFixedMessage,
      [timeframe]: message,
    };
  }

  public getFixedMessage(timeframe: keyof U): ValueOf<U> {
    return this.theFixedMessage[timeframe];
  }
}

type TPredValDataHolderItem = TGetAggPredvalResult & {
  epoch: number;
};
const predValDataHolder = new DataHolder<
  TPredValDataHolderItem,
  Record<EEpochEmitterNames, TProviderListenerEmitData>
>();

export { DataHolder, TPredValDataHolderItem, predValDataHolder };
