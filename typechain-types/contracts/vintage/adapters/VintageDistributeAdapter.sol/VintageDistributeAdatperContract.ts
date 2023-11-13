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
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../../common";

export interface VintageDistributeAdatperContractInterface
  extends utils.Interface {
  functions: {
    "distributeFundByInvestment(address,address[3],uint256[4])": FunctionFragment;
    "subFromFundPool(address,uint256,uint256,uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "distributeFundByInvestment" | "subFromFundPool"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "distributeFundByInvestment",
    values: [
      PromiseOrValue<string>,
      [PromiseOrValue<string>, PromiseOrValue<string>, PromiseOrValue<string>],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "subFromFundPool",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "distributeFundByInvestment",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "subFromFundPool",
    data: BytesLike
  ): Result;

  events: {};
}

export interface VintageDistributeAdatperContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VintageDistributeAdatperContractInterface;

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
    distributeFundByInvestment(
      dao: PromiseOrValue<string>,
      _addressArgs: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      fees: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    subFromFundPool(
      dao: PromiseOrValue<string>,
      fundingAmount: PromiseOrValue<BigNumberish>,
      protocolFee: PromiseOrValue<BigNumberish>,
      managementFee: PromiseOrValue<BigNumberish>,
      proposerFundReward: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  distributeFundByInvestment(
    dao: PromiseOrValue<string>,
    _addressArgs: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ],
    fees: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  subFromFundPool(
    dao: PromiseOrValue<string>,
    fundingAmount: PromiseOrValue<BigNumberish>,
    protocolFee: PromiseOrValue<BigNumberish>,
    managementFee: PromiseOrValue<BigNumberish>,
    proposerFundReward: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    distributeFundByInvestment(
      dao: PromiseOrValue<string>,
      _addressArgs: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      fees: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: CallOverrides
    ): Promise<void>;

    subFromFundPool(
      dao: PromiseOrValue<string>,
      fundingAmount: PromiseOrValue<BigNumberish>,
      protocolFee: PromiseOrValue<BigNumberish>,
      managementFee: PromiseOrValue<BigNumberish>,
      proposerFundReward: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    distributeFundByInvestment(
      dao: PromiseOrValue<string>,
      _addressArgs: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      fees: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    subFromFundPool(
      dao: PromiseOrValue<string>,
      fundingAmount: PromiseOrValue<BigNumberish>,
      protocolFee: PromiseOrValue<BigNumberish>,
      managementFee: PromiseOrValue<BigNumberish>,
      proposerFundReward: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    distributeFundByInvestment(
      dao: PromiseOrValue<string>,
      _addressArgs: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      fees: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    subFromFundPool(
      dao: PromiseOrValue<string>,
      fundingAmount: PromiseOrValue<BigNumberish>,
      protocolFee: PromiseOrValue<BigNumberish>,
      managementFee: PromiseOrValue<BigNumberish>,
      proposerFundReward: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
