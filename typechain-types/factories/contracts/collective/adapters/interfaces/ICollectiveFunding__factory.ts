/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICollectiveFunding,
  ICollectiveFundingInterface,
} from "../../../../../contracts/collective/adapters/interfaces/ICollectiveFunding";

const _abi = [
  {
    inputs: [],
    name: "DAOSET_PROPOSALS_UNDONE",
    type: "error",
  },
  {
    inputs: [],
    name: "FUND_RAISE_UNEXECUTE",
    type: "error",
  },
  {
    inputs: [],
    name: "GRACE_PERIOD",
    type: "error",
  },
  {
    inputs: [],
    name: "INVESTMENT_PROPOSAL_NOT_FINALIZED",
    type: "error",
  },
  {
    inputs: [],
    name: "NOT_INVESTMENT_PERIOD",
    type: "error",
  },
  {
    inputs: [],
    name: "UNDONE_OPERATION_PROPOSALS",
    type: "error",
  },
  {
    inputs: [],
    name: "VOTING_PERIOD",
    type: "error",
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
        name: "allVotingWeight",
        type: "uint256",
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
    name: "ProposalExecuted",
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
    ],
    name: "StartVoting",
    type: "event",
  },
] as const;

export class ICollectiveFunding__factory {
  static readonly abi = _abi;
  static createInterface(): ICollectiveFundingInterface {
    return new utils.Interface(_abi) as ICollectiveFundingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICollectiveFunding {
    return new Contract(address, _abi, signerOrProvider) as ICollectiveFunding;
  }
}
