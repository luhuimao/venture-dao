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
} from "../../../common";

export interface VintageVestingERC721HelperInterface extends utils.Interface {
  functions: {
    "getSvg(uint256,address,address)": FunctionFragment;
    "getTokenURI(uint256,address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "getSvg" | "getTokenURI"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getSvg",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenURI",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "getSvg", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getTokenURI",
    data: BytesLike
  ): Result;

  events: {};
}

export interface VintageVestingERC721Helper extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VintageVestingERC721HelperInterface;

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
    getSvg(
      tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestContrAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getTokenURI(
      _tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  getSvg(
    tokenId: PromiseOrValue<BigNumberish>,
    vestingNFTAddr: PromiseOrValue<string>,
    vestContrAddress: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  getTokenURI(
    _tokenId: PromiseOrValue<BigNumberish>,
    vestingNFTAddr: PromiseOrValue<string>,
    vestAddress: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    getSvg(
      tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestContrAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    getTokenURI(
      _tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {};

  estimateGas: {
    getSvg(
      tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestContrAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTokenURI(
      _tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getSvg(
      tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestContrAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTokenURI(
      _tokenId: PromiseOrValue<BigNumberish>,
      vestingNFTAddr: PromiseOrValue<string>,
      vestAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
