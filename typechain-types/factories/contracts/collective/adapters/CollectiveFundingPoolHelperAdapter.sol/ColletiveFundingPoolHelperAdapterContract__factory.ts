/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  ColletiveFundingPoolHelperAdapterContract,
  ColletiveFundingPoolHelperAdapterContractInterface,
} from "../../../../../contracts/collective/adapters/CollectiveFundingPoolHelperAdapter.sol/ColletiveFundingPoolHelperAdapterContract";

const _abi = [
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
    ],
    name: "balanceOf",
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
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOfToken",
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
    ],
    name: "poolBalance",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506105c1806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806368abb5e0146100465780638fbc7eb01461006b578063f7888aec1461007e575b600080fd5b6100596100543660046104b0565b610091565b60405190815260200160405180910390f35b610059610079366004610504565b6101e3565b61005961008c3660046104cc565b610340565b604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab6004820152600090819073ffffffffffffffffffffffffffffffffffffffff84169063593e96b69060240160206040518083038186803b15801561010257600080fd5b505afa158015610116573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061013a9190610494565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815261decd600482015290915073ffffffffffffffffffffffffffffffffffffffff8216906370a082319060240160206040518083038186803b1580156101a457600080fd5b505afa1580156101b8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101dc919061054e565b9392505050565b604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab6004820152600090819073ffffffffffffffffffffffffffffffffffffffff86169063593e96b69060240160206040518083038186803b15801561025457600080fd5b505afa158015610268573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061028c9190610494565b6040517ff59e38b700000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff858116600483015286811660248301529192509082169063f59e38b79060440160206040518083038186803b1580156102ff57600080fd5b505afa158015610313573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610337919061054e565b95945050505050565b604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab6004820152600090819073ffffffffffffffffffffffffffffffffffffffff85169063593e96b69060240160206040518083038186803b1580156103b157600080fd5b505afa1580156103c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103e99190610494565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8581166004830152919250908216906370a082319060240160206040518083038186803b15801561045457600080fd5b505afa158015610468573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061048c919061054e565b949350505050565b6000602082840312156104a5578081fd5b81516101dc81610566565b6000602082840312156104c1578081fd5b81356101dc81610566565b600080604083850312156104de578081fd5b82356104e981610566565b915060208301356104f981610566565b809150509250929050565b600080600060608486031215610518578081fd5b833561052381610566565b9250602084013561053381610566565b9150604084013561054381610566565b809150509250925092565b60006020828403121561055f578081fd5b5051919050565b73ffffffffffffffffffffffffffffffffffffffff8116811461058857600080fd5b5056fea2646970667358221220522ecf4f42fab382bc44219c0efc55531ebb9e498eb145f7bb22c899c33ac10664736f6c63430008040033";

type ColletiveFundingPoolHelperAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ColletiveFundingPoolHelperAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ColletiveFundingPoolHelperAdapterContract__factory extends ContractFactory {
  constructor(
    ...args: ColletiveFundingPoolHelperAdapterContractConstructorParams
  ) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ColletiveFundingPoolHelperAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<ColletiveFundingPoolHelperAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ColletiveFundingPoolHelperAdapterContract {
    return super.attach(address) as ColletiveFundingPoolHelperAdapterContract;
  }
  override connect(
    signer: Signer
  ): ColletiveFundingPoolHelperAdapterContract__factory {
    return super.connect(
      signer
    ) as ColletiveFundingPoolHelperAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ColletiveFundingPoolHelperAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as ColletiveFundingPoolHelperAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ColletiveFundingPoolHelperAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ColletiveFundingPoolHelperAdapterContract;
  }
}
