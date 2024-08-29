/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IFlexDaoset,
  IFlexDaosetInterface,
} from "../../../../../contracts/flex/adatpers/interfaces/IFlexDaoset";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "daoAddr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "enum FlexDaosetLibrary.ProposalType",
        name: "pType",
        type: "uint8",
      },
    ],
    name: "ProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "daoAddr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "voteResult",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "allVotingWeight",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nbYes",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nbNo",
        type: "uint256",
      },
    ],
    name: "ProposalProcessed",
    type: "event",
  },
] as const;

export class IFlexDaoset__factory {
  static readonly abi = _abi;
  static createInterface(): IFlexDaosetInterface {
    return new utils.Interface(_abi) as IFlexDaosetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IFlexDaoset {
    return new Contract(address, _abi, signerOrProvider) as IFlexDaoset;
  }
}
