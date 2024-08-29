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
  export type GovernorMembershipParamsStruct = {
    dao: PromiseOrValue<string>;
    enable: PromiseOrValue<boolean>;
    name: PromiseOrValue<string>;
    varifyType: PromiseOrValue<BigNumberish>;
    minAmount: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    whiteList: PromiseOrValue<string>[];
  };

  export type GovernorMembershipParamsStructOutput = [
    string,
    boolean,
    string,
    number,
    BigNumber,
    string,
    BigNumber,
    string[]
  ] & {
    dao: string;
    enable: boolean;
    name: string;
    varifyType: number;
    minAmount: BigNumber;
    tokenAddress: string;
    tokenId: BigNumber;
    whiteList: string[];
  };
}

export interface FlexDaoSetGovernorMembershipAdapterContractInterface
  extends utils.Interface {
  functions: {
    "getGovernorWhitelist(bytes32)": FunctionFragment;
    "governorMembershipProposals(address,bytes32)": FunctionFragment;
    "isActiveMember(address,address)": FunctionFragment;
    "ongoingGovernorMembershipProposal(address)": FunctionFragment;
    "processGovernorMembershipProposal(address,bytes32)": FunctionFragment;
    "submitGovernorMembershipProposal((address,bool,string,uint8,uint256,address,uint256,address[]))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getGovernorWhitelist"
      | "governorMembershipProposals"
      | "isActiveMember"
      | "ongoingGovernorMembershipProposal"
      | "processGovernorMembershipProposal"
      | "submitGovernorMembershipProposal"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getGovernorWhitelist",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "governorMembershipProposals",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveMember",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "ongoingGovernorMembershipProposal",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "processGovernorMembershipProposal",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitGovernorMembershipProposal",
    values: [FlexDaosetLibrary.GovernorMembershipParamsStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "getGovernorWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "governorMembershipProposals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ongoingGovernorMembershipProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processGovernorMembershipProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitGovernorMembershipProposal",
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

export interface FlexDaoSetGovernorMembershipAdapterContract
  extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlexDaoSetGovernorMembershipAdapterContractInterface;

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
    getGovernorWhitelist(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    governorMembershipProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        boolean,
        string,
        number,
        BigNumber,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        number
      ] & {
        enable: boolean;
        name: string;
        varifyType: number;
        minAmount: BigNumber;
        tokenAddress: string;
        tokenId: BigNumber;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
        state: number;
      }
    >;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    ongoingGovernorMembershipProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    processGovernorMembershipProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitGovernorMembershipProposal(
      params: FlexDaosetLibrary.GovernorMembershipParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getGovernorWhitelist(
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  governorMembershipProposals(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [
      boolean,
      string,
      number,
      BigNumber,
      string,
      BigNumber,
      BigNumber,
      BigNumber,
      number
    ] & {
      enable: boolean;
      name: string;
      varifyType: number;
      minAmount: BigNumber;
      tokenAddress: string;
      tokenId: BigNumber;
      creationTime: BigNumber;
      stopVoteTime: BigNumber;
      state: number;
    }
  >;

  isActiveMember(
    dao: PromiseOrValue<string>,
    _addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  ongoingGovernorMembershipProposal(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  processGovernorMembershipProposal(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitGovernorMembershipProposal(
    params: FlexDaosetLibrary.GovernorMembershipParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getGovernorWhitelist(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    governorMembershipProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [
        boolean,
        string,
        number,
        BigNumber,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        number
      ] & {
        enable: boolean;
        name: string;
        varifyType: number;
        minAmount: BigNumber;
        tokenAddress: string;
        tokenId: BigNumber;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
        state: number;
      }
    >;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    ongoingGovernorMembershipProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    processGovernorMembershipProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    submitGovernorMembershipProposal(
      params: FlexDaosetLibrary.GovernorMembershipParamsStruct,
      overrides?: CallOverrides
    ): Promise<void>;
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
    getGovernorWhitelist(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    governorMembershipProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ongoingGovernorMembershipProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    processGovernorMembershipProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitGovernorMembershipProposal(
      params: FlexDaosetLibrary.GovernorMembershipParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getGovernorWhitelist(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    governorMembershipProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ongoingGovernorMembershipProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    processGovernorMembershipProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitGovernorMembershipProposal(
      params: FlexDaosetLibrary.GovernorMembershipParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
