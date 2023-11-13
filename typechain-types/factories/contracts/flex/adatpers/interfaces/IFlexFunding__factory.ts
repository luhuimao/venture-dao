/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IFlexFunding,
  IFlexFundingInterface,
} from "../../../../../contracts/flex/adatpers/interfaces/IFlexFunding";

const _abi = [
  {
    inputs: [],
    name: "FundRaiseEndTimeNotUP",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInvestmentInfoParams",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInvestorIdentificationParams",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInvestorPriorityDepositParams",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidReturnFundParams",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidTokenRewardAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidVestingParams",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInExecuteState",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "daoAddress",
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
        internalType: "address",
        name: "proposer",
        type: "address",
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
        name: "daoAddress",
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
        internalType: "enum IFlexFunding.ProposalStatus",
        name: "state",
        type: "uint8",
      },
    ],
    name: "ProposalExecuted",
    type: "event",
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
    ],
    name: "processProposal",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
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
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "minInvestmentAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "maxInvestmentAmount",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "escrow",
                type: "bool",
              },
              {
                internalType: "address",
                name: "paybackTokenAddr",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "paybackTokenAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "minReturnAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "maxReturnAmount",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "approverAddr",
                type: "address",
              },
              {
                internalType: "address",
                name: "recipientAddr",
                type: "address",
              },
            ],
            internalType: "struct IFlexFunding.InvestmentInfo",
            name: "investmentInfo",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "vestingStartTime",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "vestingCliffEndTime",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "vestingEndTime",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "vestingInterval",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "vestingCliffLockAmount",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "nftEnable",
                type: "bool",
              },
              {
                internalType: "address",
                name: "erc721",
                type: "address",
              },
              {
                internalType: "string",
                name: "vestName",
                type: "string",
              },
              {
                internalType: "string",
                name: "vestDescription",
                type: "string",
              },
            ],
            internalType: "struct IFlexFunding.VestInfo",
            name: "vestInfo",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "enum IFlexFunding.FundRaiseType",
                name: "fundRaiseType",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "fundRaiseStartTime",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "fundRaiseEndTime",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "minDepositAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "maxDepositAmount",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "investorIdentification",
                type: "bool",
              },
              {
                components: [
                  {
                    internalType:
                      "enum IFlexFunding.InvestorIdentificationType",
                    name: "bType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint32",
                    name: "bChainId",
                    type: "uint32",
                  },
                  {
                    internalType: "address",
                    name: "bTokanAddr",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "bTokenId",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "bMinHoldingAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct IFlexFunding.InvestorIdentificationInfo",
                name: "investorIdentificationInfo",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "bool",
                    name: "enable",
                    type: "bool",
                  },
                  {
                    internalType: "enum IFlexFunding.PriorityDepositType",
                    name: "pType",
                    type: "uint8",
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                ],
                internalType: "struct IFlexFunding.PriorityDepositInfo",
                name: "priorityDepositInfo",
                type: "tuple",
              },
            ],
            internalType: "struct IFlexFunding.FundRaiseInfo",
            name: "fundRaiseInfo",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "tokenRewardAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "cashRewardAmount",
                type: "uint256",
              },
            ],
            internalType: "struct IFlexFunding.ProposerRewardInfo",
            name: "proposerRewardInfo",
            type: "tuple",
          },
          {
            internalType: "address[]",
            name: "priorityDepositWhitelist",
            type: "address[]",
          },
        ],
        internalType: "struct IFlexFunding.ProposalParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "submitProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IFlexFunding__factory {
  static readonly abi = _abi;
  static createInterface(): IFlexFundingInterface {
    return new utils.Interface(_abi) as IFlexFundingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IFlexFunding {
    return new Contract(address, _abi, signerOrProvider) as IFlexFunding;
  }
}