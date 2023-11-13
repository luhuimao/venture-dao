/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  VintageFundingPoolFactory,
  VintageFundingPoolFactoryInterface,
} from "../../../../../contracts/vintage/extensions/fundingpool/VintageFundingPoolFactory";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_identityAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
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
        internalType: "address",
        name: "extensionAddress",
        type: "address",
      },
    ],
    name: "FundingPoolCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
    ],
    name: "create",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
    ],
    name: "getExtensionAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "identityAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161044738038061044783398101604081905261002f916100a2565b60016000556001600160a01b03811661007d5760405162461bcd60e51b815260206004820152600c60248201526b34b73b30b634b21030b2323960a11b604482015260640160405180910390fd5b600180546001600160a01b0319166001600160a01b03929092169190911790556100d0565b6000602082840312156100b3578081fd5b81516001600160a01b03811681146100c9578182fd5b9392505050565b610368806100df6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80633146637e146100465780639ed93318146100a8578063bf45767a146100bd575b600080fd5b61007f6100543660046102f7565b73ffffffffffffffffffffffffffffffffffffffff9081166000908152600260205260409020541690565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f35b6100bb6100b63660046102f7565b6100dd565b005b60015461007f9073ffffffffffffffffffffffffffffffffffffffff1681565b6002600054141561014f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064015b60405180910390fd5b600260005573ffffffffffffffffffffffffffffffffffffffff81166101d1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f696e76616c69642064616f2061646472000000000000000000000000000000006044820152606401610146565b6001546000906101f69073ffffffffffffffffffffffffffffffffffffffff1661028e565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526002602090815260409182902080547fffffffffffffffffffffffff000000000000000000000000000000000000000016948616948517905581519283528201929092529192507ffd68314cee8cb506e36881981ab22f83fbd379d771ff661a7b2c0992a5b7727b910160405180910390a150506001600055565b6000808260601b90506040517f3d602d80600a3d3981f3363d3d373d3d3d363d7300000000000000000000000081528160148201527f5af43d82803e903d91602b57fd5bf3000000000000000000000000000000000060288201526037816000f0949350505050565b600060208284031215610308578081fd5b813573ffffffffffffffffffffffffffffffffffffffff8116811461032b578182fd5b939250505056fea2646970667358221220e00737de625737e40f493c7129177b6e56d5fc8b7c68279fc2f284c4fc0d8f0264736f6c63430008040033";

type VintageFundingPoolFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VintageFundingPoolFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VintageFundingPoolFactory__factory extends ContractFactory {
  constructor(...args: VintageFundingPoolFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _identityAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<VintageFundingPoolFactory> {
    return super.deploy(
      _identityAddress,
      overrides || {}
    ) as Promise<VintageFundingPoolFactory>;
  }
  override getDeployTransaction(
    _identityAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_identityAddress, overrides || {});
  }
  override attach(address: string): VintageFundingPoolFactory {
    return super.attach(address) as VintageFundingPoolFactory;
  }
  override connect(signer: Signer): VintageFundingPoolFactory__factory {
    return super.connect(signer) as VintageFundingPoolFactory__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VintageFundingPoolFactoryInterface {
    return new utils.Interface(_abi) as VintageFundingPoolFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VintageFundingPoolFactory {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as VintageFundingPoolFactory;
  }
}
