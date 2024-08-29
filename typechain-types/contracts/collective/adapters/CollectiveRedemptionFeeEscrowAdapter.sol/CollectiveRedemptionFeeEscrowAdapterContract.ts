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
} from "../../../../common";

export interface CollectiveRedemptionFeeEscrowAdapterContractInterface
  extends utils.Interface {
  functions: {
    "escrowRedemptionFee(address,uint256,address,uint256)": FunctionFragment;
    "escrowedRedemptionFeeByBlockNum(address,uint256)": FunctionFragment;
    "escrowedRedemptionFees(address,address)": FunctionFragment;
    "getBlockNumByTokenAddr(address,address)": FunctionFragment;
    "getRedemptionFeeAmount(address,address,address)": FunctionFragment;
    "withDrawRedemptionFee(address,address)": FunctionFragment;
    "withdrawAmount(address,address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "escrowRedemptionFee"
      | "escrowedRedemptionFeeByBlockNum"
      | "escrowedRedemptionFees"
      | "getBlockNumByTokenAddr"
      | "getRedemptionFeeAmount"
      | "withDrawRedemptionFee"
      | "withdrawAmount"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "escrowRedemptionFee",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "escrowedRedemptionFeeByBlockNum",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "escrowedRedemptionFees",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getBlockNumByTokenAddr",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getRedemptionFeeAmount",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withDrawRedemptionFee",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAmount",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "escrowRedemptionFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "escrowedRedemptionFeeByBlockNum",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "escrowedRedemptionFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBlockNumByTokenAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRedemptionFeeAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withDrawRedemptionFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAmount",
    data: BytesLike
  ): Result;

  events: {
    "EscrowFund(address,address,uint256)": EventFragment;
    "Withdraw(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "EscrowFund"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
}

export interface EscrowFundEventObject {
  dao: string;
  tokenAddr: string;
  amount: BigNumber;
}
export type EscrowFundEvent = TypedEvent<
  [string, string, BigNumber],
  EscrowFundEventObject
>;

export type EscrowFundEventFilter = TypedEventFilter<EscrowFundEvent>;

export interface WithdrawEventObject {
  dao: string;
  tokenAddr: string;
  amount: BigNumber;
}
export type WithdrawEvent = TypedEvent<
  [string, string, BigNumber],
  WithdrawEventObject
>;

export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;

export interface CollectiveRedemptionFeeEscrowAdapterContract
  extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: CollectiveRedemptionFeeEscrowAdapterContractInterface;

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
    escrowRedemptionFee(
      dao: PromiseOrValue<string>,
      blockNum: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    escrowedRedemptionFeeByBlockNum(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    escrowedRedemptionFees(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getBlockNumByTokenAddr(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber[]]>;

    getRedemptionFeeAmount(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    withDrawRedemptionFee(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawAmount(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  escrowRedemptionFee(
    dao: PromiseOrValue<string>,
    blockNum: PromiseOrValue<BigNumberish>,
    tokenAddr: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  escrowedRedemptionFeeByBlockNum(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  escrowedRedemptionFees(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getBlockNumByTokenAddr(
    dao: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  getRedemptionFeeAmount(
    dao: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  withDrawRedemptionFee(
    dao: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawAmount(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    escrowRedemptionFee(
      dao: PromiseOrValue<string>,
      blockNum: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    escrowedRedemptionFeeByBlockNum(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    escrowedRedemptionFees(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBlockNumByTokenAddr(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    getRedemptionFeeAmount(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withDrawRedemptionFee(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawAmount(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    "EscrowFund(address,address,uint256)"(
      dao?: null,
      tokenAddr?: null,
      amount?: null
    ): EscrowFundEventFilter;
    EscrowFund(
      dao?: null,
      tokenAddr?: null,
      amount?: null
    ): EscrowFundEventFilter;

    "Withdraw(address,address,uint256)"(
      dao?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawEventFilter;
    Withdraw(dao?: null, tokenAddr?: null, amount?: null): WithdrawEventFilter;
  };

  estimateGas: {
    escrowRedemptionFee(
      dao: PromiseOrValue<string>,
      blockNum: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    escrowedRedemptionFeeByBlockNum(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    escrowedRedemptionFees(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBlockNumByTokenAddr(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRedemptionFeeAmount(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withDrawRedemptionFee(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawAmount(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    escrowRedemptionFee(
      dao: PromiseOrValue<string>,
      blockNum: PromiseOrValue<BigNumberish>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    escrowedRedemptionFeeByBlockNum(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    escrowedRedemptionFees(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBlockNumByTokenAddr(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRedemptionFeeAmount(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withDrawRedemptionFee(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawAmount(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
