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

export interface VintageRaiserManagementContractInterface
  extends utils.Interface {
  functions: {
    "clearGovernorWhitelist(address)": FunctionFragment;
    "getAllRaiser(address)": FunctionFragment;
    "getRaiserAmount(address)": FunctionFragment;
    "getRaiserWhitelist(address)": FunctionFragment;
    "isActiveMember(address,address)": FunctionFragment;
    "isRaiserWhiteList(address,address)": FunctionFragment;
    "processProposal(address,bytes32)": FunctionFragment;
    "proposals(address,bytes32)": FunctionFragment;
    "quit(address)": FunctionFragment;
    "registerRaiserWhiteList(address,address)": FunctionFragment;
    "submitRaiserInProposal(address,address,uint256)": FunctionFragment;
    "submitSteWardOutProposal(address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "clearGovernorWhitelist"
      | "getAllRaiser"
      | "getRaiserAmount"
      | "getRaiserWhitelist"
      | "isActiveMember"
      | "isRaiserWhiteList"
      | "processProposal"
      | "proposals"
      | "quit"
      | "registerRaiserWhiteList"
      | "submitRaiserInProposal"
      | "submitSteWardOutProposal"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "clearGovernorWhitelist",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getAllRaiser",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getRaiserAmount",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getRaiserWhitelist",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveMember",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isRaiserWhiteList",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
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
    functionFragment: "quit",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "registerRaiserWhiteList",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitRaiserInProposal",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "submitSteWardOutProposal",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "clearGovernorWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllRaiser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRaiserAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRaiserWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isRaiserWhiteList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "proposals", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "quit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "registerRaiserWhiteList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitRaiserInProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitSteWardOutProposal",
    data: BytesLike
  ): Result;

  events: {
    "ProposalCreated(address,bytes32,address,uint256,uint256,uint8)": EventFragment;
    "ProposalProcessed(address,bytes32,uint8,uint256,uint128,uint128,uint128)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalProcessed"): EventFragment;
}

export interface ProposalCreatedEventObject {
  daoAddr: string;
  proposalId: string;
  account: string;
  creationTime: BigNumber;
  stopVoteTime: BigNumber;
  pType: number;
}
export type ProposalCreatedEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber, number],
  ProposalCreatedEventObject
>;

export type ProposalCreatedEventFilter = TypedEventFilter<ProposalCreatedEvent>;

export interface ProposalProcessedEventObject {
  daoAddr: string;
  proposalId: string;
  state: number;
  voteResult: BigNumber;
  allVotingWeight: BigNumber;
  nbYes: BigNumber;
  nbNo: BigNumber;
}
export type ProposalProcessedEvent = TypedEvent<
  [string, string, number, BigNumber, BigNumber, BigNumber, BigNumber],
  ProposalProcessedEventObject
>;

export type ProposalProcessedEventFilter =
  TypedEventFilter<ProposalProcessedEvent>;

export interface VintageRaiserManagementContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VintageRaiserManagementContractInterface;

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
    clearGovernorWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getAllRaiser(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getRaiserAmount(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getRaiserWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

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
      [string, string, BigNumber, BigNumber, BigNumber, number, number] & {
        id: string;
        account: string;
        allocation: BigNumber;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
        state: number;
        pType: number;
      }
    >;

    quit(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitRaiserInProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      allocation: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitSteWardOutProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  clearGovernorWhitelist(
    dao: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getAllRaiser(
    dao: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getRaiserAmount(
    dao: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getRaiserWhitelist(
    dao: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  isActiveMember(
    dao: PromiseOrValue<string>,
    _addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isRaiserWhiteList(
    dao: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

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
    [string, string, BigNumber, BigNumber, BigNumber, number, number] & {
      id: string;
      account: string;
      allocation: BigNumber;
      creationTime: BigNumber;
      stopVoteTime: BigNumber;
      state: number;
      pType: number;
    }
  >;

  quit(
    dao: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerRaiserWhiteList(
    dao: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitRaiserInProposal(
    dao: PromiseOrValue<string>,
    applicant: PromiseOrValue<string>,
    allocation: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitSteWardOutProposal(
    dao: PromiseOrValue<string>,
    applicant: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    clearGovernorWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    getAllRaiser(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getRaiserAmount(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRaiserWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

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
      [string, string, BigNumber, BigNumber, BigNumber, number, number] & {
        id: string;
        account: string;
        allocation: BigNumber;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
        state: number;
        pType: number;
      }
    >;

    quit(dao: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;

    registerRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    submitRaiserInProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      allocation: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    submitSteWardOutProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "ProposalCreated(address,bytes32,address,uint256,uint256,uint8)"(
      daoAddr?: null,
      proposalId?: null,
      account?: null,
      creationTime?: null,
      stopVoteTime?: null,
      pType?: null
    ): ProposalCreatedEventFilter;
    ProposalCreated(
      daoAddr?: null,
      proposalId?: null,
      account?: null,
      creationTime?: null,
      stopVoteTime?: null,
      pType?: null
    ): ProposalCreatedEventFilter;

    "ProposalProcessed(address,bytes32,uint8,uint256,uint128,uint128,uint128)"(
      daoAddr?: null,
      proposalId?: null,
      state?: null,
      voteResult?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): ProposalProcessedEventFilter;
    ProposalProcessed(
      daoAddr?: null,
      proposalId?: null,
      state?: null,
      voteResult?: null,
      allVotingWeight?: null,
      nbYes?: null,
      nbNo?: null
    ): ProposalProcessedEventFilter;
  };

  estimateGas: {
    clearGovernorWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getAllRaiser(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRaiserAmount(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRaiserWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
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

    quit(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitRaiserInProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      allocation: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitSteWardOutProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    clearGovernorWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getAllRaiser(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRaiserAmount(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRaiserWhitelist(
      dao: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
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

    quit(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerRaiserWhiteList(
      dao: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitRaiserInProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      allocation: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitSteWardOutProposal(
      dao: PromiseOrValue<string>,
      applicant: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
