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

export declare namespace FlexDaosetLibrary {
  export type VotingParamsStruct = {
    dao: PromiseOrValue<string>;
    votingAssetType: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenID: PromiseOrValue<BigNumberish>;
    votingWeightedType: PromiseOrValue<BigNumberish>;
    supportType: PromiseOrValue<BigNumberish>;
    quorumType: PromiseOrValue<BigNumberish>;
    support: PromiseOrValue<BigNumberish>;
    quorum: PromiseOrValue<BigNumberish>;
    votingPeriod: PromiseOrValue<BigNumberish>;
    executingPeriod: PromiseOrValue<BigNumberish>;
    governors: PromiseOrValue<string>[];
    allocations: PromiseOrValue<BigNumberish>[];
  };

  export type VotingParamsStructOutput = [
    string,
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    string[],
    BigNumber[]
  ] & {
    dao: string;
    votingAssetType: BigNumber;
    tokenAddress: string;
    tokenID: BigNumber;
    votingWeightedType: BigNumber;
    supportType: BigNumber;
    quorumType: BigNumber;
    support: BigNumber;
    quorum: BigNumber;
    votingPeriod: BigNumber;
    executingPeriod: BigNumber;
    governors: string[];
    allocations: BigNumber[];
  };

  export type VotingSupportInfoStruct = {
    supportType: PromiseOrValue<BigNumberish>;
    quorumType: PromiseOrValue<BigNumberish>;
    support: PromiseOrValue<BigNumberish>;
    quorum: PromiseOrValue<BigNumberish>;
  };

  export type VotingSupportInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    supportType: BigNumber;
    quorumType: BigNumber;
    support: BigNumber;
    quorum: BigNumber;
  };

  export type VotingAssetInfoStruct = {
    votingAssetType: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenID: PromiseOrValue<BigNumberish>;
    votingWeightedType: PromiseOrValue<BigNumberish>;
  };

  export type VotingAssetInfoStructOutput = [
    BigNumber,
    string,
    BigNumber,
    BigNumber
  ] & {
    votingAssetType: BigNumber;
    tokenAddress: string;
    tokenID: BigNumber;
    votingWeightedType: BigNumber;
  };

  export type VotingTimeInfoStruct = {
    votingPeriod: PromiseOrValue<BigNumberish>;
    executingPeriod: PromiseOrValue<BigNumberish>;
    creationTime: PromiseOrValue<BigNumberish>;
    stopVoteTime: PromiseOrValue<BigNumberish>;
  };

  export type VotingTimeInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    votingPeriod: BigNumber;
    executingPeriod: BigNumber;
    creationTime: BigNumber;
    stopVoteTime: BigNumber;
  };

  export type VotingAllocationStruct = {
    allocs: PromiseOrValue<BigNumberish>[];
  };

  export type VotingAllocationStructOutput = [BigNumber[]] & {
    allocs: BigNumber[];
  };

  export type VotingGovernorStruct = { governors: PromiseOrValue<string>[] };

  export type VotingGovernorStructOutput = [string[]] & { governors: string[] };
}

export interface FlexDaoSetVotingAdapterContractInterface
  extends utils.Interface {
  functions: {
    "getAllocations(address,bytes32)": FunctionFragment;
    "isActiveMember(address,address)": FunctionFragment;
    "ongoingVotingProposal(address)": FunctionFragment;
    "processVotingProposal(address,bytes32)": FunctionFragment;
    "submitVotingProposal((address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,address[],uint256[]))": FunctionFragment;
    "votingProposals(address,bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getAllocations"
      | "isActiveMember"
      | "ongoingVotingProposal"
      | "processVotingProposal"
      | "submitVotingProposal"
      | "votingProposals"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getAllocations",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveMember",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "ongoingVotingProposal",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "processVotingProposal",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitVotingProposal",
    values: [FlexDaosetLibrary.VotingParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "votingProposals",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(
    functionFragment: "getAllocations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ongoingVotingProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processVotingProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitVotingProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "votingProposals",
    data: BytesLike
  ): Result;

  events: {
    "ProposalCreated(address,bytes32,uint8)": EventFragment;
    "ProposalProcessed(address,bytes32,uint256,uint128,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalProcessed"): EventFragment;
}

export interface ProposalCreatedEventObject {
  daoAddr: string;
  proposalId: string;
  pType: number;
}
export type ProposalCreatedEvent = TypedEvent<
  [string, string, number],
  ProposalCreatedEventObject
>;

export type ProposalCreatedEventFilter = TypedEventFilter<ProposalCreatedEvent>;

export interface ProposalProcessedEventObject {
  daoAddr: string;
  proposalId: string;
  voteResult: BigNumber;
  allVotingWeight: BigNumber;
  nbYes: BigNumber;
  nbNo: BigNumber;
}
export type ProposalProcessedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber, BigNumber],
  ProposalProcessedEventObject
>;

export type ProposalProcessedEventFilter =
  TypedEventFilter<ProposalProcessedEvent>;

export interface FlexDaoSetVotingAdapterContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlexDaoSetVotingAdapterContractInterface;

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
    getAllocations(
      daoAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string[], BigNumber[]]>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    ongoingVotingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    processVotingProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitVotingProposal(
      params: FlexDaosetLibrary.VotingParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    votingProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        FlexDaosetLibrary.VotingSupportInfoStructOutput,
        FlexDaosetLibrary.VotingAssetInfoStructOutput,
        FlexDaosetLibrary.VotingTimeInfoStructOutput,
        FlexDaosetLibrary.VotingAllocationStructOutput,
        FlexDaosetLibrary.VotingGovernorStructOutput,
        number
      ] & {
        supportInfo: FlexDaosetLibrary.VotingSupportInfoStructOutput;
        votingAssetInfo: FlexDaosetLibrary.VotingAssetInfoStructOutput;
        timeInfo: FlexDaosetLibrary.VotingTimeInfoStructOutput;
        allocations: FlexDaosetLibrary.VotingAllocationStructOutput;
        governors: FlexDaosetLibrary.VotingGovernorStructOutput;
        state: number;
      }
    >;
  };

  getAllocations(
    daoAddr: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<[string[], BigNumber[]]>;

  isActiveMember(
    dao: PromiseOrValue<string>,
    _addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  ongoingVotingProposal(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  processVotingProposal(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitVotingProposal(
    params: FlexDaosetLibrary.VotingParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  votingProposals(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [
      FlexDaosetLibrary.VotingSupportInfoStructOutput,
      FlexDaosetLibrary.VotingAssetInfoStructOutput,
      FlexDaosetLibrary.VotingTimeInfoStructOutput,
      FlexDaosetLibrary.VotingAllocationStructOutput,
      FlexDaosetLibrary.VotingGovernorStructOutput,
      number
    ] & {
      supportInfo: FlexDaosetLibrary.VotingSupportInfoStructOutput;
      votingAssetInfo: FlexDaosetLibrary.VotingAssetInfoStructOutput;
      timeInfo: FlexDaosetLibrary.VotingTimeInfoStructOutput;
      allocations: FlexDaosetLibrary.VotingAllocationStructOutput;
      governors: FlexDaosetLibrary.VotingGovernorStructOutput;
      state: number;
    }
  >;

  callStatic: {
    getAllocations(
      daoAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string[], BigNumber[]]>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    ongoingVotingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    processVotingProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[number, BigNumber, BigNumber, BigNumber]>;

    submitVotingProposal(
      params: FlexDaosetLibrary.VotingParamsStruct,
      overrides?: CallOverrides
    ): Promise<string>;

    votingProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        FlexDaosetLibrary.VotingSupportInfoStructOutput,
        FlexDaosetLibrary.VotingAssetInfoStructOutput,
        FlexDaosetLibrary.VotingTimeInfoStructOutput,
        FlexDaosetLibrary.VotingAllocationStructOutput,
        FlexDaosetLibrary.VotingGovernorStructOutput,
        number
      ] & {
        supportInfo: FlexDaosetLibrary.VotingSupportInfoStructOutput;
        votingAssetInfo: FlexDaosetLibrary.VotingAssetInfoStructOutput;
        timeInfo: FlexDaosetLibrary.VotingTimeInfoStructOutput;
        allocations: FlexDaosetLibrary.VotingAllocationStructOutput;
        governors: FlexDaosetLibrary.VotingGovernorStructOutput;
        state: number;
      }
    >;
  };

  filters: {
    "ProposalCreated(address,bytes32,uint8)"(
      daoAddr?: null,
      proposalId?: null,
      pType?: null
    ): ProposalCreatedEventFilter;
    ProposalCreated(
      daoAddr?: null,
      proposalId?: null,
      pType?: null
    ): ProposalCreatedEventFilter;

    "ProposalProcessed(address,bytes32,uint256,uint128,uint256,uint256)"(
      daoAddr?: null,
      proposalId?: null,
      voteResult?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): ProposalProcessedEventFilter;
    ProposalProcessed(
      daoAddr?: null,
      proposalId?: null,
      voteResult?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): ProposalProcessedEventFilter;
  };

  estimateGas: {
    getAllocations(
      daoAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ongoingVotingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    processVotingProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitVotingProposal(
      params: FlexDaosetLibrary.VotingParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    votingProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getAllocations(
      daoAddr: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ongoingVotingProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    processVotingProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitVotingProposal(
      params: FlexDaosetLibrary.VotingParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    votingProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
