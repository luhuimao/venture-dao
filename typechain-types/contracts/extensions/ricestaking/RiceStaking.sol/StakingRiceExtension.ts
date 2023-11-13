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
  PayableOverrides,
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
} from "../../../../common";

export interface StakingRiceExtensionInterface extends utils.Interface {
  functions: {
    "addToBalance(address,address,uint256)": FunctionFragment;
    "balanceOf(address,address)": FunctionFragment;
    "checkpoints(address,address,uint32)": FunctionFragment;
    "dao()": FunctionFragment;
    "getAllRiceStakers()": FunctionFragment;
    "getProjectSnapRice()": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "initialized()": FunctionFragment;
    "numCheckpoints(address,address)": FunctionFragment;
    "setProjectSnapRice(address)": FunctionFragment;
    "subtractFromBalance(address,address,uint256)": FunctionFragment;
    "withdraw(address,address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addToBalance"
      | "balanceOf"
      | "checkpoints"
      | "dao"
      | "getAllRiceStakers"
      | "getProjectSnapRice"
      | "initialize"
      | "initialized"
      | "numCheckpoints"
      | "setProjectSnapRice"
      | "subtractFromBalance"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addToBalance",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "checkpoints",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "dao", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getAllRiceStakers",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getProjectSnapRice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialized",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "numCheckpoints",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setProjectSnapRice",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "subtractFromBalance",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "addToBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "checkpoints",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "dao", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAllRiceStakers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProjectSnapRice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "initialized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "numCheckpoints",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProjectSnapRice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "subtractFromBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "NewBalance(address,address,uint160)": EventFragment;
    "Withdraw(address,address,uint160)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewBalance"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
}

export interface NewBalanceEventObject {
  member: string;
  tokenAddr: string;
  amount: BigNumber;
}
export type NewBalanceEvent = TypedEvent<
  [string, string, BigNumber],
  NewBalanceEventObject
>;

export type NewBalanceEventFilter = TypedEventFilter<NewBalanceEvent>;

export interface WithdrawEventObject {
  account: string;
  tokenAddr: string;
  amount: BigNumber;
}
export type WithdrawEvent = TypedEvent<
  [string, string, BigNumber],
  WithdrawEventObject
>;

export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;

export interface StakingRiceExtension extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: StakingRiceExtensionInterface;

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
    addToBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    balanceOf(
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    checkpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; amount: BigNumber }
    >;

    dao(overrides?: CallOverrides): Promise<[string]>;

    getAllRiceStakers(overrides?: CallOverrides): Promise<[string[]]>;

    getProjectSnapRice(overrides?: CallOverrides): Promise<[BigNumber]>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initialized(overrides?: CallOverrides): Promise<[boolean]>;

    numCheckpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number]>;

    setProjectSnapRice(
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    subtractFromBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      receipientAddr: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addToBalance(
    stakerAddr: PromiseOrValue<string>,
    token: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  balanceOf(
    member: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  checkpoints(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { fromBlock: BigNumber; amount: BigNumber }
  >;

  dao(overrides?: CallOverrides): Promise<string>;

  getAllRiceStakers(overrides?: CallOverrides): Promise<string[]>;

  getProjectSnapRice(overrides?: CallOverrides): Promise<BigNumber>;

  initialize(
    _dao: PromiseOrValue<string>,
    creator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initialized(overrides?: CallOverrides): Promise<boolean>;

  numCheckpoints(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<number>;

  setProjectSnapRice(
    tokenAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  subtractFromBalance(
    stakerAddr: PromiseOrValue<string>,
    token: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    receipientAddr: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addToBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    balanceOf(
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; amount: BigNumber }
    >;

    dao(overrides?: CallOverrides): Promise<string>;

    getAllRiceStakers(overrides?: CallOverrides): Promise<string[]>;

    getProjectSnapRice(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    initialized(overrides?: CallOverrides): Promise<boolean>;

    numCheckpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<number>;

    setProjectSnapRice(
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    subtractFromBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdraw(
      receipientAddr: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "NewBalance(address,address,uint160)"(
      member?: null,
      tokenAddr?: null,
      amount?: null
    ): NewBalanceEventFilter;
    NewBalance(
      member?: null,
      tokenAddr?: null,
      amount?: null
    ): NewBalanceEventFilter;

    "Withdraw(address,address,uint160)"(
      account?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawEventFilter;
    Withdraw(
      account?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawEventFilter;
  };

  estimateGas: {
    addToBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    balanceOf(
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    dao(overrides?: CallOverrides): Promise<BigNumber>;

    getAllRiceStakers(overrides?: CallOverrides): Promise<BigNumber>;

    getProjectSnapRice(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initialized(overrides?: CallOverrides): Promise<BigNumber>;

    numCheckpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setProjectSnapRice(
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    subtractFromBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdraw(
      receipientAddr: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addToBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    balanceOf(
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    checkpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    dao(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getAllRiceStakers(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getProjectSnapRice(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initialized(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    numCheckpoints(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setProjectSnapRice(
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    subtractFromBalance(
      stakerAddr: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      receipientAddr: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
