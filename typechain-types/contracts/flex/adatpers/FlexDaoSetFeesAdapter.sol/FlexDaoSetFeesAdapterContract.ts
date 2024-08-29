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

export interface FlexDaoSetFeesAdapterContractInterface
  extends utils.Interface {
  functions: {
    "feesProposals(address,bytes32)": FunctionFragment;
    "isActiveMember(address,address)": FunctionFragment;
    "ongoingFeesProposal(address)": FunctionFragment;
    "processFeesProposal(address,bytes32)": FunctionFragment;
    "submitFeesProposal(address,uint256,uint256,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "feesProposals"
      | "isActiveMember"
      | "ongoingFeesProposal"
      | "processFeesProposal"
      | "submitFeesProposal"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "feesProposals",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveMember",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "ongoingFeesProposal",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "processFeesProposal",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "submitFeesProposal",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "feesProposals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ongoingFeesProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processFeesProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitFeesProposal",
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

export interface FlexDaoSetFeesAdapterContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlexDaoSetFeesAdapterContractInterface;

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
    feesProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, string, BigNumber, BigNumber, number] & {
        flexDaoManagementfee: BigNumber;
        returnTokenManagementFee: BigNumber;
        managementFeeAddress: string;
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

    ongoingFeesProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    processFeesProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    submitFeesProposal(
      dao: PromiseOrValue<string>,
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      returnTokenManagementFee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  feesProposals(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, string, BigNumber, BigNumber, number] & {
      flexDaoManagementfee: BigNumber;
      returnTokenManagementFee: BigNumber;
      managementFeeAddress: string;
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

  ongoingFeesProposal(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  processFeesProposal(
    dao: PromiseOrValue<string>,
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  submitFeesProposal(
    dao: PromiseOrValue<string>,
    flexDaoManagementfee: PromiseOrValue<BigNumberish>,
    returnTokenManagementFee: PromiseOrValue<BigNumberish>,
    managementFeeAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    feesProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, string, BigNumber, BigNumber, number] & {
        flexDaoManagementfee: BigNumber;
        returnTokenManagementFee: BigNumber;
        managementFeeAddress: string;
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

    ongoingFeesProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    processFeesProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    submitFeesProposal(
      dao: PromiseOrValue<string>,
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      returnTokenManagementFee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
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
    feesProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ongoingFeesProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    processFeesProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    submitFeesProposal(
      dao: PromiseOrValue<string>,
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      returnTokenManagementFee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    feesProposals(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ongoingFeesProposal(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    processFeesProposal(
      dao: PromiseOrValue<string>,
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    submitFeesProposal(
      dao: PromiseOrValue<string>,
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      returnTokenManagementFee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
