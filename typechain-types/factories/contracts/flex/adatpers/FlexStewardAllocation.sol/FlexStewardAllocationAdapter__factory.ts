/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  FlexStewardAllocationAdapter,
  FlexStewardAllocationAdapterInterface,
} from "../../../../../contracts/flex/adatpers/FlexStewardAllocation.sol/FlexStewardAllocationAdapter";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "daoAddr",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getAllocation",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "setAllocation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061045c806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80635f15b1d91461003b578063a6d945cc14610050575b600080fd5b61004e6100493660046103ce565b610099565b005b61008761005e366004610376565b6001600160a01b0391821660009081526020818152604080832093909416825291909152205490565b60405190815260200160405180910390f35b6040517fa230c5240000000000000000000000000000000000000000000000000000000081523360048201526001600160a01b0384169063a230c5249060240160206040518083038186803b1580156100f157600080fd5b505afa158015610105573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061012991906103ae565b806101f457506040517f17ba7d850000000000000000000000000000000000000000000000000000000081527fcad7b0867188190920a10bf710c45443f6358175d56a759e7dc109e6d7b5d75360048201526001600160a01b038416906317ba7d859060240160206040518083038186803b1580156101a757600080fd5b505afa1580156101bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101df9190610353565b6001600160a01b0316336001600160a01b0316145b806102bf57506040517f17ba7d850000000000000000000000000000000000000000000000000000000081527fff9379b98b93eb3bd1fac62fd2258a7955d70d2d5279c40064145b6c9646df3760048201526001600160a01b038416906317ba7d859060240160206040518083038186803b15801561027257600080fd5b505afa158015610286573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102aa9190610353565b6001600160a01b0316336001600160a01b0316145b610329576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600760248201527f2141636365737300000000000000000000000000000000000000000000000000604482015260640160405180910390fd5b6001600160a01b039283166000908152602081815260408083209490951682529290925291902055565b600060208284031215610364578081fd5b815161036f8161040e565b9392505050565b60008060408385031215610388578081fd5b82356103938161040e565b915060208301356103a38161040e565b809150509250929050565b6000602082840312156103bf578081fd5b8151801515811461036f578182fd5b6000806000606084860312156103e2578081fd5b83356103ed8161040e565b925060208401356103fd8161040e565b929592945050506040919091013590565b6001600160a01b038116811461042357600080fd5b5056fea2646970667358221220f71639b0acf6e0f110fadde4b98ff39abfad83bf9c918af56dc6ad9301308eef64736f6c63430008040033";

type FlexStewardAllocationAdapterConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlexStewardAllocationAdapterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlexStewardAllocationAdapter__factory extends ContractFactory {
  constructor(...args: FlexStewardAllocationAdapterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlexStewardAllocationAdapter> {
    return super.deploy(
      overrides || {}
    ) as Promise<FlexStewardAllocationAdapter>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FlexStewardAllocationAdapter {
    return super.attach(address) as FlexStewardAllocationAdapter;
  }
  override connect(signer: Signer): FlexStewardAllocationAdapter__factory {
    return super.connect(signer) as FlexStewardAllocationAdapter__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlexStewardAllocationAdapterInterface {
    return new utils.Interface(_abi) as FlexStewardAllocationAdapterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlexStewardAllocationAdapter {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as FlexStewardAllocationAdapter;
  }
}
