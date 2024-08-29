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

export declare namespace ICollectiveFundRaise {
  export type FundRaiseTimeInfoStruct = {
    startTime: PromiseOrValue<BigNumberish>;
    endTime: PromiseOrValue<BigNumberish>;
  };

  export type FundRaiseTimeInfoStructOutput = [BigNumber, BigNumber] & {
    startTime: BigNumber;
    endTime: BigNumber;
  };

  export type FundInfoStruct = {
    tokenAddress: PromiseOrValue<string>;
    miniTarget: PromiseOrValue<BigNumberish>;
    maxCap: PromiseOrValue<BigNumberish>;
    miniDeposit: PromiseOrValue<BigNumberish>;
    maxDeposit: PromiseOrValue<BigNumberish>;
  };

  export type FundInfoStructOutput = [
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    tokenAddress: string;
    miniTarget: BigNumber;
    maxCap: BigNumber;
    miniDeposit: BigNumber;
    maxDeposit: BigNumber;
  };

  export type PriorityDepositorInfoStruct = {
    enable: PromiseOrValue<boolean>;
    valifyType: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    miniHolding: PromiseOrValue<BigNumberish>;
    whitelist: PromiseOrValue<string>[];
  };

  export type PriorityDepositorInfoStructOutput = [
    boolean,
    number,
    string,
    BigNumber,
    BigNumber,
    string[]
  ] & {
    enable: boolean;
    valifyType: number;
    tokenAddress: string;
    tokenId: BigNumber;
    miniHolding: BigNumber;
    whitelist: string[];
  };

  export type ProposalParamsStruct = {
    dao: PromiseOrValue<string>;
    fundRaiseType: PromiseOrValue<BigNumberish>;
    fundInfo: ICollectiveFundRaise.FundInfoStruct;
    timeInfo: ICollectiveFundRaise.FundRaiseTimeInfoStruct;
    priorityDepositor: ICollectiveFundRaise.PriorityDepositorInfoStruct;
  };

  export type ProposalParamsStructOutput = [
    string,
    number,
    ICollectiveFundRaise.FundInfoStructOutput,
    ICollectiveFundRaise.FundRaiseTimeInfoStructOutput,
    ICollectiveFundRaise.PriorityDepositorInfoStructOutput
  ] & {
    dao: string;
    fundRaiseType: number;
    fundInfo: ICollectiveFundRaise.FundInfoStructOutput;
    timeInfo: ICollectiveFundRaise.FundRaiseTimeInfoStructOutput;
    priorityDepositor: ICollectiveFundRaise.PriorityDepositorInfoStructOutput;
  };
}

export interface ColletiveFundRaiseProposalContractInterface
  extends utils.Interface {
  functions: {
    "getPriorityDepositeWhiteList(address,bytes32)": FunctionFragment;
    "isActiveMember(address,address)": FunctionFragment;
    "lastProposalIds(address)": FunctionFragment;
    "processProposal(address,bytes32)": FunctionFragment;
    "proposals(address,bytes32)": FunctionFragment;
    "submitProposal((address,uint8,(address,uint256,uint256,uint256,uint256),(uint256,uint256),(bool,uint8,address,uint256,uint256,address[])))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getPriorityDepositeWhiteList"
      | "isActiveMember"
      | "lastProposalIds"
      | "processProposal"
      | "proposals"
      | "submitProposal"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getPriorityDepositeWhiteList",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveMember",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
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
    functionFragment: "proposals",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitProposal",
    values: [ICollectiveFundRaise.ProposalParamsStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "getPriorityDepositeWhiteList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveMember",
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
  decodeFunctionResult(functionFragment: "proposals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "submitProposal",
    data: BytesLike
  ): Result;

  events: {
    "ProposalCreated(address,bytes32)": EventFragment;
    "proposalExecuted(address,bytes32,uint8,uint256,uint256,uint256,uint256)": EventFragment;
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

export interface ColletiveFundRaiseProposalContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ColletiveFundRaiseProposalContractInterface;

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
    getPriorityDepositeWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
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

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        ICollectiveFundRaise.FundRaiseTimeInfoStructOutput,
        ICollectiveFundRaise.FundInfoStructOutput,
        ICollectiveFundRaise.PriorityDepositorInfoStructOutput,
        number,
        number,
        BigNumber,
        BigNumber
      ] & {
        timeInfo: ICollectiveFundRaise.FundRaiseTimeInfoStructOutput;
        fundInfo: ICollectiveFundRaise.FundInfoStructOutput;
        priorityDepositor: ICollectiveFundRaise.PriorityDepositorInfoStructOutput;
        fundRaiseType: number;
        state: number;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
      }
    >;

    submitProposal(
      params: ICollectiveFundRaise.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getPriorityDepositeWhiteList(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  isActiveMember(
    dao: PromiseOrValue<string>,
    _addr: PromiseOrValue<string>,
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

  proposals(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [
      ICollectiveFundRaise.FundRaiseTimeInfoStructOutput,
      ICollectiveFundRaise.FundInfoStructOutput,
      ICollectiveFundRaise.PriorityDepositorInfoStructOutput,
      number,
      number,
      BigNumber,
      BigNumber
    ] & {
      timeInfo: ICollectiveFundRaise.FundRaiseTimeInfoStructOutput;
      fundInfo: ICollectiveFundRaise.FundInfoStructOutput;
      priorityDepositor: ICollectiveFundRaise.PriorityDepositorInfoStructOutput;
      fundRaiseType: number;
      state: number;
      creationTime: BigNumber;
      stopVoteTime: BigNumber;
    }
  >;

  submitProposal(
    params: ICollectiveFundRaise.ProposalParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getPriorityDepositeWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
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

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        ICollectiveFundRaise.FundRaiseTimeInfoStructOutput,
        ICollectiveFundRaise.FundInfoStructOutput,
        ICollectiveFundRaise.PriorityDepositorInfoStructOutput,
        number,
        number,
        BigNumber,
        BigNumber
      ] & {
        timeInfo: ICollectiveFundRaise.FundRaiseTimeInfoStructOutput;
        fundInfo: ICollectiveFundRaise.FundInfoStructOutput;
        priorityDepositor: ICollectiveFundRaise.PriorityDepositorInfoStructOutput;
        fundRaiseType: number;
        state: number;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
      }
    >;

    submitProposal(
      params: ICollectiveFundRaise.ProposalParamsStruct,
      overrides?: CallOverrides
    ): Promise<boolean>;
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

    "proposalExecuted(address,bytes32,uint8,uint256,uint256,uint256,uint256)"(
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
    getPriorityDepositeWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
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

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    submitProposal(
      params: ICollectiveFundRaise.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getPriorityDepositeWhiteList(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
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

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    submitProposal(
      params: ICollectiveFundRaise.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
