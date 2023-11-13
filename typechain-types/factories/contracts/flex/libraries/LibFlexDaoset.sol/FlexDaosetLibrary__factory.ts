/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  FlexDaosetLibrary,
  FlexDaosetLibraryInterface,
} from "../../../../../contracts/flex/libraries/LibFlexDaoset.sol/FlexDaosetLibrary";

const _abi = [
  {
    inputs: [],
    name: "VOTING_NOT_FINISH",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea264697066735822122006a41b6488d81d0525cc13d412f75b9730e10e01abeb2d7dfe469bc05a43870264736f6c63430008040033";

type FlexDaosetLibraryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlexDaosetLibraryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlexDaosetLibrary__factory extends ContractFactory {
  constructor(...args: FlexDaosetLibraryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlexDaosetLibrary> {
    return super.deploy(overrides || {}) as Promise<FlexDaosetLibrary>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FlexDaosetLibrary {
    return super.attach(address) as FlexDaosetLibrary;
  }
  override connect(signer: Signer): FlexDaosetLibrary__factory {
    return super.connect(signer) as FlexDaosetLibrary__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlexDaosetLibraryInterface {
    return new utils.Interface(_abi) as FlexDaosetLibraryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlexDaosetLibrary {
    return new Contract(address, _abi, signerOrProvider) as FlexDaosetLibrary;
  }
}
