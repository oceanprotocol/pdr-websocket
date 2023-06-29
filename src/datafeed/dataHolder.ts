import { TGetAggPredvalResult } from "../utils/contracts/ContractReturnTypes";
import { TProviderListenerEmitData } from "./providerListener";

class DataHolder<T, U> {
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

  public getItemsFromContractByCount(key: string, count: number): Array<T> {
    return this.data[key].slice(-count);
  }

  public clearContractBeforeCount(key: string, count: number): void {
    this.data[key] = this.data[key].slice(-count);
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
}

type TPredValDataHolderItem = TGetAggPredvalResult & {
  epoch: number;
};
const predValDataHolder = new DataHolder<
  TPredValDataHolderItem,
  TProviderListenerEmitData
>();

export { DataHolder, TPredValDataHolderItem, predValDataHolder };
