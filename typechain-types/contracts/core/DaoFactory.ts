/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export declare namespace DaoFactory {
  export type AdapterStruct = {
    id: PromiseOrValue<BytesLike>;
    addr: PromiseOrValue<string>;
    flags: PromiseOrValue<BigNumberish>;
  };

  export type AdapterStructOutput = [string, string, BigNumber] & {
    id: string;
    addr: string;
    flags: BigNumber;
  };
}

export interface DaoFactoryInterface extends utils.Interface {
  functions: {
    "addAdapters(address,(bytes32,address,uint128)[])": FunctionFragment;
    "addresses(bytes32)": FunctionFragment;
    "configureExtension(address,address,(bytes32,address,uint128)[])": FunctionFragment;
    "createDao(string,address)": FunctionFragment;
    "daos(address)": FunctionFragment;
    "getDaoAddress(string)": FunctionFragment;
    "identityAddress()": FunctionFragment;
    "owner()": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "updateAdapter(address,(bytes32,address,uint128))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addAdapters"
      | "addresses"
      | "configureExtension"
      | "createDao"
      | "daos"
      | "getDaoAddress"
      | "identityAddress"
      | "owner"
      | "setOwner"
      | "updateAdapter"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addAdapters",
    values: [PromiseOrValue<string>, DaoFactory.AdapterStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "addresses",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "configureExtension",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      DaoFactory.AdapterStruct[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "createDao",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "daos",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDaoAddress",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "identityAddress",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "updateAdapter",
    values: [PromiseOrValue<string>, DaoFactory.AdapterStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "addAdapters",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "addresses", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "configureExtension",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "createDao", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "daos", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDaoAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "identityAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updateAdapter",
    data: BytesLike
  ): Result;

  events: {
    "DAOCreated(address,address,string)": EventFragment;
    "OwnerChanged(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DAOCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnerChanged"): EventFragment;
}

export interface DAOCreatedEventObject {
  _address: string;
  _creator: string;
  _name: string;
}
export type DAOCreatedEvent = TypedEvent<
  [string, string, string],
  DAOCreatedEventObject
>;

export type DAOCreatedEventFilter = TypedEventFilter<DAOCreatedEvent>;

export interface OwnerChangedEventObject {
  _oldOwner: string;
  _newOwner: string;
}
export type OwnerChangedEvent = TypedEvent<
  [string, string],
  OwnerChangedEventObject
>;

export type OwnerChangedEventFilter = TypedEventFilter<OwnerChangedEvent>;

export interface DaoFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DaoFactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addAdapters(
      dao: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    addresses(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    configureExtension(
      dao: PromiseOrValue<string>,
      extension: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    createDao(
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    daos(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getDaoAddress(
      daoName: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    identityAddress(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    setOwner(
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    updateAdapter(
      dao: PromiseOrValue<string>,
      adapter: DaoFactory.AdapterStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addAdapters(
    dao: PromiseOrValue<string>,
    adapters: DaoFactory.AdapterStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  addresses(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  configureExtension(
    dao: PromiseOrValue<string>,
    extension: PromiseOrValue<string>,
    adapters: DaoFactory.AdapterStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  createDao(
    daoName: PromiseOrValue<string>,
    creator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  daos(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  getDaoAddress(
    daoName: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  identityAddress(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  setOwner(
    _owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  updateAdapter(
    dao: PromiseOrValue<string>,
    adapter: DaoFactory.AdapterStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addAdapters(
      dao: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    addresses(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    configureExtension(
      dao: PromiseOrValue<string>,
      extension: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    createDao(
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    daos(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    getDaoAddress(
      daoName: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    identityAddress(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    setOwner(
      _owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    updateAdapter(
      dao: PromiseOrValue<string>,
      adapter: DaoFactory.AdapterStruct,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "DAOCreated(address,address,string)"(
      _address?: null,
      _creator?: null,
      _name?: null
    ): DAOCreatedEventFilter;
    DAOCreated(
      _address?: null,
      _creator?: null,
      _name?: null
    ): DAOCreatedEventFilter;

    "OwnerChanged(address,address)"(
      _oldOwner?: null,
      _newOwner?: null
    ): OwnerChangedEventFilter;
    OwnerChanged(_oldOwner?: null, _newOwner?: null): OwnerChangedEventFilter;
  };

  estimateGas: {
    addAdapters(
      dao: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    addresses(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    configureExtension(
      dao: PromiseOrValue<string>,
      extension: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    createDao(
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    daos(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDaoAddress(
      daoName: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    identityAddress(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    setOwner(
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    updateAdapter(
      dao: PromiseOrValue<string>,
      adapter: DaoFactory.AdapterStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addAdapters(
      dao: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    addresses(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    configureExtension(
      dao: PromiseOrValue<string>,
      extension: PromiseOrValue<string>,
      adapters: DaoFactory.AdapterStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    createDao(
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    daos(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDaoAddress(
      daoName: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    identityAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setOwner(
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    updateAdapter(
      dao: PromiseOrValue<string>,
      adapter: DaoFactory.AdapterStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
