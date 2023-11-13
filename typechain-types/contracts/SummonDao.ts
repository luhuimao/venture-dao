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
} from "../common";

export declare namespace SummonDao {
  export type CallStruct = {
    target: PromiseOrValue<string>;
    callData: PromiseOrValue<BytesLike>;
  };

  export type CallStructOutput = [string, string] & {
    target: string;
    callData: string;
  };

  export type FlexDaoParticipantCapInfoStruct = {
    enable: PromiseOrValue<boolean>;
    maxParticipantsAmount: PromiseOrValue<BigNumberish>;
  };

  export type FlexDaoParticipantCapInfoStructOutput = [boolean, BigNumber] & {
    enable: boolean;
    maxParticipantsAmount: BigNumber;
  };

  export type FlexDaoPaticipantMembershipInfoStruct = {
    name: PromiseOrValue<string>;
    varifyType: PromiseOrValue<BigNumberish>;
    minHolding: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    whiteList: PromiseOrValue<string>[];
  };

  export type FlexDaoPaticipantMembershipInfoStructOutput = [
    string,
    number,
    BigNumber,
    string,
    BigNumber,
    string[]
  ] & {
    name: string;
    varifyType: number;
    minHolding: BigNumber;
    tokenAddress: string;
    tokenId: BigNumber;
    whiteList: string[];
  };

  export type FlexDaoPriorityMembershipInfoStruct = {
    varifyType: PromiseOrValue<BigNumberish>;
    minHolding: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    whiteList: PromiseOrValue<string>[];
    priorityPeriod: PromiseOrValue<BigNumberish>;
  };

  export type FlexDaoPriorityMembershipInfoStructOutput = [
    number,
    BigNumber,
    string,
    BigNumber,
    string[],
    BigNumber
  ] & {
    varifyType: number;
    minHolding: BigNumber;
    tokenAddress: string;
    tokenId: BigNumber;
    whiteList: string[];
    priorityPeriod: BigNumber;
  };

  export type FlexDaoStewardMembershipInfoStruct = {
    enable: PromiseOrValue<boolean>;
    varifyType: PromiseOrValue<BigNumberish>;
    minHolding: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    whiteList: PromiseOrValue<string>[];
  };

  export type FlexDaoStewardMembershipInfoStructOutput = [
    boolean,
    BigNumber,
    BigNumber,
    string,
    BigNumber,
    string[]
  ] & {
    enable: boolean;
    varifyType: BigNumber;
    minHolding: BigNumber;
    tokenAddress: string;
    tokenId: BigNumber;
    whiteList: string[];
  };

  export type FlexDaoVotingInfoStruct = {
    eligibilityType: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenID: PromiseOrValue<BigNumberish>;
    votingPeriod: PromiseOrValue<BigNumberish>;
    votingPower: PromiseOrValue<BigNumberish>;
    superMajority: PromiseOrValue<BigNumberish>;
    quorum: PromiseOrValue<BigNumberish>;
    supportType: PromiseOrValue<BigNumberish>;
    quorumType: PromiseOrValue<BigNumberish>;
  };

  export type FlexDaoVotingInfoStructOutput = [
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    number,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    eligibilityType: BigNumber;
    tokenAddress: string;
    tokenID: BigNumber;
    votingPeriod: BigNumber;
    votingPower: number;
    superMajority: BigNumber;
    quorum: BigNumber;
    supportType: BigNumber;
    quorumType: BigNumber;
  };

  export type FlexDaoPollsterMembershipInfoStruct = {
    varifyType: PromiseOrValue<BigNumberish>;
    minHolding: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    whiteList: PromiseOrValue<string>[];
  };

  export type FlexDaoPollsterMembershipInfoStructOutput = [
    number,
    BigNumber,
    string,
    BigNumber,
    string[]
  ] & {
    varifyType: number;
    minHolding: BigNumber;
    tokenAddress: string;
    tokenId: BigNumber;
    whiteList: string[];
  };

  export type FlexDaoPollingInfoStruct = {
    votingPeriod: PromiseOrValue<BigNumberish>;
    votingPower: PromiseOrValue<BigNumberish>;
    superMajority: PromiseOrValue<BigNumberish>;
    quorum: PromiseOrValue<BigNumberish>;
    eligibilityType: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenID: PromiseOrValue<BigNumberish>;
    supportType: PromiseOrValue<BigNumberish>;
    quorumType: PromiseOrValue<BigNumberish>;
  };

  export type FlexDaoPollingInfoStructOutput = [
    BigNumber,
    number,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    votingPeriod: BigNumber;
    votingPower: number;
    superMajority: BigNumber;
    quorum: BigNumber;
    eligibilityType: BigNumber;
    tokenAddress: string;
    tokenID: BigNumber;
    supportType: BigNumber;
    quorumType: BigNumber;
  };

  export type FlexDaoProposerMembershipInfoStruct = {
    proposerMembershipEnable: PromiseOrValue<boolean>;
    varifyType: PromiseOrValue<BigNumberish>;
    minHolding: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    whiteList: PromiseOrValue<string>[];
  };

  export type FlexDaoProposerMembershipInfoStructOutput = [
    boolean,
    number,
    BigNumber,
    string,
    BigNumber,
    string[]
  ] & {
    proposerMembershipEnable: boolean;
    varifyType: number;
    minHolding: BigNumber;
    tokenAddress: string;
    tokenId: BigNumber;
    whiteList: string[];
  };

  export type FlexDaoInfoStruct = {
    name: PromiseOrValue<string>;
    creator: PromiseOrValue<string>;
    flexDaoManagementfee: PromiseOrValue<BigNumberish>;
    returnTokenManagementFee: PromiseOrValue<BigNumberish>;
    managementFeeAddress: PromiseOrValue<string>;
    flexDaoGenesisStewards: PromiseOrValue<string>[];
    allocations: PromiseOrValue<BigNumberish>[];
  };

  export type FlexDaoInfoStructOutput = [
    string,
    string,
    BigNumber,
    BigNumber,
    string,
    string[],
    BigNumber[]
  ] & {
    name: string;
    creator: string;
    flexDaoManagementfee: BigNumber;
    returnTokenManagementFee: BigNumber;
    managementFeeAddress: string;
    flexDaoGenesisStewards: string[];
    allocations: BigNumber[];
  };

  export type FlexDaoParamsStruct = {
    daoFactoriesAddress: PromiseOrValue<string>[];
    enalbeAdapters: DaoFactory.AdapterStruct[];
    adapters1: DaoFactory.AdapterStruct[];
    fundingPollEnable: PromiseOrValue<boolean>;
    _flexDaoParticipantCapInfo: SummonDao.FlexDaoParticipantCapInfoStruct;
    flexDaoParticipantMembetshipEnable: PromiseOrValue<boolean>;
    _flexDaoPaticipantMembershipInfos: SummonDao.FlexDaoPaticipantMembershipInfoStruct;
    flexDaoPriorityDepositEnalbe: PromiseOrValue<boolean>;
    _flexDaoPriorityMembershipInfo: SummonDao.FlexDaoPriorityMembershipInfoStruct;
    _flexDaoStewardMembershipInfo: SummonDao.FlexDaoStewardMembershipInfoStruct;
    _flexDaoVotingInfo: SummonDao.FlexDaoVotingInfoStruct;
    _flexDaoPollsterMembershipInfo: SummonDao.FlexDaoPollsterMembershipInfoStruct;
    _flexDaoPollingInfo: SummonDao.FlexDaoPollingInfoStruct;
    _flexDaoProposerMembershipInfo: SummonDao.FlexDaoProposerMembershipInfoStruct;
    _flexDaoInfo: SummonDao.FlexDaoInfoStruct;
  };

  export type FlexDaoParamsStructOutput = [
    string[],
    DaoFactory.AdapterStructOutput[],
    DaoFactory.AdapterStructOutput[],
    boolean,
    SummonDao.FlexDaoParticipantCapInfoStructOutput,
    boolean,
    SummonDao.FlexDaoPaticipantMembershipInfoStructOutput,
    boolean,
    SummonDao.FlexDaoPriorityMembershipInfoStructOutput,
    SummonDao.FlexDaoStewardMembershipInfoStructOutput,
    SummonDao.FlexDaoVotingInfoStructOutput,
    SummonDao.FlexDaoPollsterMembershipInfoStructOutput,
    SummonDao.FlexDaoPollingInfoStructOutput,
    SummonDao.FlexDaoProposerMembershipInfoStructOutput,
    SummonDao.FlexDaoInfoStructOutput
  ] & {
    daoFactoriesAddress: string[];
    enalbeAdapters: DaoFactory.AdapterStructOutput[];
    adapters1: DaoFactory.AdapterStructOutput[];
    fundingPollEnable: boolean;
    _flexDaoParticipantCapInfo: SummonDao.FlexDaoParticipantCapInfoStructOutput;
    flexDaoParticipantMembetshipEnable: boolean;
    _flexDaoPaticipantMembershipInfos: SummonDao.FlexDaoPaticipantMembershipInfoStructOutput;
    flexDaoPriorityDepositEnalbe: boolean;
    _flexDaoPriorityMembershipInfo: SummonDao.FlexDaoPriorityMembershipInfoStructOutput;
    _flexDaoStewardMembershipInfo: SummonDao.FlexDaoStewardMembershipInfoStructOutput;
    _flexDaoVotingInfo: SummonDao.FlexDaoVotingInfoStructOutput;
    _flexDaoPollsterMembershipInfo: SummonDao.FlexDaoPollsterMembershipInfoStructOutput;
    _flexDaoPollingInfo: SummonDao.FlexDaoPollingInfoStructOutput;
    _flexDaoProposerMembershipInfo: SummonDao.FlexDaoProposerMembershipInfoStructOutput;
    _flexDaoInfo: SummonDao.FlexDaoInfoStructOutput;
  };
}

export declare namespace DaoFactory {
  export type AdapterStruct = {
    id: PromiseOrValue<BytesLike>;
    addr: PromiseOrValue<string>;
    flags: PromiseOrValue<BigNumberish>;
  };

  export type AdapterStructOutput = [string, string, BigNumber] & {
    id: string;
    addr: string;
    flags: BigNumber;
  };
}

export interface SummonDaoInterface extends utils.Interface {
  functions: {
    "multiCall((address,bytes)[9])": FunctionFragment;
    "summonFlexDao((address[],(bytes32,address,uint128)[],(bytes32,address,uint128)[],bool,(bool,uint256),bool,(string,uint8,uint256,address,uint256,address[]),bool,(uint8,uint256,address,uint256,address[],uint256),(bool,uint256,uint256,address,uint256,address[]),(uint256,address,uint256,uint256,uint8,uint256,uint256,uint256,uint256),(uint8,uint256,address,uint256,address[]),(uint256,uint8,uint256,uint256,uint256,address,uint256,uint256,uint256),(bool,uint8,uint256,address,uint256,address[]),(string,address,uint256,uint256,address,address[],uint256[])))": FunctionFragment;
    "summonFlexDao1(address,string,address)": FunctionFragment;
    "summonFlexDao10(bool,uint256,uint256,uint256,uint256,address[],address,address)": FunctionFragment;
    "summonFlexDao2(address,address,address)": FunctionFragment;
    "summonFlexDao3(address,(bytes32,address,uint128)[],address)": FunctionFragment;
    "summonFlexDao4(address,address,(bytes32,address,uint128)[],address)": FunctionFragment;
    "summonFlexDao5(uint256,address,uint256,address,uint8,uint256,address,uint256[6])": FunctionFragment;
    "summonFlexDao6(address[],uint256[],address,uint256)": FunctionFragment;
    "summonFlexDao7(bool[2],uint256[10],address,address[],address,address)": FunctionFragment;
    "summonFlexDao8(bool,bool,uint256[6],address,address[],address,address[],address)": FunctionFragment;
    "summonFlexDao9(bool,string,uint256,uint256,uint256,address,address[],address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "multiCall"
      | "summonFlexDao"
      | "summonFlexDao1"
      | "summonFlexDao10"
      | "summonFlexDao2"
      | "summonFlexDao3"
      | "summonFlexDao4"
      | "summonFlexDao5"
      | "summonFlexDao6"
      | "summonFlexDao7"
      | "summonFlexDao8"
      | "summonFlexDao9"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "multiCall",
    values: [SummonDao.CallStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao",
    values: [SummonDao.FlexDaoParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao1",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao10",
    values: [
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao2",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao3",
    values: [
      PromiseOrValue<string>,
      DaoFactory.AdapterStruct[],
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao4",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      DaoFactory.AdapterStruct[],
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao5",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao6",
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao7",
    values: [
      [PromiseOrValue<boolean>, PromiseOrValue<boolean>],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao8",
    values: [
      PromiseOrValue<boolean>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>[],
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonFlexDao9",
    values: [
      PromiseOrValue<boolean>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>[],
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "multiCall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao1",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao10",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao2",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao3",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao4",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao5",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao6",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao7",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao8",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonFlexDao9",
    data: BytesLike
  ): Result;

  events: {
    "FlexDaoCreated(address,address,string,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "FlexDaoCreated"): EventFragment;
}

export interface FlexDaoCreatedEventObject {
  daoFactoryAddress: string;
  daoAddr: string;
  name: string;
  creator: string;
}
export type FlexDaoCreatedEvent = TypedEvent<
  [string, string, string, string],
  FlexDaoCreatedEventObject
>;

export type FlexDaoCreatedEventFilter = TypedEventFilter<FlexDaoCreatedEvent>;

export interface SummonDao extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SummonDaoInterface;

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
    multiCall(
      calls: SummonDao.CallStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao(
      params: SummonDao.FlexDaoParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao10(
      flexDaoPriorityDepositEnalbe: PromiseOrValue<boolean>,
      flexDaoPriorityMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipPriorityPeriod: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipWhiteList: PromiseOrValue<string>[],
      flexDaoPriorityMembershipTokenAddress: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao2(
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao4(
      daoFacAddr: PromiseOrValue<string>,
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao5(
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
      flexDaoReturnTokenManagementFee: PromiseOrValue<BigNumberish>,
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      tokenID: PromiseOrValue<BigNumberish>,
      tokenAddress: PromiseOrValue<string>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao6(
      flexDaoGenesisStewards: PromiseOrValue<string>[],
      allocations: PromiseOrValue<BigNumberish>[],
      newDaoAddr: PromiseOrValue<string>,
      eligibilityType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao7(
      booleanParams: [PromiseOrValue<boolean>, PromiseOrValue<boolean>],
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoPollsterMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPollsterMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      flexDaoPollingtokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao8(
      flexDaoStewardMembershipEnable: PromiseOrValue<boolean>,
      flexDaoProposerMembershipEnable: PromiseOrValue<boolean>,
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoStewardMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoStewardMembershipWhitelist: PromiseOrValue<string>[],
      flexDaoProposerMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoProposerMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonFlexDao9(
      flexDaoParticipantMembetshipEnable: PromiseOrValue<boolean>,
      flexDaoPaticipantMembershipName: PromiseOrValue<string>,
      flexDaoPaticipantMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPaticipantMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  multiCall(
    calls: SummonDao.CallStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao(
    params: SummonDao.FlexDaoParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao1(
    daoFacAddr: PromiseOrValue<string>,
    daoName: PromiseOrValue<string>,
    creator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao10(
    flexDaoPriorityDepositEnalbe: PromiseOrValue<boolean>,
    flexDaoPriorityMembershipVarifyType: PromiseOrValue<BigNumberish>,
    flexDaoPriorityMembershipPriorityPeriod: PromiseOrValue<BigNumberish>,
    flexDaoPriorityMembershipMinHolding: PromiseOrValue<BigNumberish>,
    flexDaoPriorityMembershipTokenId: PromiseOrValue<BigNumberish>,
    flexDaoPriorityMembershipWhiteList: PromiseOrValue<string>[],
    flexDaoPriorityMembershipTokenAddress: PromiseOrValue<string>,
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao2(
    flexFundingPoolFacAddr: PromiseOrValue<string>,
    newDaoAddr: PromiseOrValue<string>,
    creator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao3(
    daoFacAddr: PromiseOrValue<string>,
    enalbeAdapters: DaoFactory.AdapterStruct[],
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao4(
    daoFacAddr: PromiseOrValue<string>,
    flexFundingPoolFacAddr: PromiseOrValue<string>,
    adapters1: DaoFactory.AdapterStruct[],
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao5(
    flexDaoManagementfee: PromiseOrValue<BigNumberish>,
    managementFeeAddress: PromiseOrValue<string>,
    flexDaoReturnTokenManagementFee: PromiseOrValue<BigNumberish>,
    newDaoAddr: PromiseOrValue<string>,
    votingPower: PromiseOrValue<BigNumberish>,
    tokenID: PromiseOrValue<BigNumberish>,
    tokenAddress: PromiseOrValue<string>,
    _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao6(
    flexDaoGenesisStewards: PromiseOrValue<string>[],
    allocations: PromiseOrValue<BigNumberish>[],
    newDaoAddr: PromiseOrValue<string>,
    eligibilityType: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao7(
    booleanParams: [PromiseOrValue<boolean>, PromiseOrValue<boolean>],
    uint256Params: PromiseOrValue<BigNumberish>[],
    flexDaoPollsterMembershipTokenAddress: PromiseOrValue<string>,
    flexDaoPollsterMembershipWhiteList: PromiseOrValue<string>[],
    newDaoAddr: PromiseOrValue<string>,
    flexDaoPollingtokenAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao8(
    flexDaoStewardMembershipEnable: PromiseOrValue<boolean>,
    flexDaoProposerMembershipEnable: PromiseOrValue<boolean>,
    uint256Params: PromiseOrValue<BigNumberish>[],
    flexDaoStewardMembershipTokenAddress: PromiseOrValue<string>,
    flexDaoStewardMembershipWhitelist: PromiseOrValue<string>[],
    flexDaoProposerMembershipTokenAddress: PromiseOrValue<string>,
    flexDaoProposerMembershipWhiteList: PromiseOrValue<string>[],
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonFlexDao9(
    flexDaoParticipantMembetshipEnable: PromiseOrValue<boolean>,
    flexDaoPaticipantMembershipName: PromiseOrValue<string>,
    flexDaoPaticipantMembershipVarifyType: PromiseOrValue<BigNumberish>,
    flexDaoPaticipantMembershipMinHolding: PromiseOrValue<BigNumberish>,
    flexDaoPaticipantMembershipTokenId: PromiseOrValue<BigNumberish>,
    flexDaoPaticipantMembershipTokenAddress: PromiseOrValue<string>,
    flexDaoPaticipantMembershipWhiteList: PromiseOrValue<string>[],
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    multiCall(
      calls: SummonDao.CallStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    summonFlexDao(
      params: SummonDao.FlexDaoParamsStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    summonFlexDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao10(
      flexDaoPriorityDepositEnalbe: PromiseOrValue<boolean>,
      flexDaoPriorityMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipPriorityPeriod: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipWhiteList: PromiseOrValue<string>[],
      flexDaoPriorityMembershipTokenAddress: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao2(
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao4(
      daoFacAddr: PromiseOrValue<string>,
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao5(
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
      flexDaoReturnTokenManagementFee: PromiseOrValue<BigNumberish>,
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      tokenID: PromiseOrValue<BigNumberish>,
      tokenAddress: PromiseOrValue<string>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao6(
      flexDaoGenesisStewards: PromiseOrValue<string>[],
      allocations: PromiseOrValue<BigNumberish>[],
      newDaoAddr: PromiseOrValue<string>,
      eligibilityType: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao7(
      booleanParams: [PromiseOrValue<boolean>, PromiseOrValue<boolean>],
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoPollsterMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPollsterMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      flexDaoPollingtokenAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao8(
      flexDaoStewardMembershipEnable: PromiseOrValue<boolean>,
      flexDaoProposerMembershipEnable: PromiseOrValue<boolean>,
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoStewardMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoStewardMembershipWhitelist: PromiseOrValue<string>[],
      flexDaoProposerMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoProposerMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonFlexDao9(
      flexDaoParticipantMembetshipEnable: PromiseOrValue<boolean>,
      flexDaoPaticipantMembershipName: PromiseOrValue<string>,
      flexDaoPaticipantMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPaticipantMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "FlexDaoCreated(address,address,string,address)"(
      daoFactoryAddress?: null,
      daoAddr?: null,
      name?: null,
      creator?: null
    ): FlexDaoCreatedEventFilter;
    FlexDaoCreated(
      daoFactoryAddress?: null,
      daoAddr?: null,
      name?: null,
      creator?: null
    ): FlexDaoCreatedEventFilter;
  };

  estimateGas: {
    multiCall(
      calls: SummonDao.CallStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao(
      params: SummonDao.FlexDaoParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao10(
      flexDaoPriorityDepositEnalbe: PromiseOrValue<boolean>,
      flexDaoPriorityMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipPriorityPeriod: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipWhiteList: PromiseOrValue<string>[],
      flexDaoPriorityMembershipTokenAddress: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao2(
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao4(
      daoFacAddr: PromiseOrValue<string>,
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao5(
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
      flexDaoReturnTokenManagementFee: PromiseOrValue<BigNumberish>,
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      tokenID: PromiseOrValue<BigNumberish>,
      tokenAddress: PromiseOrValue<string>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao6(
      flexDaoGenesisStewards: PromiseOrValue<string>[],
      allocations: PromiseOrValue<BigNumberish>[],
      newDaoAddr: PromiseOrValue<string>,
      eligibilityType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao7(
      booleanParams: [PromiseOrValue<boolean>, PromiseOrValue<boolean>],
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoPollsterMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPollsterMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      flexDaoPollingtokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao8(
      flexDaoStewardMembershipEnable: PromiseOrValue<boolean>,
      flexDaoProposerMembershipEnable: PromiseOrValue<boolean>,
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoStewardMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoStewardMembershipWhitelist: PromiseOrValue<string>[],
      flexDaoProposerMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoProposerMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonFlexDao9(
      flexDaoParticipantMembetshipEnable: PromiseOrValue<boolean>,
      flexDaoPaticipantMembershipName: PromiseOrValue<string>,
      flexDaoPaticipantMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPaticipantMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    multiCall(
      calls: SummonDao.CallStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao(
      params: SummonDao.FlexDaoParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao10(
      flexDaoPriorityDepositEnalbe: PromiseOrValue<boolean>,
      flexDaoPriorityMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipPriorityPeriod: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPriorityMembershipWhiteList: PromiseOrValue<string>[],
      flexDaoPriorityMembershipTokenAddress: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao2(
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao4(
      daoFacAddr: PromiseOrValue<string>,
      flexFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao5(
      flexDaoManagementfee: PromiseOrValue<BigNumberish>,
      managementFeeAddress: PromiseOrValue<string>,
      flexDaoReturnTokenManagementFee: PromiseOrValue<BigNumberish>,
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      tokenID: PromiseOrValue<BigNumberish>,
      tokenAddress: PromiseOrValue<string>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao6(
      flexDaoGenesisStewards: PromiseOrValue<string>[],
      allocations: PromiseOrValue<BigNumberish>[],
      newDaoAddr: PromiseOrValue<string>,
      eligibilityType: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao7(
      booleanParams: [PromiseOrValue<boolean>, PromiseOrValue<boolean>],
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoPollsterMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPollsterMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      flexDaoPollingtokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao8(
      flexDaoStewardMembershipEnable: PromiseOrValue<boolean>,
      flexDaoProposerMembershipEnable: PromiseOrValue<boolean>,
      uint256Params: PromiseOrValue<BigNumberish>[],
      flexDaoStewardMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoStewardMembershipWhitelist: PromiseOrValue<string>[],
      flexDaoProposerMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoProposerMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonFlexDao9(
      flexDaoParticipantMembetshipEnable: PromiseOrValue<boolean>,
      flexDaoPaticipantMembershipName: PromiseOrValue<string>,
      flexDaoPaticipantMembershipVarifyType: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipMinHolding: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenId: PromiseOrValue<BigNumberish>,
      flexDaoPaticipantMembershipTokenAddress: PromiseOrValue<string>,
      flexDaoPaticipantMembershipWhiteList: PromiseOrValue<string>[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
