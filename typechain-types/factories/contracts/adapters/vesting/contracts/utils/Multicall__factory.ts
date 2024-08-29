/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  Multicall,
  MulticallInterface,
} from "../../../../../../contracts/adapters/vesting/contracts/utils/Multicall";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class Multicall__factory {
  static readonly abi = _abi;
  static createInterface(): MulticallInterface {
    return new utils.Interface(_abi) as MulticallInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Multicall {
    return new Contract(address, _abi, signerOrProvider) as Multicall;
  }
}
