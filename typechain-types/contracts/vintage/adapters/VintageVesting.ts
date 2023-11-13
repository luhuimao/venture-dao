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
} from "../../../common";

export declare namespace IVesting {
  export type StepInfoStruct = {
    steps: PromiseOrValue<BigNumberish>;
    cliffShares: PromiseOrValue<BigNumberish>;
    stepShares: PromiseOrValue<BigNumberish>;
  };

  export type StepInfoStructOutput = [number, BigNumber, BigNumber] & {
    steps: number;
    cliffShares: BigNumber;
    stepShares: BigNumber;
  };

  export type TimeInfoStruct = {
    start: PromiseOrValue<BigNumberish>;
    end: PromiseOrValue<BigNumberish>;
    cliffDuration: PromiseOrValue<BigNumberish>;
    stepDuration: PromiseOrValue<BigNumberish>;
  };

  export type TimeInfoStructOutput = [number, number, number, number] & {
    start: number;
    end: number;
    cliffDuration: number;
    stepDuration: number;
  };

  export type VestNFTInfoStruct = {
    nftToken: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
  };

  export type VestNFTInfoStructOutput = [string, BigNumber] & {
    nftToken: string;
    tokenId: BigNumber;
  };

  export type VestInfoStruct = {
    name: PromiseOrValue<string>;
    description: PromiseOrValue<string>;
    owner: PromiseOrValue<string>;
    recipient: PromiseOrValue<string>;
    token: PromiseOrValue<string>;
  };

  export type VestInfoStructOutput = [
    string,
    string,
    string,
    string,
    string
  ] & {
    name: string;
    description: string;
    owner: string;
    recipient: string;
    token: string;
  };
}

export interface VintageVestingInterface extends utils.Interface {
  functions: {
    "PERCENTAGE_PRECISION()": FunctionFragment;
    "createVesting(address,address,bytes32)": FunctionFragment;
    "getRemainingPercentage(address,uint256)": FunctionFragment;
    "getVestIdByTokenId(address,uint256)": FunctionFragment;
    "tokenIdToVestId(address,uint256)": FunctionFragment;
    "updateOwner(uint256,address)": FunctionFragment;
    "vestBalance(uint256)": FunctionFragment;
    "vestIds()": FunctionFragment;
    "vests(uint256)": FunctionFragment;
    "withdraw(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "PERCENTAGE_PRECISION"
      | "createVesting"
      | "getRemainingPercentage"
      | "getVestIdByTokenId"
      | "tokenIdToVestId"
      | "updateOwner"
      | "vestBalance"
      | "vestIds"
      | "vests"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "PERCENTAGE_PRECISION",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "createVesting",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getRemainingPercentage",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getVestIdByTokenId",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenIdToVestId",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "updateOwner",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "vestBalance",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "vestIds", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "vests",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "PERCENTAGE_PRECISION",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createVesting",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRemainingPercentage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVestIdByTokenId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenIdToVestId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "vestBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "vestIds", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vests", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "CancelVesting(uint256,uint256,uint256,address,bool)": EventFragment;
    "CreateVesting(uint256,address,address,uint32,uint32,uint32,uint32,uint128,uint128,bytes32)": EventFragment;
    "LogUpdateOwner(uint256,address)": EventFragment;
    "Withdraw(uint256,address,uint256,bool)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CancelVesting"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CreateVesting"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LogUpdateOwner"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
}

export interface CancelVestingEventObject {
  vestId: BigNumber;
  ownerAmount: BigNumber;
  recipientAmount: BigNumber;
  token: string;
  toBentoBox: boolean;
}
export type CancelVestingEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber, string, boolean],
  CancelVestingEventObject
>;

export type CancelVestingEventFilter = TypedEventFilter<CancelVestingEvent>;

export interface CreateVestingEventObject {
  vestId: BigNumber;
  token: string;
  recipient: string;
  start: number;
  cliffDuration: number;
  stepDuration: number;
  steps: number;
  cliffShares: BigNumber;
  stepShares: BigNumber;
  proposalId: string;
}
export type CreateVestingEvent = TypedEvent<
  [
    BigNumber,
    string,
    string,
    number,
    number,
    number,
    number,
    BigNumber,
    BigNumber,
    string
  ],
  CreateVestingEventObject
>;

export type CreateVestingEventFilter = TypedEventFilter<CreateVestingEvent>;

export interface LogUpdateOwnerEventObject {
  vestId: BigNumber;
  newOwner: string;
}
export type LogUpdateOwnerEvent = TypedEvent<
  [BigNumber, string],
  LogUpdateOwnerEventObject
>;

export type LogUpdateOwnerEventFilter = TypedEventFilter<LogUpdateOwnerEvent>;

export interface WithdrawEventObject {
  vestId: BigNumber;
  token: string;
  amount: BigNumber;
  toBentoBox: boolean;
}
export type WithdrawEvent = TypedEvent<
  [BigNumber, string, BigNumber, boolean],
  WithdrawEventObject
>;

export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;

export interface VintageVesting extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VintageVestingInterface;

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
    PERCENTAGE_PRECISION(overrides?: CallOverrides): Promise<[BigNumber]>;

    createVesting(
      dao: PromiseOrValue<string>,
      recipientAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getRemainingPercentage(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber, BigNumber]>;

    getVestIdByTokenId(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    tokenIdToVestId(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    updateOwner(
      vestId: PromiseOrValue<BigNumberish>,
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    vestBalance(
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    vestIds(overrides?: CallOverrides): Promise<[BigNumber]>;

    vests(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        BigNumber,
        BigNumber,
        IVesting.StepInfoStructOutput,
        IVesting.TimeInfoStructOutput,
        IVesting.VestNFTInfoStructOutput,
        IVesting.VestInfoStructOutput
      ] & {
        proposalId: string;
        claimed: BigNumber;
        total: BigNumber;
        stepInfo: IVesting.StepInfoStructOutput;
        timeInfo: IVesting.TimeInfoStructOutput;
        nftInfo: IVesting.VestNFTInfoStructOutput;
        vestInfo: IVesting.VestInfoStructOutput;
      }
    >;

    withdraw(
      dao: PromiseOrValue<string>,
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  PERCENTAGE_PRECISION(overrides?: CallOverrides): Promise<BigNumber>;

  createVesting(
    dao: PromiseOrValue<string>,
    recipientAddr: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getRemainingPercentage(
    token: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber, BigNumber]>;

  getVestIdByTokenId(
    token: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  tokenIdToVestId(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  updateOwner(
    vestId: PromiseOrValue<BigNumberish>,
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  vestBalance(
    vestId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  vestIds(overrides?: CallOverrides): Promise<BigNumber>;

  vests(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      BigNumber,
      BigNumber,
      IVesting.StepInfoStructOutput,
      IVesting.TimeInfoStructOutput,
      IVesting.VestNFTInfoStructOutput,
      IVesting.VestInfoStructOutput
    ] & {
      proposalId: string;
      claimed: BigNumber;
      total: BigNumber;
      stepInfo: IVesting.StepInfoStructOutput;
      timeInfo: IVesting.TimeInfoStructOutput;
      nftInfo: IVesting.VestNFTInfoStructOutput;
      vestInfo: IVesting.VestInfoStructOutput;
    }
  >;

  withdraw(
    dao: PromiseOrValue<string>,
    vestId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    PERCENTAGE_PRECISION(overrides?: CallOverrides): Promise<BigNumber>;

    createVesting(
      dao: PromiseOrValue<string>,
      recipientAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    getRemainingPercentage(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber, BigNumber]>;

    getVestIdByTokenId(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenIdToVestId(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    updateOwner(
      vestId: PromiseOrValue<BigNumberish>,
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    vestBalance(
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    vestIds(overrides?: CallOverrides): Promise<BigNumber>;

    vests(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        BigNumber,
        BigNumber,
        IVesting.StepInfoStructOutput,
        IVesting.TimeInfoStructOutput,
        IVesting.VestNFTInfoStructOutput,
        IVesting.VestInfoStructOutput
      ] & {
        proposalId: string;
        claimed: BigNumber;
        total: BigNumber;
        stepInfo: IVesting.StepInfoStructOutput;
        timeInfo: IVesting.TimeInfoStructOutput;
        nftInfo: IVesting.VestNFTInfoStructOutput;
        vestInfo: IVesting.VestInfoStructOutput;
      }
    >;

    withdraw(
      dao: PromiseOrValue<string>,
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "CancelVesting(uint256,uint256,uint256,address,bool)"(
      vestId?: PromiseOrValue<BigNumberish> | null,
      ownerAmount?: PromiseOrValue<BigNumberish> | null,
      recipientAmount?: PromiseOrValue<BigNumberish> | null,
      token?: null,
      toBentoBox?: null
    ): CancelVestingEventFilter;
    CancelVesting(
      vestId?: PromiseOrValue<BigNumberish> | null,
      ownerAmount?: PromiseOrValue<BigNumberish> | null,
      recipientAmount?: PromiseOrValue<BigNumberish> | null,
      token?: null,
      toBentoBox?: null
    ): CancelVestingEventFilter;

    "CreateVesting(uint256,address,address,uint32,uint32,uint32,uint32,uint128,uint128,bytes32)"(
      vestId?: PromiseOrValue<BigNumberish> | null,
      token?: null,
      recipient?: PromiseOrValue<string> | null,
      start?: null,
      cliffDuration?: null,
      stepDuration?: null,
      steps?: null,
      cliffShares?: null,
      stepShares?: null,
      proposalId?: null
    ): CreateVestingEventFilter;
    CreateVesting(
      vestId?: PromiseOrValue<BigNumberish> | null,
      token?: null,
      recipient?: PromiseOrValue<string> | null,
      start?: null,
      cliffDuration?: null,
      stepDuration?: null,
      steps?: null,
      cliffShares?: null,
      stepShares?: null,
      proposalId?: null
    ): CreateVestingEventFilter;

    "LogUpdateOwner(uint256,address)"(
      vestId?: PromiseOrValue<BigNumberish> | null,
      newOwner?: PromiseOrValue<string> | null
    ): LogUpdateOwnerEventFilter;
    LogUpdateOwner(
      vestId?: PromiseOrValue<BigNumberish> | null,
      newOwner?: PromiseOrValue<string> | null
    ): LogUpdateOwnerEventFilter;

    "Withdraw(uint256,address,uint256,bool)"(
      vestId?: PromiseOrValue<BigNumberish> | null,
      token?: PromiseOrValue<string> | null,
      amount?: PromiseOrValue<BigNumberish> | null,
      toBentoBox?: null
    ): WithdrawEventFilter;
    Withdraw(
      vestId?: PromiseOrValue<BigNumberish> | null,
      token?: PromiseOrValue<string> | null,
      amount?: PromiseOrValue<BigNumberish> | null,
      toBentoBox?: null
    ): WithdrawEventFilter;
  };

  estimateGas: {
    PERCENTAGE_PRECISION(overrides?: CallOverrides): Promise<BigNumber>;

    createVesting(
      dao: PromiseOrValue<string>,
      recipientAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getRemainingPercentage(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getVestIdByTokenId(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenIdToVestId(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    updateOwner(
      vestId: PromiseOrValue<BigNumberish>,
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    vestBalance(
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    vestIds(overrides?: CallOverrides): Promise<BigNumber>;

    vests(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      dao: PromiseOrValue<string>,
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    PERCENTAGE_PRECISION(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createVesting(
      dao: PromiseOrValue<string>,
      recipientAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getRemainingPercentage(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getVestIdByTokenId(
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenIdToVestId(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    updateOwner(
      vestId: PromiseOrValue<BigNumberish>,
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    vestBalance(
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    vestIds(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    vests(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      dao: PromiseOrValue<string>,
      vestId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
