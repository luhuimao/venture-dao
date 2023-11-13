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

export interface VintageVotingContractInterface extends utils.Interface {
  functions: {
    "ADAPTER_NAME()": FunctionFragment;
    "checkIfVoted(address,bytes32,address)": FunctionFragment;
    "configureDao(address,uint256,uint256)": FunctionFragment;
    "getAdapterName()": FunctionFragment;
    "getAllRaiserWeight(address)": FunctionFragment;
    "getAllRaiserWeightByProposalId(address,bytes32)": FunctionFragment;
    "getSenderAddress(address,address,bytes,address)": FunctionFragment;
    "getVotingWeight(address,address)": FunctionFragment;
    "startNewVotingForProposal(address,bytes32,uint256,bytes)": FunctionFragment;
    "submitVote(address,bytes32,uint256)": FunctionFragment;
    "voteResult(address,bytes32)": FunctionFragment;
    "voteWeights(address,bytes32,address)": FunctionFragment;
    "votes(address,bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "ADAPTER_NAME"
      | "checkIfVoted"
      | "configureDao"
      | "getAdapterName"
      | "getAllRaiserWeight"
      | "getAllRaiserWeightByProposalId"
      | "getSenderAddress"
      | "getVotingWeight"
      | "startNewVotingForProposal"
      | "submitVote"
      | "voteResult"
      | "voteWeights"
      | "votes"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "ADAPTER_NAME",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "checkIfVoted",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "configureDao",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getAdapterName",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAllRaiserWeight",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getAllRaiserWeightByProposalId",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "getSenderAddress",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getVotingWeight",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "startNewVotingForProposal",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "submitVote",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "voteResult",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "voteWeights",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "votes",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(
    functionFragment: "ADAPTER_NAME",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkIfVoted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "configureDao",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAdapterName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllRaiserWeight",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllRaiserWeightByProposalId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSenderAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVotingWeight",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "startNewVotingForProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "submitVote", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "voteResult", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "voteWeights",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "votes", data: BytesLike): Result;

  events: {
    "ConfigureDao(uint256,uint256)": EventFragment;
    "RevokeVote(bytes32,uint256,address,uint128,uint256)": EventFragment;
    "StartNewVotingForProposal(address,bytes32,uint256,uint256)": EventFragment;
    "SubmitVote(address,bytes32,uint256,uint256,uint256,address,uint256,uint256,uint256,uint256,uint256)": EventFragment;
    "UpdateVoteWeight(bytes32,uint256,address,uint128,uint128,uint128,uint128)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ConfigureDao"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RevokeVote"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StartNewVotingForProposal"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SubmitVote"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UpdateVoteWeight"): EventFragment;
}

export interface ConfigureDaoEventObject {
  votingPeriod: BigNumber;
  gracePeriod: BigNumber;
}
export type ConfigureDaoEvent = TypedEvent<
  [BigNumber, BigNumber],
  ConfigureDaoEventObject
>;

export type ConfigureDaoEventFilter = TypedEventFilter<ConfigureDaoEvent>;

export interface RevokeVoteEventObject {
  proposalId: string;
  blocktime: BigNumber;
  voter: string;
  origenalVotingWeight: BigNumber;
  origenalVoteValue: BigNumber;
}
export type RevokeVoteEvent = TypedEvent<
  [string, BigNumber, string, BigNumber, BigNumber],
  RevokeVoteEventObject
>;

export type RevokeVoteEventFilter = TypedEventFilter<RevokeVoteEvent>;

export interface StartNewVotingForProposalEventObject {
  daoAddr: string;
  proposalId: string;
  votestartingTime: BigNumber;
  voteblockNumber: BigNumber;
}
export type StartNewVotingForProposalEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  StartNewVotingForProposalEventObject
>;

export type StartNewVotingForProposalEventFilter =
  TypedEventFilter<StartNewVotingForProposalEvent>;

export interface SubmitVoteEventObject {
  daoAddr: string;
  proposalId: string;
  votingTime: BigNumber;
  voteStartTime: BigNumber;
  voteStopTime: BigNumber;
  voter: string;
  voteValue: BigNumber;
  nbYes: BigNumber;
  nbNo: BigNumber;
  currentQuorum: BigNumber;
  currentSupport: BigNumber;
}
export type SubmitVoteEvent = TypedEvent<
  [
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ],
  SubmitVoteEventObject
>;

export type SubmitVoteEventFilter = TypedEventFilter<SubmitVoteEvent>;

export interface UpdateVoteWeightEventObject {
  proposalId: string;
  blocktime: BigNumber;
  voter: string;
  oldVotingWeight: BigNumber;
  newVotingWeight: BigNumber;
  nbYes: BigNumber;
  nbNo: BigNumber;
}
export type UpdateVoteWeightEvent = TypedEvent<
  [string, BigNumber, string, BigNumber, BigNumber, BigNumber, BigNumber],
  UpdateVoteWeightEventObject
>;

export type UpdateVoteWeightEventFilter =
  TypedEventFilter<UpdateVoteWeightEvent>;

export interface VintageVotingContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VintageVotingContractInterface;

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
    ADAPTER_NAME(overrides?: CallOverrides): Promise<[string]>;

    checkIfVoted(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voterAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    configureDao(
      dao: PromiseOrValue<string>,
      votingPeriod: PromiseOrValue<BigNumberish>,
      gracePeriod: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getAdapterName(overrides?: CallOverrides): Promise<[string]>;

    getAllRaiserWeight(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getAllRaiserWeightByProposalId(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getSenderAddress(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getVotingWeight(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    startNewVotingForProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      projectVotingTimestamp: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitVote(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voteValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    voteResult(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [number, BigNumber, BigNumber] & {
        state: number;
        nbYes: BigNumber;
        nbNo: BigNumber;
      }
    >;

    voteWeights(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    votes(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        nbYes: BigNumber;
        nbNo: BigNumber;
        startingTime: BigNumber;
        stopTime: BigNumber;
        voters: BigNumber;
      }
    >;
  };

  ADAPTER_NAME(overrides?: CallOverrides): Promise<string>;

  checkIfVoted(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    voterAddr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  configureDao(
    dao: PromiseOrValue<string>,
    votingPeriod: PromiseOrValue<BigNumberish>,
    gracePeriod: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getAdapterName(overrides?: CallOverrides): Promise<string>;

  getAllRaiserWeight(
    dao: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getAllRaiserWeightByProposalId(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getSenderAddress(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<BytesLike>,
    sender: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  getVotingWeight(
    dao: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  startNewVotingForProposal(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    projectVotingTimestamp: PromiseOrValue<BigNumberish>,
    arg3: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitVote(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    voteValue: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  voteResult(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [number, BigNumber, BigNumber] & {
      state: number;
      nbYes: BigNumber;
      nbNo: BigNumber;
    }
  >;

  voteWeights(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    arg2: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  votes(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      nbYes: BigNumber;
      nbNo: BigNumber;
      startingTime: BigNumber;
      stopTime: BigNumber;
      voters: BigNumber;
    }
  >;

  callStatic: {
    ADAPTER_NAME(overrides?: CallOverrides): Promise<string>;

    checkIfVoted(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voterAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    configureDao(
      dao: PromiseOrValue<string>,
      votingPeriod: PromiseOrValue<BigNumberish>,
      gracePeriod: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getAdapterName(overrides?: CallOverrides): Promise<string>;

    getAllRaiserWeight(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAllRaiserWeightByProposalId(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSenderAddress(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    getVotingWeight(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    startNewVotingForProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      projectVotingTimestamp: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    submitVote(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voteValue: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    voteResult(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [number, BigNumber, BigNumber] & {
        state: number;
        nbYes: BigNumber;
        nbNo: BigNumber;
      }
    >;

    voteWeights(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    votes(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        nbYes: BigNumber;
        nbNo: BigNumber;
        startingTime: BigNumber;
        stopTime: BigNumber;
        voters: BigNumber;
      }
    >;
  };

  filters: {
    "ConfigureDao(uint256,uint256)"(
      votingPeriod?: null,
      gracePeriod?: null
    ): ConfigureDaoEventFilter;
    ConfigureDao(
      votingPeriod?: null,
      gracePeriod?: null
    ): ConfigureDaoEventFilter;

    "RevokeVote(bytes32,uint256,address,uint128,uint256)"(
      proposalId?: null,
      blocktime?: null,
      voter?: null,
      origenalVotingWeight?: null,
      origenalVoteValue?: null
    ): RevokeVoteEventFilter;
    RevokeVote(
      proposalId?: null,
      blocktime?: null,
      voter?: null,
      origenalVotingWeight?: null,
      origenalVoteValue?: null
    ): RevokeVoteEventFilter;

    "StartNewVotingForProposal(address,bytes32,uint256,uint256)"(
      daoAddr?: null,
      proposalId?: null,
      votestartingTime?: null,
      voteblockNumber?: null
    ): StartNewVotingForProposalEventFilter;
    StartNewVotingForProposal(
      daoAddr?: null,
      proposalId?: null,
      votestartingTime?: null,
      voteblockNumber?: null
    ): StartNewVotingForProposalEventFilter;

    "SubmitVote(address,bytes32,uint256,uint256,uint256,address,uint256,uint256,uint256,uint256,uint256)"(
      daoAddr?: null,
      proposalId?: null,
      votingTime?: null,
      voteStartTime?: null,
      voteStopTime?: null,
      voter?: null,
      voteValue?: null,
      nbYes?: null,
      nbNo?: null,
      currentQuorum?: null,
      currentSupport?: null
    ): SubmitVoteEventFilter;
    SubmitVote(
      daoAddr?: null,
      proposalId?: null,
      votingTime?: null,
      voteStartTime?: null,
      voteStopTime?: null,
      voter?: null,
      voteValue?: null,
      nbYes?: null,
      nbNo?: null,
      currentQuorum?: null,
      currentSupport?: null
    ): SubmitVoteEventFilter;

    "UpdateVoteWeight(bytes32,uint256,address,uint128,uint128,uint128,uint128)"(
      proposalId?: null,
      blocktime?: null,
      voter?: null,
      oldVotingWeight?: null,
      newVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): UpdateVoteWeightEventFilter;
    UpdateVoteWeight(
      proposalId?: null,
      blocktime?: null,
      voter?: null,
      oldVotingWeight?: null,
      newVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): UpdateVoteWeightEventFilter;
  };

  estimateGas: {
    ADAPTER_NAME(overrides?: CallOverrides): Promise<BigNumber>;

    checkIfVoted(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voterAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    configureDao(
      dao: PromiseOrValue<string>,
      votingPeriod: PromiseOrValue<BigNumberish>,
      gracePeriod: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getAdapterName(overrides?: CallOverrides): Promise<BigNumber>;

    getAllRaiserWeight(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAllRaiserWeightByProposalId(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSenderAddress(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getVotingWeight(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    startNewVotingForProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      projectVotingTimestamp: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitVote(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voteValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    voteResult(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    voteWeights(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    votes(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ADAPTER_NAME(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    checkIfVoted(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voterAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    configureDao(
      dao: PromiseOrValue<string>,
      votingPeriod: PromiseOrValue<BigNumberish>,
      gracePeriod: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getAdapterName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getAllRaiserWeight(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAllRaiserWeightByProposalId(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSenderAddress(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getVotingWeight(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    startNewVotingForProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      projectVotingTimestamp: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitVote(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      voteValue: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    voteResult(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    voteWeights(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      arg2: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    votes(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
