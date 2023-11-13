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

export declare namespace IVintageFundRaise {
  export type FundRaiseAmountInfoStruct = {
    fundRaiseTarget: PromiseOrValue<BigNumberish>;
    fundRaiseMaxAmount: PromiseOrValue<BigNumberish>;
    lpMinDepositAmount: PromiseOrValue<BigNumberish>;
    lpMaxDepositAmount: PromiseOrValue<BigNumberish>;
  };

  export type FundRaiseAmountInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    fundRaiseTarget: BigNumber;
    fundRaiseMaxAmount: BigNumber;
    lpMinDepositAmount: BigNumber;
    lpMaxDepositAmount: BigNumber;
  };

  export type FundRiaseTimeInfoStruct = {
    fundRaiseStartTime: PromiseOrValue<BigNumberish>;
    fundRaiseEndTime: PromiseOrValue<BigNumberish>;
    fundTerm: PromiseOrValue<BigNumberish>;
    redemptPeriod: PromiseOrValue<BigNumberish>;
    redemptDuration: PromiseOrValue<BigNumberish>;
    refundDuration: PromiseOrValue<BigNumberish>;
  };

  export type FundRiaseTimeInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    fundRaiseStartTime: BigNumber;
    fundRaiseEndTime: BigNumber;
    fundTerm: BigNumber;
    redemptPeriod: BigNumber;
    redemptDuration: BigNumber;
    refundDuration: BigNumber;
  };

  export type FundRaiseRewardAndFeeInfoStruct = {
    managementFeeRatio: PromiseOrValue<BigNumberish>;
    paybackTokenManagementFeeRatio: PromiseOrValue<BigNumberish>;
    redepmtFeeRatio: PromiseOrValue<BigNumberish>;
    protocolFeeRatio: PromiseOrValue<BigNumberish>;
    managementFeeAddress: PromiseOrValue<string>;
  };

  export type FundRaiseRewardAndFeeInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    string
  ] & {
    managementFeeRatio: BigNumber;
    paybackTokenManagementFeeRatio: BigNumber;
    redepmtFeeRatio: BigNumber;
    protocolFeeRatio: BigNumber;
    managementFeeAddress: string;
  };

  export type ProoserRewardStruct = {
    fundFromInverstor: PromiseOrValue<BigNumberish>;
    projectTokenFromInvestor: PromiseOrValue<BigNumberish>;
  };

  export type ProoserRewardStructOutput = [BigNumber, BigNumber] & {
    fundFromInverstor: BigNumber;
    projectTokenFromInvestor: BigNumber;
  };

  export type PriorityDepositeStruct = {
    enable: PromiseOrValue<boolean>;
    vtype: PromiseOrValue<BigNumberish>;
    token: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    amount: PromiseOrValue<BigNumberish>;
  };

  export type PriorityDepositeStructOutput = [
    boolean,
    number,
    string,
    BigNumber,
    BigNumber
  ] & {
    enable: boolean;
    vtype: number;
    token: string;
    tokenId: BigNumber;
    amount: BigNumber;
  };

  export type ProposalFundRaiseInfoStruct = {
    fundRaiseMinTarget: PromiseOrValue<BigNumberish>;
    fundRaiseMaxCap: PromiseOrValue<BigNumberish>;
    lpMinDepositAmount: PromiseOrValue<BigNumberish>;
    lpMaxDepositAmount: PromiseOrValue<BigNumberish>;
    fundRaiseType: PromiseOrValue<BigNumberish>;
  };

  export type ProposalFundRaiseInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    number
  ] & {
    fundRaiseMinTarget: BigNumber;
    fundRaiseMaxCap: BigNumber;
    lpMinDepositAmount: BigNumber;
    lpMaxDepositAmount: BigNumber;
    fundRaiseType: number;
  };

  export type ProposalTimeInfoStruct = {
    startTime: PromiseOrValue<BigNumberish>;
    endTime: PromiseOrValue<BigNumberish>;
    fundTerm: PromiseOrValue<BigNumberish>;
    redemptPeriod: PromiseOrValue<BigNumberish>;
    redemptInterval: PromiseOrValue<BigNumberish>;
    refundPeriod: PromiseOrValue<BigNumberish>;
  };

  export type ProposalTimeInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    startTime: BigNumber;
    endTime: BigNumber;
    fundTerm: BigNumber;
    redemptPeriod: BigNumber;
    redemptInterval: BigNumber;
    refundPeriod: BigNumber;
  };

  export type ProposalFeeInfoStruct = {
    managementFeeRatio: PromiseOrValue<BigNumberish>;
    paybackTokenManagementFeeRatio: PromiseOrValue<BigNumberish>;
    redepmtFeeRatio: PromiseOrValue<BigNumberish>;
  };

  export type ProposalFeeInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    managementFeeRatio: BigNumber;
    paybackTokenManagementFeeRatio: BigNumber;
    redepmtFeeRatio: BigNumber;
  };

  export type ProposalAddressInfoStruct = {
    managementFeeAddress: PromiseOrValue<string>;
    fundRaiseTokenAddress: PromiseOrValue<string>;
  };

  export type ProposalAddressInfoStructOutput = [string, string] & {
    managementFeeAddress: string;
    fundRaiseTokenAddress: string;
  };

  export type ProposalPriorityDepositInfoStruct = {
    enable: PromiseOrValue<boolean>;
    vtype: PromiseOrValue<BigNumberish>;
    token: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    amount: PromiseOrValue<BigNumberish>;
    whitelist: PromiseOrValue<string>[];
  };

  export type ProposalPriorityDepositInfoStructOutput = [
    boolean,
    number,
    string,
    BigNumber,
    BigNumber,
    string[]
  ] & {
    enable: boolean;
    vtype: number;
    token: string;
    tokenId: BigNumber;
    amount: BigNumber;
    whitelist: string[];
  };

  export type ProposalParamsStruct = {
    dao: PromiseOrValue<string>;
    proposalFundRaiseInfo: IVintageFundRaise.ProposalFundRaiseInfoStruct;
    proposalTimeInfo: IVintageFundRaise.ProposalTimeInfoStruct;
    proposalFeeInfo: IVintageFundRaise.ProposalFeeInfoStruct;
    proposalAddressInfo: IVintageFundRaise.ProposalAddressInfoStruct;
    proposerReward: IVintageFundRaise.ProoserRewardStruct;
    priorityDeposite: IVintageFundRaise.ProposalPriorityDepositInfoStruct;
  };

  export type ProposalParamsStructOutput = [
    string,
    IVintageFundRaise.ProposalFundRaiseInfoStructOutput,
    IVintageFundRaise.ProposalTimeInfoStructOutput,
    IVintageFundRaise.ProposalFeeInfoStructOutput,
    IVintageFundRaise.ProposalAddressInfoStructOutput,
    IVintageFundRaise.ProoserRewardStructOutput,
    IVintageFundRaise.ProposalPriorityDepositInfoStructOutput
  ] & {
    dao: string;
    proposalFundRaiseInfo: IVintageFundRaise.ProposalFundRaiseInfoStructOutput;
    proposalTimeInfo: IVintageFundRaise.ProposalTimeInfoStructOutput;
    proposalFeeInfo: IVintageFundRaise.ProposalFeeInfoStructOutput;
    proposalAddressInfo: IVintageFundRaise.ProposalAddressInfoStructOutput;
    proposerReward: IVintageFundRaise.ProoserRewardStructOutput;
    priorityDeposite: IVintageFundRaise.ProposalPriorityDepositInfoStructOutput;
  };
}

export interface VintageFundRaiseAdapterContractInterface
  extends utils.Interface {
  functions: {
    "Proposals(address,bytes32)": FunctionFragment;
    "createdFundCounter(address)": FunctionFragment;
    "getWhiteList(address,bytes32)": FunctionFragment;
    "isPriorityDepositer(address,bytes32,address)": FunctionFragment;
    "lastProposalIds(address)": FunctionFragment;
    "processProposal(address,bytes32)": FunctionFragment;
    "submitProposal((address,(uint256,uint256,uint256,uint256,uint8),(uint256,uint256,uint256,uint256,uint256,uint256),(uint256,uint256,uint256),(address,address),(uint256,uint256),(bool,uint8,address,uint256,uint256,address[])))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "Proposals"
      | "createdFundCounter"
      | "getWhiteList"
      | "isPriorityDepositer"
      | "lastProposalIds"
      | "processProposal"
      | "submitProposal"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "Proposals",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "createdFundCounter",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getWhiteList",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isPriorityDepositer",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "lastProposalIds",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "processProposal",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitProposal",
    values: [IVintageFundRaise.ProposalParamsStruct]
  ): string;

  decodeFunctionResult(functionFragment: "Proposals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createdFundCounter",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWhiteList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isPriorityDepositer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastProposalIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitProposal",
    data: BytesLike
  ): Result;

  events: {
    "ProposalCreated(address,bytes32)": EventFragment;
    "proposalExecuted(address,bytes32,uint8,uint128,uint128,uint128,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "proposalExecuted"): EventFragment;
}

export interface ProposalCreatedEventObject {
  daoAddr: string;
  proposalId: string;
}
export type ProposalCreatedEvent = TypedEvent<
  [string, string],
  ProposalCreatedEventObject
>;

export type ProposalCreatedEventFilter = TypedEventFilter<ProposalCreatedEvent>;

export interface proposalExecutedEventObject {
  daoAddr: string;
  proposalId: string;
  state: number;
  allVotingWeight: BigNumber;
  nbYes: BigNumber;
  nbNo: BigNumber;
  voteResult: BigNumber;
}
export type proposalExecutedEvent = TypedEvent<
  [string, string, number, BigNumber, BigNumber, BigNumber, BigNumber],
  proposalExecutedEventObject
>;

export type proposalExecutedEventFilter =
  TypedEventFilter<proposalExecutedEvent>;

export interface VintageFundRaiseAdapterContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VintageFundRaiseAdapterContractInterface;

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
    Proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        IVintageFundRaise.FundRaiseAmountInfoStructOutput,
        IVintageFundRaise.FundRiaseTimeInfoStructOutput,
        IVintageFundRaise.FundRaiseRewardAndFeeInfoStructOutput,
        IVintageFundRaise.ProoserRewardStructOutput,
        IVintageFundRaise.PriorityDepositeStructOutput,
        number,
        number,
        BigNumber,
        BigNumber
      ] & {
        acceptTokenAddr: string;
        amountInfo: IVintageFundRaise.FundRaiseAmountInfoStructOutput;
        timesInfo: IVintageFundRaise.FundRiaseTimeInfoStructOutput;
        feeInfo: IVintageFundRaise.FundRaiseRewardAndFeeInfoStructOutput;
        proposerReward: IVintageFundRaise.ProoserRewardStructOutput;
        priorityDeposite: IVintageFundRaise.PriorityDepositeStructOutput;
        fundRaiseType: number;
        state: number;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
      }
    >;

    createdFundCounter(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    isPriorityDepositer(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    lastProposalIds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitProposal(
      params: IVintageFundRaise.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  Proposals(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      IVintageFundRaise.FundRaiseAmountInfoStructOutput,
      IVintageFundRaise.FundRiaseTimeInfoStructOutput,
      IVintageFundRaise.FundRaiseRewardAndFeeInfoStructOutput,
      IVintageFundRaise.ProoserRewardStructOutput,
      IVintageFundRaise.PriorityDepositeStructOutput,
      number,
      number,
      BigNumber,
      BigNumber
    ] & {
      acceptTokenAddr: string;
      amountInfo: IVintageFundRaise.FundRaiseAmountInfoStructOutput;
      timesInfo: IVintageFundRaise.FundRiaseTimeInfoStructOutput;
      feeInfo: IVintageFundRaise.FundRaiseRewardAndFeeInfoStructOutput;
      proposerReward: IVintageFundRaise.ProoserRewardStructOutput;
      priorityDeposite: IVintageFundRaise.PriorityDepositeStructOutput;
      fundRaiseType: number;
      state: number;
      creationTime: BigNumber;
      stopVoteTime: BigNumber;
    }
  >;

  createdFundCounter(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getWhiteList(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  isPriorityDepositer(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  lastProposalIds(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  processProposal(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitProposal(
    params: IVintageFundRaise.ProposalParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    Proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        IVintageFundRaise.FundRaiseAmountInfoStructOutput,
        IVintageFundRaise.FundRiaseTimeInfoStructOutput,
        IVintageFundRaise.FundRaiseRewardAndFeeInfoStructOutput,
        IVintageFundRaise.ProoserRewardStructOutput,
        IVintageFundRaise.PriorityDepositeStructOutput,
        number,
        number,
        BigNumber,
        BigNumber
      ] & {
        acceptTokenAddr: string;
        amountInfo: IVintageFundRaise.FundRaiseAmountInfoStructOutput;
        timesInfo: IVintageFundRaise.FundRiaseTimeInfoStructOutput;
        feeInfo: IVintageFundRaise.FundRaiseRewardAndFeeInfoStructOutput;
        proposerReward: IVintageFundRaise.ProoserRewardStructOutput;
        priorityDeposite: IVintageFundRaise.PriorityDepositeStructOutput;
        fundRaiseType: number;
        state: number;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
      }
    >;

    createdFundCounter(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    isPriorityDepositer(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    lastProposalIds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    submitProposal(
      params: IVintageFundRaise.ProposalParamsStruct,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "ProposalCreated(address,bytes32)"(
      daoAddr?: null,
      proposalId?: null
    ): ProposalCreatedEventFilter;
    ProposalCreated(
      daoAddr?: null,
      proposalId?: null
    ): ProposalCreatedEventFilter;

    "proposalExecuted(address,bytes32,uint8,uint128,uint128,uint128,uint256)"(
      daoAddr?: null,
      proposalId?: null,
      state?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null,
      voteResult?: null
    ): proposalExecutedEventFilter;
    proposalExecuted(
      daoAddr?: null,
      proposalId?: null,
      state?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null,
      voteResult?: null
    ): proposalExecutedEventFilter;
  };

  estimateGas: {
    Proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createdFundCounter(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isPriorityDepositer(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lastProposalIds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitProposal(
      params: IVintageFundRaise.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    Proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createdFundCounter(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isPriorityDepositer(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lastProposalIds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitProposal(
      params: IVintageFundRaise.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
