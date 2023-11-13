/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  StakingRiceExtension,
  StakingRiceExtensionInterface,
} from "../../../../../contracts/extensions/ricestaking/RiceStaking.sol/StakingRiceExtension";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint160",
        name: "amount",
        type: "uint160",
      },
    ],
    name: "NewBalance",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint160",
        name: "amount",
        type: "uint160",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "stakerAddr",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "addToBalance",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenAddr",
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
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    name: "checkpoints",
    outputs: [
      {
        internalType: "uint96",
        name: "fromBlock",
        type: "uint96",
      },
      {
        internalType: "uint160",
        name: "amount",
        type: "uint160",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dao",
    outputs: [
      {
        internalType: "contract DaoRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllRiceStakers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProjectSnapRice",
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
        name: "_dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "numCheckpoints",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddr",
        type: "address",
      },
    ],
    name: "setProjectSnapRice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "stakerAddr",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "subtractFromBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receipientAddr",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
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
  "0x60806040526005805460ff60a01b1916905534801561001d57600080fd5b50611ad68061002d6000396000f3fe6080604052600436106100c75760003560e01c806387c672ee11610074578063d9caed121161004e578063d9caed12146102c7578063e3a05cc1146102e7578063f7888aec1461030757600080fd5b806387c672ee14610242578063c57d5fe914610295578063d37a430a146102a857600080fd5b8063485cc955116100a5578063485cc9551461016d5780635f755d631461018f5780637082e63d146101af57600080fd5b8063158ef93e146100cc5780633be01e7f146101135780634162169f14610135575b600080fd5b3480156100d857600080fd5b506005546100fe9074010000000000000000000000000000000000000000900460ff1681565b60405190151581526020015b60405180910390f35b34801561011f57600080fd5b50610128610327565b60405161010a9190611928565b34801561014157600080fd5b50600554610155906001600160a01b031681565b6040516001600160a01b03909116815260200161010a565b34801561017957600080fd5b5061018d6101883660046118c3565b610338565b005b34801561019b57600080fd5b5061018d6101aa3660046117bd565b6104c1565b3480156101bb57600080fd5b506102166101ca366004611851565b60036020908152600093845260408085208252928452828420905282529020546bffffffffffffffffffffffff8116906c0100000000000000000000000090046001600160a01b031682565b604080516bffffffffffffffffffffffff90931683526001600160a01b0390911660208301520161010a565b34801561024e57600080fd5b5061028061025d3660046117d9565b600460209081526000928352604080842090915290825290205463ffffffff1681565b60405163ffffffff909116815260200161010a565b61018d6102a3366004611811565b61062f565b3480156102b457600080fd5b506002545b60405190815260200161010a565b3480156102d357600080fd5b5061018d6102e2366004611811565b61086b565b3480156102f357600080fd5b5061018d610302366004611811565b610b42565b34801561031357600080fd5b506102b96103223660046117d9565b610cea565b60606103336000610d9b565b905090565b60055474010000000000000000000000000000000000000000900460ff16156103a85760405162461bcd60e51b815260206004820152601f60248201527f726963657374616b696e6720616c726561647920696e697469616c697a65640060448201526064015b60405180910390fd5b6040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b03828116600483015283169063a230c5249060240160206040518083038186803b15801561040257600080fd5b505afa158015610416573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061043a91906118a3565b6104865760405162461bcd60e51b815260206004820152601760248201527f726963657374616b696e673a3a6e6f74206d656d626572000000000000000000604482015260640161039f565b50600580547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b6003303314806104db57506005546001600160a01b031633145b806104f657506005546104f6906001600160a01b0316610daf565b806105cf57506005546001600160a01b0316636cfdc32e333084600381111561052f57634e487b7160e01b600052602160045260246000fd5b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b15801561059757600080fd5b505afa1580156105ab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105cf91906118a3565b61061b5760405162461bcd60e51b815260206004820152601a60248201527f726963657374616b696e673a3a61636365737344656e6965643a000000000000604482015260640161039f565b610628620dceac83610cea565b6002555050565b60003033148061064957506005546001600160a01b031633145b806106645750600554610664906001600160a01b0316610daf565b8061073d57506005546001600160a01b0316636cfdc32e333084600381111561069d57634e487b7160e01b600052602160045260246000fd5b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b15801561070557600080fd5b505afa158015610719573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061073d91906118a3565b6107895760405162461bcd60e51b815260206004820152601a60248201527f726963657374616b696e673a3a61636365737344656e6965643a000000000000604482015260640161039f565b6000826107968686610cea565b6107a091906119c6565b90506000836107b2620dceac87610cea565b6107bc91906119c6565b90506107c9868684610fe8565b6107d7620dceac8683610fe8565b6107e26000876112a7565b610863576107f16000876112c9565b6108635760405162461bcd60e51b815260206004820152603260248201527f526963655374616b696e673a3a616464546f42616c616e63653a3a63616e206e60448201527f6f74206164642072696365207374616b65720000000000000000000000000000606482015260840161039f565b505050505050565b60023033148061088557506005546001600160a01b031633145b806108a057506005546108a0906001600160a01b0316610daf565b8061097957506005546001600160a01b0316636cfdc32e33308460038111156108d957634e487b7160e01b600052602160045260246000fd5b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b15801561094157600080fd5b505afa158015610955573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061097991906118a3565b6109c55760405162461bcd60e51b815260206004820152601a60248201527f726963657374616b696e673a3a61636365737344656e6965643a000000000000604482015260640161039f565b816109d08585610cea565b1015610a445760405162461bcd60e51b815260206004820152602360248201527f7374616b696e673a3a77697468647261773a3a6e6f7420656e6f75676820667560448201527f6e64730000000000000000000000000000000000000000000000000000000000606482015260840161039f565b610a4f848484610b42565b610a636001600160a01b03841685846112de565b6000610a6f8585610cea565b11610af157610a7f600085611363565b610af15760405162461bcd60e51b815260206004820152603260248201527f72696365207374616b696e673a3a77697468647261773a3a63616e206e6f742060448201527f72656d6f76652072696365207374616b65720000000000000000000000000000606482015260840161039f565b604080516001600160a01b038681168252858116602083015284168183015290517ff4d47ca48b90728e6b853fff159bd92cdbd2be6ce116e9ebd8ca4f7f68ce4c8d9181900360600190a150505050565b600130331480610b5c57506005546001600160a01b031633145b80610b775750600554610b77906001600160a01b0316610daf565b80610c5057506005546001600160a01b0316636cfdc32e3330846003811115610bb057634e487b7160e01b600052602160045260246000fd5b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b158015610c1857600080fd5b505afa158015610c2c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c5091906118a3565b610c9c5760405162461bcd60e51b815260206004820152601a60248201527f726963657374616b696e673a3a61636365737344656e6965643a000000000000604482015260640161039f565b600082610ca98686610cea565b610cb39190611a06565b9050600083610cc5620dceac87610cea565b610ccf9190611a06565b9050610cdc868684610fe8565b610863620dceac8683610fe8565b6001600160a01b03808216600090815260046020908152604080832093861683529290529081205463ffffffff1680610d24576000610d88565b6001600160a01b038084166000908152600360209081526040808320938816835292905290812090610d57600184611a1d565b63ffffffff1681526020810191909152604001600020546c0100000000000000000000000090046001600160a01b03165b6001600160a01b03169150505b92915050565b60606000610da883611378565b9392505050565b600080826001600160a01b031663c19d93fb6040518163ffffffff1660e01b815260040160206040518083038186803b158015610deb57600080fd5b505afa158015610dff573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e2391906118d5565b6001811115610e4257634e487b7160e01b600052602160045260246000fd5b148015610d955750816001600160a01b031663c67143666040518163ffffffff1660e01b815260040160206040518083038186803b158015610e8357600080fd5b505afa158015610e97573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ebb91906118f4565b1580610f5257506040517fa230c5240000000000000000000000000000000000000000000000000000000081523360048201526001600160a01b0383169063a230c5249060240160206040518083038186803b158015610f1a57600080fd5b505afa158015610f2e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f5291906118a3565b80610d9557506040517f68c18beb0000000000000000000000000000000000000000000000000000000081523360048201526001600160a01b038316906368c18beb9060240160206040518083038186803b158015610fb057600080fd5b505afa158015610fc4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d9591906118a3565b6001600160a01b0381106110645760405162461bcd60e51b815260206004820152603a60248201527f746f6b656e20616d6f756e74206578636565647320746865206d6178696d756d60448201527f206c696d697420666f722065787465726e616c20746f6b656e73000000000000606482015260840161039f565b6001600160a01b03808316600090815260046020908152604080832093871683529290522054819063ffffffff1680158015906110f757506001600160a01b038085166000908152600360209081526040808320938916835292905290812043916110d0600185611a1d565b63ffffffff1681526020810191909152604001600020546bffffffffffffffffffffffff16145b1561117e576001600160a01b03808516600090815260036020908152604080832093891683529290529081208391611130600185611a1d565b63ffffffff168152602081019190915260400160002080546001600160a01b03929092166c01000000000000000000000000026bffffffffffffffffffffffff909216919091179055611255565b6040805180820182526bffffffffffffffffffffffff43811682526001600160a01b0380861660208085019182528983166000908152600382528681208c85168252825286812063ffffffff891682529091529490942092519351166c010000000000000000000000000292169190911790556111fc8160016119de565b6001600160a01b038581166000908152600460209081526040808320938a1683529290522080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000001663ffffffff929092169190911790555b604080516001600160a01b038781168252868116602083015284168183015290517f8c48e112a72a674174f206bf9efbb831870ac801f9c5e7953811c0a70d1ab0019181900360600190a15050505050565b6001600160a01b03811660009081526001830160205260408120541515610da8565b6000610da8836001600160a01b0384166113d4565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb0000000000000000000000000000000000000000000000000000000017905261135e908490611423565b505050565b6000610da8836001600160a01b038416611508565b6060816000018054806020026020016040519081016040528092919081815260200182805480156113c857602002820191906000526020600020905b8154815260200190600101908083116113b4575b50505050509050919050565b600081815260018301602052604081205461141b57508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610d95565b506000610d95565b6000611478826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166116259092919063ffffffff16565b80519091501561135e578080602001905181019061149691906118a3565b61135e5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f74207375636365656400000000000000000000000000000000000000000000606482015260840161039f565b6000818152600183016020526040812054801561161b57600061152c600183611a06565b855490915060009061154090600190611a06565b90508181146115c157600086600001828154811061156e57634e487b7160e01b600052603260045260246000fd5b906000526020600020015490508087600001848154811061159f57634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910192909255918252600188019052604090208390555b85548690806115e057634e487b7160e01b600052603160045260246000fd5b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610d95565b6000915050610d95565b6060611634848460008561163c565b949350505050565b6060824710156116b45760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c0000000000000000000000000000000000000000000000000000606482015260840161039f565b6001600160a01b0385163b61170b5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015260640161039f565b600080866001600160a01b03168587604051611727919061190c565b60006040518083038185875af1925050503d8060008114611764576040519150601f19603f3d011682016040523d82523d6000602084013e611769565b606091505b5091509150611779828286611784565b979650505050505050565b60608315611793575081610da8565b8251156117a35782518084602001fd5b8160405162461bcd60e51b815260040161039f9190611975565b6000602082840312156117ce578081fd5b8135610da881611a88565b600080604083850312156117eb578081fd5b82356117f681611a88565b9150602083013561180681611a88565b809150509250929050565b600080600060608486031215611825578081fd5b833561183081611a88565b9250602084013561184081611a88565b929592945050506040919091013590565b600080600060608486031215611865578283fd5b833561187081611a88565b9250602084013561188081611a88565b9150604084013563ffffffff81168114611898578182fd5b809150509250925092565b6000602082840312156118b4578081fd5b81518015158114610da8578182fd5b600080604083850312156117eb578182fd5b6000602082840312156118e6578081fd5b815160028110610da8578182fd5b600060208284031215611905578081fd5b5051919050565b6000825161191e818460208701611a42565b9190910192915050565b6020808252825182820181905260009190848201906040850190845b818110156119695783516001600160a01b031683529284019291840191600101611944565b50909695505050505050565b6020815260008251806020840152611994816040850160208701611a42565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b600082198211156119d9576119d9611a72565b500190565b600063ffffffff8083168185168083038211156119fd576119fd611a72565b01949350505050565b600082821015611a1857611a18611a72565b500390565b600063ffffffff83811690831681811015611a3a57611a3a611a72565b039392505050565b60005b83811015611a5d578181015183820152602001611a45565b83811115611a6c576000848401525b50505050565b634e487b7160e01b600052601160045260246000fd5b6001600160a01b0381168114611a9d57600080fd5b5056fea2646970667358221220dfbcefc5d53a2be82d57a03b10223bcea69ce6c1faf76b6b647a72f8bf657fb564736f6c63430008040033";

type StakingRiceExtensionConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StakingRiceExtensionConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StakingRiceExtension__factory extends ContractFactory {
  constructor(...args: StakingRiceExtensionConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<StakingRiceExtension> {
    return super.deploy(overrides || {}) as Promise<StakingRiceExtension>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): StakingRiceExtension {
    return super.attach(address) as StakingRiceExtension;
  }
  override connect(signer: Signer): StakingRiceExtension__factory {
    return super.connect(signer) as StakingRiceExtension__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StakingRiceExtensionInterface {
    return new utils.Interface(_abi) as StakingRiceExtensionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StakingRiceExtension {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as StakingRiceExtension;
  }
}
