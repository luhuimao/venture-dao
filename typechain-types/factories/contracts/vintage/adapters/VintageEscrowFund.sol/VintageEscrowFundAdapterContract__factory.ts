/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  VintageEscrowFundAdapterContract,
  VintageEscrowFundAdapterContractInterface,
} from "../../../../../contracts/vintage/adapters/VintageEscrowFund.sol/VintageEscrowFundAdapterContract";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fundRound",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "EscrowFund",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fundRound",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WithDraw",
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
        internalType: "uint256",
        name: "fundRound",
        type: "uint256",
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
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "escrowFundFromFundingPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "escrowFunds",
    outputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint128",
        name: "amount",
        type: "uint128",
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
        internalType: "uint256",
        name: "fundRound",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getEscrowAmount",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
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
        internalType: "uint256",
        name: "fundRound",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50611004806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806328f245491461005157806365017e83146100db5780636be2a761146100f0578063f3fef3a31461016c575b600080fd5b6100a661005f366004610d6c565b60006020818152938152604080822085529281528281209093528252902080546001909101546001600160a01b03909116906fffffffffffffffffffffffffffffffff1682565b604080516001600160a01b0390931683526fffffffffffffffffffffffffffffffff9091166020830152015b60405180910390f35b6100ee6100e9366004610e31565b61017f565b005b61014d6100fe366004610e1d565b6001600160a01b039283166000908152602081815260408083209483529381528382209285168252919091522080546001909101549116916fffffffffffffffffffffffffffffffff90911690565b604080516001600160a01b0390931683526020830191909152016100d2565b6100ee61017a366004610df2565b6103bf565b6040517f17ba7d850000000000000000000000000000000000000000000000000000000081527faaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c89260048201526001600160a01b038616906317ba7d859060240160206040518083038186803b1580156101f757600080fd5b505afa15801561020b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061022f9190610d50565b6001600160a01b0316336001600160a01b0316146102945760405162461bcd60e51b815260206004820152600b60248201527f6163636573732064656e7900000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6001600160a01b038086166000908152602081815260408083208884528252808320938616835292905290812060010180548392906102e69084906fffffffffffffffffffffffffffffffff16610f10565b82546fffffffffffffffffffffffffffffffff9182166101009390930a9283029190920219909116179055506001600160a01b0385811660008181526020818152604080832089845282528083208786168085529083529281902080549589167fffffffffffffffffffffffff00000000000000000000000000000000000000009096168617905580519384529083018890528281019390935260608201526080810183905290517f03479aae3efa2ad621b48c9392b03b017efc7fa166b49fafa8efd8e4f51f6a309181900360a00190a15050505050565b8160006103cb8261064f565b6001600160a01b038516600090815260208181526040808320878452825280832033845290915290206001810154919250906fffffffffffffffffffffffffffffffff1661045b5760405162461bcd60e51b815260206004820152601360248201527f6e6f2066756e6420746f20776974686472617700000000000000000000000000604482015260640161028b565b600181015481546040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201526fffffffffffffffffffffffffffffffff9092169182916001600160a01b0316906370a082319060240160206040518083038186803b1580156104d057600080fd5b505afa1580156104e4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105089190610e8b565b10156105a45781546040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201526001600160a01b03909116906370a082319060240160206040518083038186803b15801561056957600080fd5b505afa15801561057d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105a19190610e8b565b90505b81546105ba906001600160a01b0316338361091a565b6001820180547fffffffffffffffffffffffffffffffff000000000000000000000000000000001690558154604080516001600160a01b038981168252602082018990529092168282015233606083015260808201839052517f8fb0c6b578329940a29cb7d87372bf8a2a14778824eb55ab8eed2d9bbb40a8579181900360a00190a15050610649828261099f565b50505050565b6040805160808101825260008082526020820181905291810182905260608101919091525a81600001818152505043826001600160a01b031663b21634826040518163ffffffff1660e01b815260040160206040518083038186803b1580156106b757600080fd5b505afa1580156106cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106ef9190610e8b565b141561073d5760405162461bcd60e51b815260206004820152601060248201527f7265656e7472616e637920677561726400000000000000000000000000000000604482015260640161028b565b816001600160a01b03166310fdb0a26040518163ffffffff1660e01b8152600401600060405180830381600087803b15801561077857600080fd5b505af115801561078c573d6000803e3d6000fd5b50506040517f72c6838f0000000000000000000000000000000000000000000000000000000081527f1f2fd42ad6a6cacd573c4b212beb7a4e2499ad45d742a65337097f130e71daff6004820152600092506001600160a01b03851691506372c6838f9060240160206040518083038186803b15801561080b57600080fd5b505afa15801561081f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108439190610d50565b90506001600160a01b03811661085f5760006020830152610914565b6001600160a01b038181166060840181905283516040517f43a8a3f1000000000000000000000000000000000000000000000000000000008152928616600484015260248301526000918291906343a8a3f190604401604080518083038186803b1580156108cc57600080fd5b505afa1580156108e0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109049190610dc7565b9015156020860152604085015250505b50919050565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb0000000000000000000000000000000000000000000000000000000017905261099a9084906109ae565b505050565b6109aa828233610a93565b5050565b6000610a03826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316610ba19092919063ffffffff16565b80519091501561099a5780806020019051810190610a219190610dad565b61099a5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f74207375636365656400000000000000000000000000000000000000000000606482015260840161028b565b816020015115610b495781606001516001600160a01b0316635e5eb01384835a8651610abf9190610f44565b60408088015190517fffffffff0000000000000000000000000000000000000000000000000000000060e087901b1681526001600160a01b03948516600482015293909216602484015260448301526064820152608401600060405180830381600087803b158015610b3057600080fd5b505af1158015610b44573d6000803e3d6000fd5b505050505b826001600160a01b031663d4f7af436040518163ffffffff1660e01b8152600401600060405180830381600087803b158015610b8457600080fd5b505af1158015610b98573d6000803e3d6000fd5b50505050505050565b6060610bb08484600085610bba565b90505b9392505050565b606082471015610c325760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c0000000000000000000000000000000000000000000000000000606482015260840161028b565b6001600160a01b0385163b610c895760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015260640161028b565b600080866001600160a01b03168587604051610ca59190610ea3565b60006040518083038185875af1925050503d8060008114610ce2576040519150601f19603f3d011682016040523d82523d6000602084013e610ce7565b606091505b5091509150610cf7828286610d02565b979650505050505050565b60608315610d11575081610bb3565b825115610d215782518084602001fd5b8160405162461bcd60e51b815260040161028b9190610ebf565b80518015158114610d4b57600080fd5b919050565b600060208284031215610d61578081fd5b8151610bb381610fb6565b600080600060608486031215610d80578182fd5b8335610d8b81610fb6565b9250602084013591506040840135610da281610fb6565b809150509250925092565b600060208284031215610dbe578081fd5b610bb382610d3b565b60008060408385031215610dd9578182fd5b610de283610d3b565b9150602083015190509250929050565b60008060408385031215610e04578182fd5b8235610e0f81610fb6565b946020939093013593505050565b600080600060608486031215610d80578283fd5b600080600080600060a08688031215610e48578081fd5b8535610e5381610fb6565b9450602086013593506040860135610e6a81610fb6565b92506060860135610e7a81610fb6565b949793965091946080013592915050565b600060208284031215610e9c578081fd5b5051919050565b60008251610eb5818460208701610f5b565b9190910192915050565b6020815260008251806020840152610ede816040850160208701610f5b565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b60006fffffffffffffffffffffffffffffffff808316818516808303821115610f3b57610f3b610f87565b01949350505050565b600082821015610f5657610f56610f87565b500390565b60005b83811015610f76578181015183820152602001610f5e565b838111156106495750506000910152565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6001600160a01b0381168114610fcb57600080fd5b5056fea264697066735822122036072d956d3f22bcb45f93e050575758cf72323d5ba3720f514f5eaa1896813664736f6c63430008040033";

type VintageEscrowFundAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VintageEscrowFundAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VintageEscrowFundAdapterContract__factory extends ContractFactory {
  constructor(...args: VintageEscrowFundAdapterContractConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<VintageEscrowFundAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<VintageEscrowFundAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): VintageEscrowFundAdapterContract {
    return super.attach(address) as VintageEscrowFundAdapterContract;
  }
  override connect(signer: Signer): VintageEscrowFundAdapterContract__factory {
    return super.connect(signer) as VintageEscrowFundAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VintageEscrowFundAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as VintageEscrowFundAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VintageEscrowFundAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as VintageEscrowFundAdapterContract;
  }
}
