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
  PayableOverrides,
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

export interface FlexInvestmentPoolExtensionInterface extends utils.Interface {
  functions: {
    "addToBalance(bytes32,address,uint256)": FunctionFragment;
    "availableFundingProposals(bytes32)": FunctionFragment;
    "balanceOf(bytes32,address)": FunctionFragment;
    "checkpoints(bytes32,address,uint32)": FunctionFragment;
    "createParticipantMembership(string,uint8,uint256,address,uint256,address[])": FunctionFragment;
    "dao()": FunctionFragment;
    "fundingProposals(uint256)": FunctionFragment;
    "getInvestorsByProposalId(bytes32)": FunctionFragment;
    "getPriorAmount(bytes32,address,uint256)": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "initialized()": FunctionFragment;
    "internalTransfer(bytes32,address,address,uint256)": FunctionFragment;
    "isActiveMember(address,address)": FunctionFragment;
    "isInvestor(bytes32,address)": FunctionFragment;
    "numCheckpoints(bytes32,address)": FunctionFragment;
    "participantMemberships(string)": FunctionFragment;
    "registerPotentialNewInvestmentProposal(bytes32)": FunctionFragment;
    "substractFromAll(bytes32,uint256)": FunctionFragment;
    "subtractFromBalance(bytes32,address,uint256)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "withdraw(bytes32,address,address,uint256)": FunctionFragment;
    "withdrawFromAll(bytes32,address,address,uint256)": FunctionFragment;
    "withdrawTo(bytes32,address,address,address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addToBalance"
      | "availableFundingProposals"
      | "balanceOf"
      | "checkpoints"
      | "createParticipantMembership"
      | "dao"
      | "fundingProposals"
      | "getInvestorsByProposalId"
      | "getPriorAmount"
      | "initialize"
      | "initialized"
      | "internalTransfer"
      | "isActiveMember"
      | "isInvestor"
      | "numCheckpoints"
      | "participantMemberships"
      | "registerPotentialNewInvestmentProposal"
      | "substractFromAll"
      | "subtractFromBalance"
      | "supportsInterface"
      | "withdraw"
      | "withdrawFromAll"
      | "withdrawTo"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addToBalance",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "availableFundingProposals",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "checkpoints",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "createParticipantMembership",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>[]
    ]
  ): string;
  encodeFunctionData(functionFragment: "dao", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "fundingProposals",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getInvestorsByProposalId",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPriorAmount",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialized",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "internalTransfer",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveMember",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isInvestor",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "numCheckpoints",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "participantMemberships",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "registerPotentialNewInvestmentProposal",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "substractFromAll",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "subtractFromBalance",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawFromAll",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawTo",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "addToBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "availableFundingProposals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "checkpoints",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createParticipantMembership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "dao", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "fundingProposals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInvestorsByProposalId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPriorAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "initialized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "internalTransfer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isInvestor", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "numCheckpoints",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "participantMemberships",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerPotentialNewInvestmentProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "substractFromAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "subtractFromBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawFromAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdrawTo", data: BytesLike): Result;

  events: {
    "NewBalance(bytes32,address,uint160)": EventFragment;
    "Withdraw(bytes32,address,address,uint160)": EventFragment;
    "WithdrawTo(bytes32,address,address,address,uint160)": EventFragment;
    "WithdrawToFromAll(bytes32,address,address,uint160)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewBalance"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WithdrawTo"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WithdrawToFromAll"): EventFragment;
}

export interface NewBalanceEventObject {
  proposalId: string;
  member: string;
  amount: BigNumber;
}
export type NewBalanceEvent = TypedEvent<
  [string, string, BigNumber],
  NewBalanceEventObject
>;

export type NewBalanceEventFilter = TypedEventFilter<NewBalanceEvent>;

export interface WithdrawEventObject {
  proposalId: string;
  account: string;
  tokenAddr: string;
  amount: BigNumber;
}
export type WithdrawEvent = TypedEvent<
  [string, string, string, BigNumber],
  WithdrawEventObject
>;

export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;

export interface WithdrawToEventObject {
  proposalId: string;
  accountFrom: string;
  accountTo: string;
  tokenAddr: string;
  amount: BigNumber;
}
export type WithdrawToEvent = TypedEvent<
  [string, string, string, string, BigNumber],
  WithdrawToEventObject
>;

export type WithdrawToEventFilter = TypedEventFilter<WithdrawToEvent>;

export interface WithdrawToFromAllEventObject {
  proposalId: string;
  accountTo: string;
  tokenAddr: string;
  amount: BigNumber;
}
export type WithdrawToFromAllEvent = TypedEvent<
  [string, string, string, BigNumber],
  WithdrawToFromAllEventObject
>;

export type WithdrawToFromAllEventFilter =
  TypedEventFilter<WithdrawToFromAllEvent>;

export interface FlexInvestmentPoolExtension extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlexInvestmentPoolExtensionInterface;

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
    addToBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    availableFundingProposals(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    balanceOf(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    checkpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; amount: BigNumber }
    >;

    createParticipantMembership(
      name: PromiseOrValue<string>,
      varifyType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      whiteList: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    dao(overrides?: CallOverrides): Promise<[string]>;

    fundingProposals(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getInvestorsByProposalId(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getPriorAmount(
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initialized(overrides?: CallOverrides): Promise<[boolean]>;

    internalTransfer(
      proposalId: PromiseOrValue<BytesLike>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isInvestor(
      proposalId: PromiseOrValue<BytesLike>,
      investorAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    numCheckpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number]>;

    participantMemberships(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, number, BigNumber, string, BigNumber] & {
        name: string;
        varifyType: number;
        minHolding: BigNumber;
        tokenAddress: string;
        tokenId: BigNumber;
      }
    >;

    registerPotentialNewInvestmentProposal(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    substractFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    subtractFromBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    withdraw(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      toAddress: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawTo(
      proposalId: PromiseOrValue<BytesLike>,
      memberFrom: PromiseOrValue<string>,
      memberTo: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addToBalance(
    proposalId: PromiseOrValue<BytesLike>,
    member: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  availableFundingProposals(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  balanceOf(
    proposalId: PromiseOrValue<BytesLike>,
    member: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  checkpoints(
    arg0: PromiseOrValue<BytesLike>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { fromBlock: BigNumber; amount: BigNumber }
  >;

  createParticipantMembership(
    name: PromiseOrValue<string>,
    varifyType: PromiseOrValue<BigNumberish>,
    miniHolding: PromiseOrValue<BigNumberish>,
    token: PromiseOrValue<string>,
    tokenId: PromiseOrValue<BigNumberish>,
    whiteList: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  dao(overrides?: CallOverrides): Promise<string>;

  fundingProposals(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  getInvestorsByProposalId(
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getPriorAmount(
    proposalId: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    blockNumber: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  initialize(
    _dao: PromiseOrValue<string>,
    creator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initialized(overrides?: CallOverrides): Promise<boolean>;

  internalTransfer(
    proposalId: PromiseOrValue<BytesLike>,
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isActiveMember(
    dao: PromiseOrValue<string>,
    _addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isInvestor(
    proposalId: PromiseOrValue<BytesLike>,
    investorAddr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  numCheckpoints(
    arg0: PromiseOrValue<BytesLike>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<number>;

  participantMemberships(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [string, number, BigNumber, string, BigNumber] & {
      name: string;
      varifyType: number;
      minHolding: BigNumber;
      tokenAddress: string;
      tokenId: BigNumber;
    }
  >;

  registerPotentialNewInvestmentProposal(
    proposalId: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  substractFromAll(
    proposalId: PromiseOrValue<BytesLike>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  subtractFromBalance(
    proposalId: PromiseOrValue<BytesLike>,
    member: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  withdraw(
    proposalId: PromiseOrValue<BytesLike>,
    member: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawFromAll(
    proposalId: PromiseOrValue<BytesLike>,
    toAddress: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawTo(
    proposalId: PromiseOrValue<BytesLike>,
    memberFrom: PromiseOrValue<string>,
    memberTo: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addToBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    availableFundingProposals(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    balanceOf(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; amount: BigNumber }
    >;

    createParticipantMembership(
      name: PromiseOrValue<string>,
      varifyType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      whiteList: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<void>;

    dao(overrides?: CallOverrides): Promise<string>;

    fundingProposals(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    getInvestorsByProposalId(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getPriorAmount(
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    initialized(overrides?: CallOverrides): Promise<boolean>;

    internalTransfer(
      proposalId: PromiseOrValue<BytesLike>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isInvestor(
      proposalId: PromiseOrValue<BytesLike>,
      investorAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    numCheckpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<number>;

    participantMemberships(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, number, BigNumber, string, BigNumber] & {
        name: string;
        varifyType: number;
        minHolding: BigNumber;
        tokenAddress: string;
        tokenId: BigNumber;
      }
    >;

    registerPotentialNewInvestmentProposal(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    substractFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    subtractFromBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    withdraw(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      toAddress: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawTo(
      proposalId: PromiseOrValue<BytesLike>,
      memberFrom: PromiseOrValue<string>,
      memberTo: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "NewBalance(bytes32,address,uint160)"(
      proposalId?: null,
      member?: null,
      amount?: null
    ): NewBalanceEventFilter;
    NewBalance(
      proposalId?: null,
      member?: null,
      amount?: null
    ): NewBalanceEventFilter;

    "Withdraw(bytes32,address,address,uint160)"(
      proposalId?: null,
      account?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawEventFilter;
    Withdraw(
      proposalId?: null,
      account?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawEventFilter;

    "WithdrawTo(bytes32,address,address,address,uint160)"(
      proposalId?: null,
      accountFrom?: null,
      accountTo?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawToEventFilter;
    WithdrawTo(
      proposalId?: null,
      accountFrom?: null,
      accountTo?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawToEventFilter;

    "WithdrawToFromAll(bytes32,address,address,uint160)"(
      proposalId?: null,
      accountTo?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawToFromAllEventFilter;
    WithdrawToFromAll(
      proposalId?: null,
      accountTo?: null,
      tokenAddr?: null,
      amount?: null
    ): WithdrawToFromAllEventFilter;
  };

  estimateGas: {
    addToBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    availableFundingProposals(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    balanceOf(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createParticipantMembership(
      name: PromiseOrValue<string>,
      varifyType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      whiteList: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    dao(overrides?: CallOverrides): Promise<BigNumber>;

    fundingProposals(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInvestorsByProposalId(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPriorAmount(
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initialized(overrides?: CallOverrides): Promise<BigNumber>;

    internalTransfer(
      proposalId: PromiseOrValue<BytesLike>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isInvestor(
      proposalId: PromiseOrValue<BytesLike>,
      investorAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numCheckpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    participantMemberships(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    registerPotentialNewInvestmentProposal(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    substractFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    subtractFromBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      toAddress: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawTo(
      proposalId: PromiseOrValue<BytesLike>,
      memberFrom: PromiseOrValue<string>,
      memberTo: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addToBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    availableFundingProposals(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    balanceOf(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    checkpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createParticipantMembership(
      name: PromiseOrValue<string>,
      varifyType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      tokenId: PromiseOrValue<BigNumberish>,
      whiteList: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    dao(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    fundingProposals(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInvestorsByProposalId(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPriorAmount(
      proposalId: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      _dao: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initialized(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    internalTransfer(
      proposalId: PromiseOrValue<BytesLike>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isActiveMember(
      dao: PromiseOrValue<string>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isInvestor(
      proposalId: PromiseOrValue<BytesLike>,
      investorAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numCheckpoints(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    participantMemberships(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registerPotentialNewInvestmentProposal(
      proposalId: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    substractFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    subtractFromBalance(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      proposalId: PromiseOrValue<BytesLike>,
      member: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawFromAll(
      proposalId: PromiseOrValue<BytesLike>,
      toAddress: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawTo(
      proposalId: PromiseOrValue<BytesLike>,
      memberFrom: PromiseOrValue<string>,
      memberTo: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
