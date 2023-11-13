/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IConfiguration,
  IConfigurationInterface,
} from "../../../../contracts/adapters/interfaces/IConfiguration";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "processProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "key",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "numericValue",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "addressValue",
            type: "address",
          },
          {
            internalType: "enum IConfiguration.ConfigType",
            name: "configType",
            type: "uint8",
          },
        ],
        internalType: "struct IConfiguration.Configuration[]",
        name: "configs",
        type: "tuple[]",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "submitProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IConfiguration__factory {
  static readonly abi = _abi;
  static createInterface(): IConfigurationInterface {
    return new utils.Interface(_abi) as IConfigurationInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IConfiguration {
    return new Contract(address, _abi, signerOrProvider) as IConfiguration;
  }
}