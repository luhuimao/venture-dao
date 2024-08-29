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

export declare namespace SummonCollectiveDao {
  export type CallStruct = {
    target: PromiseOrValue<string>;
    callData: PromiseOrValue<BytesLike>;
  };

  export type CallStructOutput = [string, string] & {
    target: string;
    callData: string;
  };

  export type InvestorCapacityStruct = {
    enable: PromiseOrValue<boolean>;
    capacity: PromiseOrValue<BigNumberish>;
  };

  export type InvestorCapacityStructOutput = [boolean, BigNumber] & {
    enable: boolean;
    capacity: BigNumber;
  };

  export type CollectiveGovernorMembershipInfoStruct = {
    enable: PromiseOrValue<boolean>;
    varifyType: PromiseOrValue<BigNumberish>;
    minHolding: PromiseOrValue<BigNumberish>;
    tokenAddress: PromiseOrValue<string>;
    tokenId: PromiseOrValue<BigNumberish>;
    whiteList: PromiseOrValue<string>[];
  };

  export type CollectiveGovernorMembershipInfoStructOutput = [
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

  export type CollectiveDaoVotingInfoStruct = {
    votingAssetType: PromiseOrValue<BigNumberish>;
    votingPower: PromiseOrValue<BigNumberish>;
    support: PromiseOrValue<BigNumberish>;
    quorum: PromiseOrValue<BigNumberish>;
    supportType: PromiseOrValue<BigNumberish>;
    quorumType: PromiseOrValue<BigNumberish>;
    votingPeriod: PromiseOrValue<BigNumberish>;
    gracePeriod: PromiseOrValue<BigNumberish>;
    executePeriod: PromiseOrValue<BigNumberish>;
  };

  export type CollectiveDaoVotingInfoStructOutput = [
    BigNumber,
    number,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    votingAssetType: BigNumber;
    votingPower: number;
    support: BigNumber;
    quorum: BigNumber;
    supportType: BigNumber;
    quorumType: BigNumber;
    votingPeriod: BigNumber;
    gracePeriod: BigNumber;
    executePeriod: BigNumber;
  };

  export type CollectiveDaoInfoStruct = {
    name: PromiseOrValue<string>;
    creator: PromiseOrValue<string>;
    currency: PromiseOrValue<string>;
    redemptionFee: PromiseOrValue<BigNumberish>;
    proposerInvestTokenReward: PromiseOrValue<BigNumberish>;
    proposerPaybackTokenReward: PromiseOrValue<BigNumberish>;
    riceRewardReceiver: PromiseOrValue<string>;
  };

  export type CollectiveDaoInfoStructOutput = [
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    string
  ] & {
    name: string;
    creator: string;
    currency: string;
    redemptionFee: BigNumber;
    proposerInvestTokenReward: BigNumber;
    proposerPaybackTokenReward: BigNumber;
    riceRewardReceiver: string;
  };

  export type CollectiveDaoParamsStruct = {
    daoFactoriesAddress: PromiseOrValue<string>[];
    enalbeAdapters: DaoFactory.AdapterStruct[];
    adapters1: DaoFactory.AdapterStruct[];
    investorCapacity: SummonCollectiveDao.InvestorCapacityStruct;
    governorMembership: SummonCollectiveDao.CollectiveGovernorMembershipInfoStruct;
    collectiveDaoVotingInfo: SummonCollectiveDao.CollectiveDaoVotingInfoStruct;
    collectiveDaoInfo: SummonCollectiveDao.CollectiveDaoInfoStruct;
  };

  export type CollectiveDaoParamsStructOutput = [
    string[],
    DaoFactory.AdapterStructOutput[],
    DaoFactory.AdapterStructOutput[],
    SummonCollectiveDao.InvestorCapacityStructOutput,
    SummonCollectiveDao.CollectiveGovernorMembershipInfoStructOutput,
    SummonCollectiveDao.CollectiveDaoVotingInfoStructOutput,
    SummonCollectiveDao.CollectiveDaoInfoStructOutput
  ] & {
    daoFactoriesAddress: string[];
    enalbeAdapters: DaoFactory.AdapterStructOutput[];
    adapters1: DaoFactory.AdapterStructOutput[];
    investorCapacity: SummonCollectiveDao.InvestorCapacityStructOutput;
    governorMembership: SummonCollectiveDao.CollectiveGovernorMembershipInfoStructOutput;
    collectiveDaoVotingInfo: SummonCollectiveDao.CollectiveDaoVotingInfoStructOutput;
    collectiveDaoInfo: SummonCollectiveDao.CollectiveDaoInfoStructOutput;
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

export interface SummonCollectiveDaoInterface extends utils.Interface {
  functions: {
    "multiCall((address,bytes)[8])": FunctionFragment;
    "summonCollectiveDao((address[],(bytes32,address,uint128)[],(bytes32,address,uint128)[],(bool,uint256),(bool,uint256,uint256,address,uint256,address[]),(uint256,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256),(string,address,address,uint256,uint256,uint256,address)))": FunctionFragment;
    "summonCollectiveDao1(address,string,address)": FunctionFragment;
    "summonCollectiveDao10(address)": FunctionFragment;
    "summonCollectiveDao2(address,address,address)": FunctionFragment;
    "summonCollectiveDao3(address,(bytes32,address,uint128)[],address)": FunctionFragment;
    "summonCollectiveDao4(address,address,(bytes32,address,uint128)[],address)": FunctionFragment;
    "summonCollectiveDao5(address,uint8,uint256[8])": FunctionFragment;
    "summonCollectiveDao6(address,uint256,address,uint256,uint256,address)": FunctionFragment;
    "summonCollectiveDao7(address,bool,uint256)": FunctionFragment;
    "summonCollectiveDao8(address,uint256,uint256,uint256,bool,address,address[])": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "multiCall"
      | "summonCollectiveDao"
      | "summonCollectiveDao1"
      | "summonCollectiveDao10"
      | "summonCollectiveDao2"
      | "summonCollectiveDao3"
      | "summonCollectiveDao4"
      | "summonCollectiveDao5"
      | "summonCollectiveDao6"
      | "summonCollectiveDao7"
      | "summonCollectiveDao8"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "multiCall",
    values: [SummonCollectiveDao.CallStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao",
    values: [SummonCollectiveDao.CollectiveDaoParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao1",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao10",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao2",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao3",
    values: [
      PromiseOrValue<string>,
      DaoFactory.AdapterStruct[],
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao4",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      DaoFactory.AdapterStruct[],
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao5",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao6",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao7",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "summonCollectiveDao8",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>,
      PromiseOrValue<string>,
      PromiseOrValue<string>[]
    ]
  ): string;

  decodeFunctionResult(functionFragment: "multiCall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao1",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao10",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao2",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao3",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao4",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao5",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao6",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao7",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "summonCollectiveDao8",
    data: BytesLike
  ): Result;

  events: {
    "CollectiveDaoCreated(address,address,string,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CollectiveDaoCreated"): EventFragment;
}

export interface CollectiveDaoCreatedEventObject {
  daoFactoryAddress: string;
  daoAddr: string;
  name: string;
  creator: string;
}
export type CollectiveDaoCreatedEvent = TypedEvent<
  [string, string, string, string],
  CollectiveDaoCreatedEventObject
>;

export type CollectiveDaoCreatedEventFilter =
  TypedEventFilter<CollectiveDaoCreatedEvent>;

export interface SummonCollectiveDao extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SummonCollectiveDaoInterface;

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
      calls: SummonCollectiveDao.CallStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao(
      params: SummonCollectiveDao.CollectiveDaoParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao10(
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao2(
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao4(
      daoFacAddr: PromiseOrValue<string>,
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao5(
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao6(
      newDaoAddr: PromiseOrValue<string>,
      redemptFee: PromiseOrValue<BigNumberish>,
      currencyAddress: PromiseOrValue<string>,
      proposerInvestTokenReward: PromiseOrValue<BigNumberish>,
      proposerPaybackTokenReward: PromiseOrValue<BigNumberish>,
      riceRewardReceiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao7(
      newDaoAddr: PromiseOrValue<string>,
      enable: PromiseOrValue<boolean>,
      investorCap: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    summonCollectiveDao8(
      newDaoAddr: PromiseOrValue<string>,
      vType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      enable: PromiseOrValue<boolean>,
      collectiveDaoGovernorMembershipTokenAddress: PromiseOrValue<string>,
      collectiveDaoGovernorMembershipWhitelist: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  multiCall(
    calls: SummonCollectiveDao.CallStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao(
    params: SummonCollectiveDao.CollectiveDaoParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao1(
    daoFacAddr: PromiseOrValue<string>,
    daoName: PromiseOrValue<string>,
    creator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao10(
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao2(
    collectiveFundingPoolFacAddr: PromiseOrValue<string>,
    newDaoAddr: PromiseOrValue<string>,
    creator: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao3(
    daoFacAddr: PromiseOrValue<string>,
    enalbeAdapters: DaoFactory.AdapterStruct[],
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao4(
    daoFacAddr: PromiseOrValue<string>,
    collectiveFundingPoolFacAddr: PromiseOrValue<string>,
    adapters1: DaoFactory.AdapterStruct[],
    newDaoAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao5(
    newDaoAddr: PromiseOrValue<string>,
    votingPower: PromiseOrValue<BigNumberish>,
    _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao6(
    newDaoAddr: PromiseOrValue<string>,
    redemptFee: PromiseOrValue<BigNumberish>,
    currencyAddress: PromiseOrValue<string>,
    proposerInvestTokenReward: PromiseOrValue<BigNumberish>,
    proposerPaybackTokenReward: PromiseOrValue<BigNumberish>,
    riceRewardReceiver: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao7(
    newDaoAddr: PromiseOrValue<string>,
    enable: PromiseOrValue<boolean>,
    investorCap: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  summonCollectiveDao8(
    newDaoAddr: PromiseOrValue<string>,
    vType: PromiseOrValue<BigNumberish>,
    miniHolding: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    enable: PromiseOrValue<boolean>,
    collectiveDaoGovernorMembershipTokenAddress: PromiseOrValue<string>,
    collectiveDaoGovernorMembershipWhitelist: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    multiCall(
      calls: SummonCollectiveDao.CallStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    summonCollectiveDao(
      params: SummonCollectiveDao.CollectiveDaoParamsStruct,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao10(
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao2(
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao4(
      daoFacAddr: PromiseOrValue<string>,
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao5(
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao6(
      newDaoAddr: PromiseOrValue<string>,
      redemptFee: PromiseOrValue<BigNumberish>,
      currencyAddress: PromiseOrValue<string>,
      proposerInvestTokenReward: PromiseOrValue<BigNumberish>,
      proposerPaybackTokenReward: PromiseOrValue<BigNumberish>,
      riceRewardReceiver: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao7(
      newDaoAddr: PromiseOrValue<string>,
      enable: PromiseOrValue<boolean>,
      investorCap: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    summonCollectiveDao8(
      newDaoAddr: PromiseOrValue<string>,
      vType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      enable: PromiseOrValue<boolean>,
      collectiveDaoGovernorMembershipTokenAddress: PromiseOrValue<string>,
      collectiveDaoGovernorMembershipWhitelist: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "CollectiveDaoCreated(address,address,string,address)"(
      daoFactoryAddress?: null,
      daoAddr?: null,
      name?: null,
      creator?: null
    ): CollectiveDaoCreatedEventFilter;
    CollectiveDaoCreated(
      daoFactoryAddress?: null,
      daoAddr?: null,
      name?: null,
      creator?: null
    ): CollectiveDaoCreatedEventFilter;
  };

  estimateGas: {
    multiCall(
      calls: SummonCollectiveDao.CallStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao(
      params: SummonCollectiveDao.CollectiveDaoParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao10(
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao2(
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao4(
      daoFacAddr: PromiseOrValue<string>,
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao5(
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao6(
      newDaoAddr: PromiseOrValue<string>,
      redemptFee: PromiseOrValue<BigNumberish>,
      currencyAddress: PromiseOrValue<string>,
      proposerInvestTokenReward: PromiseOrValue<BigNumberish>,
      proposerPaybackTokenReward: PromiseOrValue<BigNumberish>,
      riceRewardReceiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao7(
      newDaoAddr: PromiseOrValue<string>,
      enable: PromiseOrValue<boolean>,
      investorCap: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    summonCollectiveDao8(
      newDaoAddr: PromiseOrValue<string>,
      vType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      enable: PromiseOrValue<boolean>,
      collectiveDaoGovernorMembershipTokenAddress: PromiseOrValue<string>,
      collectiveDaoGovernorMembershipWhitelist: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    multiCall(
      calls: SummonCollectiveDao.CallStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao(
      params: SummonCollectiveDao.CollectiveDaoParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao1(
      daoFacAddr: PromiseOrValue<string>,
      daoName: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao10(
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao2(
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      newDaoAddr: PromiseOrValue<string>,
      creator: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao3(
      daoFacAddr: PromiseOrValue<string>,
      enalbeAdapters: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao4(
      daoFacAddr: PromiseOrValue<string>,
      collectiveFundingPoolFacAddr: PromiseOrValue<string>,
      adapters1: DaoFactory.AdapterStruct[],
      newDaoAddr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao5(
      newDaoAddr: PromiseOrValue<string>,
      votingPower: PromiseOrValue<BigNumberish>,
      _uint256VoteArgs: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao6(
      newDaoAddr: PromiseOrValue<string>,
      redemptFee: PromiseOrValue<BigNumberish>,
      currencyAddress: PromiseOrValue<string>,
      proposerInvestTokenReward: PromiseOrValue<BigNumberish>,
      proposerPaybackTokenReward: PromiseOrValue<BigNumberish>,
      riceRewardReceiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao7(
      newDaoAddr: PromiseOrValue<string>,
      enable: PromiseOrValue<boolean>,
      investorCap: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    summonCollectiveDao8(
      newDaoAddr: PromiseOrValue<string>,
      vType: PromiseOrValue<BigNumberish>,
      miniHolding: PromiseOrValue<BigNumberish>,
      tokenId: PromiseOrValue<BigNumberish>,
      enable: PromiseOrValue<boolean>,
      collectiveDaoGovernorMembershipTokenAddress: PromiseOrValue<string>,
      collectiveDaoGovernorMembershipWhitelist: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
