/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
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

export interface ColletiveClearFundProposalAdapterContractInterface
  extends utils.Interface {
  functions: {
    "ongoingClearFundProposal(address)": FunctionFragment;
    "processClearFundProposal(address,bytes32)": FunctionFragment;
    "proposals(address,bytes32)": FunctionFragment;
    "submitClearFundProposal(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "ongoingClearFundProposal"
      | "processClearFundProposal"
      | "proposals"
      | "submitClearFundProposal"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "ongoingClearFundProposal",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "processClearFundProposal",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "proposals",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitClearFundProposal",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "ongoingClearFundProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processClearFundProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "proposals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "submitClearFundProposal",
    data: BytesLike
  ): Result;

  events: {
    "ProposalCreated(address,bytes32)": EventFragment;
    "ProposalProcessed(address,bytes32,uint8,uint256,uint256,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalProcessed"): EventFragment;
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

export interface ColletiveClearFundProposalAdapterContract
  extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ColletiveClearFundProposalAdapterContractInterface;

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
    ongoingClearFundProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    processClearFundProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, BigNumber, BigNumber, number] & {
        proposalId: string;
        proposor: string;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
        state: number;
      }
    >;

    submitClearFundProposal(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  ongoingClearFundProposal(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  processClearFundProposal(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  proposals(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [string, string, BigNumber, BigNumber, number] & {
      proposalId: string;
      proposor: string;
      creationTime: BigNumber;
      stopVoteTime: BigNumber;
      state: number;
    }
  >;

  submitClearFundProposal(
    dao: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    ongoingClearFundProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    processClearFundProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, BigNumber, BigNumber, number] & {
        proposalId: string;
        proposor: string;
        creationTime: BigNumber;
        stopVoteTime: BigNumber;
        state: number;
      }
    >;

    submitClearFundProposal(
      dao: PromiseOrValue<string>,
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

    "ProposalProcessed(address,bytes32,uint8,uint256,uint256,uint256,uint256)"(
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
    ongoingClearFundProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    processClearFundProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    submitClearFundProposal(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ongoingClearFundProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    processClearFundProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    proposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    submitClearFundProposal(
      dao: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
