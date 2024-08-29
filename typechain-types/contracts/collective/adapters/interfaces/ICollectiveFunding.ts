/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../../common";

export interface ICollectiveFundingInterface extends utils.Interface {
  functions: {};

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

export interface ICollectiveFunding extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICollectiveFundingInterface;

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

  functions: {};

  callStatic: {};

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

  estimateGas: {};

  populateTransaction: {};
}
