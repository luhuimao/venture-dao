/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
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

export interface IERC20TransferStrategyInterface extends utils.Interface {
  functions: {
    "evaluateTransfer(address,address,address,address,uint256,address)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "evaluateTransfer"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "evaluateTransfer",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "evaluateTransfer",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IERC20TransferStrategy extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IERC20TransferStrategyInterface;

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
    evaluateTransfer(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      caller: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number, BigNumber]>;
  };

  evaluateTransfer(
    dao: PromiseOrValue<string>,
    tokenAddr: PromiseOrValue<string>,
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    caller: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<[number, BigNumber]>;

  callStatic: {
    evaluateTransfer(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      caller: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[number, BigNumber]>;
  };

  filters: {};

  estimateGas: {
    evaluateTransfer(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      caller: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    evaluateTransfer(
      dao: PromiseOrValue<string>,
      tokenAddr: PromiseOrValue<string>,
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      caller: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
