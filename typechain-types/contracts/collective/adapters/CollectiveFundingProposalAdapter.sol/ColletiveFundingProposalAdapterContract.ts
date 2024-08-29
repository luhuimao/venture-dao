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

export declare namespace ICollectiveFunding {
  export type FundingInfoStruct = {
    token: PromiseOrValue<string>;
    fundingAmount: PromiseOrValue<BigNumberish>;
    totalAmount: PromiseOrValue<BigNumberish>;
    receiver: PromiseOrValue<string>;
  };

  export type FundingInfoStructOutput = [
    string,
    BigNumber,
    BigNumber,
    string
  ] & {
    token: string;
    fundingAmount: BigNumber;
    totalAmount: BigNumber;
    receiver: string;
  };

  export type EscrowInfoStruct = {
    escrow: PromiseOrValue<boolean>;
    paybackToken: PromiseOrValue<string>;
    price: PromiseOrValue<BigNumberish>;
    paybackAmount: PromiseOrValue<BigNumberish>;
    approver: PromiseOrValue<string>;
  };

  export type EscrowInfoStructOutput = [
    boolean,
    string,
    BigNumber,
    BigNumber,
    string
  ] & {
    escrow: boolean;
    paybackToken: string;
    price: BigNumber;
    paybackAmount: BigNumber;
    approver: string;
  };

  export type VestingInfoStruct = {
    startTime: PromiseOrValue<BigNumberish>;
    endTime: PromiseOrValue<BigNumberish>;
    cliffEndTime: PromiseOrValue<BigNumberish>;
    cliffVestingAmount: PromiseOrValue<BigNumberish>;
    vestingInterval: PromiseOrValue<BigNumberish>;
    nftEnable: PromiseOrValue<boolean>;
    erc721: PromiseOrValue<string>;
    vestName: PromiseOrValue<string>;
    vestDescription: PromiseOrValue<string>;
  };

  export type VestingInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    boolean,
    string,
    string,
    string
  ] & {
    startTime: BigNumber;
    endTime: BigNumber;
    cliffEndTime: BigNumber;
    cliffVestingAmount: BigNumber;
    vestingInterval: BigNumber;
    nftEnable: boolean;
    erc721: string;
    vestName: string;
    vestDescription: string;
  };

  export type TimeInfoStruct = {
    startVotingTime: PromiseOrValue<BigNumberish>;
    stopVotingTime: PromiseOrValue<BigNumberish>;
  };

  export type TimeInfoStructOutput = [BigNumber, BigNumber] & {
    startVotingTime: BigNumber;
    stopVotingTime: BigNumber;
  };

  export type ProposalParamsStruct = {
    dao: PromiseOrValue<string>;
    fundingInfo: ICollectiveFunding.FundingInfoStruct;
    escrowInfo: ICollectiveFunding.EscrowInfoStruct;
    vestingInfo: ICollectiveFunding.VestingInfoStruct;
  };

  export type ProposalParamsStructOutput = [
    string,
    ICollectiveFunding.FundingInfoStructOutput,
    ICollectiveFunding.EscrowInfoStructOutput,
    ICollectiveFunding.VestingInfoStructOutput
  ] & {
    dao: string;
    fundingInfo: ICollectiveFunding.FundingInfoStructOutput;
    escrowInfo: ICollectiveFunding.EscrowInfoStructOutput;
    vestingInfo: ICollectiveFunding.VestingInfoStructOutput;
  };
}

export interface ColletiveFundingProposalAdapterContractInterface
  extends utils.Interface {
  functions: {
    "allDone(address)": FunctionFragment;
    "escrowPaybackTokens(address,bytes32,address)": FunctionFragment;
    "escrowedPaybackToken(address,bytes32,address)": FunctionFragment;
    "getQueueLength(address)": FunctionFragment;
    "isActiveMember(address,address)": FunctionFragment;
    "isPrposalInGracePeriod(address)": FunctionFragment;
    "ongoingProposal(address)": FunctionFragment;
    "processProposal(address,bytes32)": FunctionFragment;
    "proposalQueue(address)": FunctionFragment;
    "proposals(address,bytes32)": FunctionFragment;
    "protocolAddress()": FunctionFragment;
    "setProtocolAddress(address,address)": FunctionFragment;
    "startVotingProcess(address,bytes32)": FunctionFragment;
    "submitProposal((address,(address,uint256,uint256,address),(bool,address,uint256,uint256,address),(uint256,uint256,uint256,uint256,uint256,bool,address,string,string)))": FunctionFragment;
    "withdrawPaybakcToken(address,bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "allDone"
      | "escrowPaybackTokens"
      | "escrowedPaybackToken"
      | "getQueueLength"
      | "isActiveMember"
      | "isPrposalInGracePeriod"
      | "ongoingProposal"
      | "processProposal"
      | "proposalQueue"
      | "proposals"
      | "protocolAddress"
      | "setProtocolAddress"
      | "startVotingProcess"
      | "submitProposal"
      | "withdrawPaybakcToken"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "allDone",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "escrowPaybackTokens",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "escrowedPaybackToken",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getQueueLength",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveMember",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isPrposalInGracePeriod",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "ongoingProposal",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "processProposal",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "proposalQueue",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "proposals",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "protocolAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setProtocolAddress",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "startVotingProcess",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitProposal",
    values: [ICollectiveFunding.ProposalParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawPaybakcToken",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(functionFragment: "allDone", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "escrowPaybackTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "escrowedPaybackToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getQueueLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isPrposalInGracePeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ongoingProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proposalQueue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "proposals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "protocolAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProtocolAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "startVotingProcess",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawPaybakcToken",
    data: BytesLike
  ): Result;

  events: {
    "ProposalCreated(address,bytes32)": EventFragment;
    "ProposalExecuted(address,bytes32,uint256,uint256,uint256)": EventFragment;
    "StartVoting(address,bytes32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalExecuted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StartVoting"): EventFragment;
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

export interface ProposalExecutedEventObject {
  daoAddr: string;
  proposalId: string;
  allVotingWeight: BigNumber;
  nbYes: BigNumber;
  nbNo: BigNumber;
}
export type ProposalExecutedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber],
  ProposalExecutedEventObject
>;

export type ProposalExecutedEventFilter =
  TypedEventFilter<ProposalExecutedEvent>;

export interface StartVotingEventObject {
  daoAddr: string;
  proposalId: string;
}
export type StartVotingEvent = TypedEvent<
  [string, string],
  StartVotingEventObject
>;

export type StartVotingEventFilter = TypedEventFilter<StartVotingEvent>;

export interface ColletiveFundingProposalAdapterContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ColletiveFundingProposalAdapterContractInterface;

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
    allDone(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    escrowPaybackTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    escrowedPaybackToken(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getQueueLength(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isPrposalInGracePeriod(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    ongoingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    proposalQueue(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { _begin: BigNumber; _end: BigNumber }>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        ICollectiveFunding.FundingInfoStructOutput,
        ICollectiveFunding.EscrowInfoStructOutput,
        ICollectiveFunding.VestingInfoStructOutput,
        ICollectiveFunding.TimeInfoStructOutput,
        string,
        BigNumber,
        number
      ] & {
        fundingInfo: ICollectiveFunding.FundingInfoStructOutput;
        escrowInfo: ICollectiveFunding.EscrowInfoStructOutput;
        vestingInfo: ICollectiveFunding.VestingInfoStructOutput;
        timeInfo: ICollectiveFunding.TimeInfoStructOutput;
        proposer: string;
        executeBlockNum: BigNumber;
        state: number;
      }
    >;

    protocolAddress(overrides?: CallOverrides): Promise<[string]>;

    setProtocolAddress(
      dao: PromiseOrValue<string>,
      _protocolAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    startVotingProcess(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitProposal(
      params: ICollectiveFunding.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawPaybakcToken(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  allDone(
    dao: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  escrowPaybackTokens(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    arg2: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  escrowedPaybackToken(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    arg2: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getQueueLength(
    dao: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  isActiveMember(
    dao: PromiseOrValue<string>,
    _addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isPrposalInGracePeriod(
    dao: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  ongoingProposal(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  processProposal(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  proposalQueue(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber] & { _begin: BigNumber; _end: BigNumber }>;

  proposals(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [
      ICollectiveFunding.FundingInfoStructOutput,
      ICollectiveFunding.EscrowInfoStructOutput,
      ICollectiveFunding.VestingInfoStructOutput,
      ICollectiveFunding.TimeInfoStructOutput,
      string,
      BigNumber,
      number
    ] & {
      fundingInfo: ICollectiveFunding.FundingInfoStructOutput;
      escrowInfo: ICollectiveFunding.EscrowInfoStructOutput;
      vestingInfo: ICollectiveFunding.VestingInfoStructOutput;
      timeInfo: ICollectiveFunding.TimeInfoStructOutput;
      proposer: string;
      executeBlockNum: BigNumber;
      state: number;
    }
  >;

  protocolAddress(overrides?: CallOverrides): Promise<string>;

  setProtocolAddress(
    dao: PromiseOrValue<string>,
    _protocolAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  startVotingProcess(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitProposal(
    params: ICollectiveFunding.ProposalParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawPaybakcToken(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    allDone(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    escrowPaybackTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    escrowedPaybackToken(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getQueueLength(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isPrposalInGracePeriod(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    ongoingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    proposalQueue(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { _begin: BigNumber; _end: BigNumber }>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        ICollectiveFunding.FundingInfoStructOutput,
        ICollectiveFunding.EscrowInfoStructOutput,
        ICollectiveFunding.VestingInfoStructOutput,
        ICollectiveFunding.TimeInfoStructOutput,
        string,
        BigNumber,
        number
      ] & {
        fundingInfo: ICollectiveFunding.FundingInfoStructOutput;
        escrowInfo: ICollectiveFunding.EscrowInfoStructOutput;
        vestingInfo: ICollectiveFunding.VestingInfoStructOutput;
        timeInfo: ICollectiveFunding.TimeInfoStructOutput;
        proposer: string;
        executeBlockNum: BigNumber;
        state: number;
      }
    >;

    protocolAddress(overrides?: CallOverrides): Promise<string>;

    setProtocolAddress(
      dao: PromiseOrValue<string>,
      _protocolAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    startVotingProcess(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    submitProposal(
      params: ICollectiveFunding.ProposalParamsStruct,
      overrides?: CallOverrides
    ): Promise<boolean>;

    withdrawPaybakcToken(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
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

    "ProposalExecuted(address,bytes32,uint256,uint256,uint256)"(
      daoAddr?: null,
      proposalId?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): ProposalExecutedEventFilter;
    ProposalExecuted(
      daoAddr?: null,
      proposalId?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): ProposalExecutedEventFilter;

    "StartVoting(address,bytes32)"(
      daoAddr?: null,
      proposalId?: null
    ): StartVotingEventFilter;
    StartVoting(daoAddr?: null, proposalId?: null): StartVotingEventFilter;
  };

  estimateGas: {
    allDone(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    escrowPaybackTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    escrowedPaybackToken(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getQueueLength(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isPrposalInGracePeriod(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ongoingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    proposalQueue(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    protocolAddress(overrides?: CallOverrides): Promise<BigNumber>;

    setProtocolAddress(
      dao: PromiseOrValue<string>,
      _protocolAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    startVotingProcess(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitProposal(
      params: ICollectiveFunding.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawPaybakcToken(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    allDone(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    escrowPaybackTokens(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    escrowedPaybackToken(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getQueueLength(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isPrposalInGracePeriod(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ongoingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    processProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    proposalQueue(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    protocolAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setProtocolAddress(
      dao: PromiseOrValue<string>,
      _protocolAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    startVotingProcess(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitProposal(
      params: ICollectiveFunding.ProposalParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawPaybakcToken(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
