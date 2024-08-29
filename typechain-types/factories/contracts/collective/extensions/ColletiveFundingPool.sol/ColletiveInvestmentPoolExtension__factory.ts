/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  ColletiveInvestmentPoolExtension,
  ColletiveInvestmentPoolExtensionInterface,
} from "../../../../../contracts/collective/extensions/ColletiveFundingPool.sol/ColletiveInvestmentPoolExtension";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "accountFrom",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "accountTo",
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
    name: "WithdrawTo",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "accountTo",
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
    name: "WithdrawToFromAll",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "member",
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
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint160",
        name: "",
        type: "uint160",
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
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "getPriorAmount",
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
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "internalTransfer",
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
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "isActiveMember",
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
        name: "investorAddr",
        type: "address",
      },
    ],
    name: "isInvestor",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "substractFromAll",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
        name: "member",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "toAddress",
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
    name: "withdrawFromAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "memberFrom",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "memberTo",
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
    name: "withdrawTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040526000805460ff1916905534801561001a57600080fd5b506129238061002a6000396000f3fe60806040526004361061010e5760003560e01c806359e026f7116100a5578063b08079a611610074578063d45fda9c11610059578063d45fda9c1461032a578063d9caed121461034a578063f1127ed81461036a57600080fd5b8063b08079a6146102f7578063cee2a9cf1461030a57600080fd5b806359e026f71461024f5780636fcfff451461026f57806370a08231146102b75780638ecf7720146102d757600080fd5b80631267aef2116100e15780631267aef2146101b8578063158ef93e146101d85780634162169f146101f2578063485cc9551461022f57600080fd5b806301ffc9a7146101135780630435f48b1461014857806306c0b3cc146101765780630adecc0414610198575b600080fd5b34801561011f57600080fd5b5061013361012e36600461265b565b6103ee565b60405190151581526020015b60405180910390f35b34801561015457600080fd5b506101686101633660046125d0565b61058f565b60405190815260200161013f565b34801561018257600080fd5b50610196610191366004612540565b610855565b005b3480156101a457600080fd5b506101966101b33660046125d0565b610acb565b3480156101c457600080fd5b506101966101d3366004612590565b610c9f565b3480156101e457600080fd5b506000546101339060ff1681565b3480156101fe57600080fd5b506000546102179061010090046001600160a01b031681565b6040516001600160a01b03909116815260200161013f565b34801561023b57600080fd5b5061019661024a366004612683565b610ee3565b34801561025b57600080fd5b5061019661026a366004612590565b611089565b34801561027b57600080fd5b506102a261028a366004612524565b60026020526000908152604090205463ffffffff1681565b60405163ffffffff909116815260200161013f565b3480156102c357600080fd5b506102176102d2366004612524565b611238565b3480156102e357600080fd5b506101336102f2366004612683565b6112b8565b6101966103053660046125d0565b611335565b34801561031657600080fd5b50610133610325366004612524565b6114e9565b34801561033657600080fd5b506101966103453660046126cf565b6114f6565b34801561035657600080fd5b50610196610365366004612590565b611703565b34801561037657600080fd5b506103c26103853660046125fb565b60016020908152600092835260408084209091529082529020546bffffffffffffffffffffffff811690600160601b90046001600160a01b031682565b604080516bffffffffffffffffffffffff90931683526001600160a01b0390911660208301520161013f565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000006001600160e01b03198316148061045157507f0adecc04000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b8061048557507fb08079a6000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b806104b957507f0435f48b000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b806104ed57507f70a08231000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b8061052157507f59e026f7000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b8061055557507fd9caed12000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b8061058957507f06c0b3cc000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b92915050565b600043821061060b5760405162461bcd60e51b815260206004820152602760248201527f556e693a3a6765745072696f72416d6f756e743a206e6f74207965742064657460448201527f65726d696e65640000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6001600160a01b03831660009081526002602052604090205463ffffffff1680610639576000915050610589565b6001600160a01b03841660009081526001602081905260408220859290916106619085612837565b63ffffffff1681526020810191909152604001600020546bffffffffffffffffffffffff16116106e1576001600160a01b0384166000908152600160208190526040822091906106b19084612837565b63ffffffff168152602081019190915260400160002054600160601b90046001600160a01b031691506105899050565b6001600160a01b03841660009081526001602090815260408083208380529091529020546bffffffffffffffffffffffff16831015610724576000915050610589565b600080610732600184612837565b90505b8163ffffffff168163ffffffff16111561081757600060026107578484612837565b61076191906127c0565b61076b9083612837565b6001600160a01b03808916600090815260016020908152604080832063ffffffff861684528252918290208251808401909352546bffffffffffffffffffffffff8116808452600160601b909104909316908201529192508714156107e357602001516001600160a01b031694506105899350505050565b80516bffffffffffffffffffffffff1687111561080257819350610810565b61080d600183612837565b92505b5050610735565b506001600160a01b03948516600090815260016020908152604080832063ffffffff9490941683529290522054600160601b90049093169392505050565b600330331480610874575060005461010090046001600160a01b031633145b8061089457506000546108949061010090046001600160a01b0316611945565b8061095a575060005461010090046001600160a01b0316636cfdc32e33308460068111156108d257634e487b7160e01b600052602160045260246000fd5b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b15801561092257600080fd5b505afa158015610936573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061095a919061263b565b6109a65760405162461bcd60e51b815260206004820181905260248201527f666c65782066756e64696e6720706f6f6c3a3a61636365737344656e6965643a6044820152606401610602565b816109b086611238565b6001600160a01b03161015610a2d5760405162461bcd60e51b815260206004820152602d60248201527f666c65782066756e64696e6720706f6f6c3a3a77697468647261773a3a6e6f7460448201527f20656e6f7567682066756e6473000000000000000000000000000000000000006064820152608401610602565b610a378583610acb565b6001600160a01b038316610a5d57610a586001600160a01b03851683611b65565b610a71565b610a716001600160a01b0384168584611c83565b604080516001600160a01b0387811682528681166020830152858116828401528416606082015290517f9c5c430cfa10ced1876365001f2481344decb32bf815e01e3e5706ebe533f9759181900360800190a15050505050565b600130331480610aea575060005461010090046001600160a01b031633145b80610b0a5750600054610b0a9061010090046001600160a01b0316611945565b80610bd0575060005461010090046001600160a01b0316636cfdc32e3330846006811115610b4857634e487b7160e01b600052602160045260246000fd5b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b158015610b9857600080fd5b505afa158015610bac573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bd0919061263b565b610c1c5760405162461bcd60e51b815260206004820181905260248201527f666c65782066756e64696e6720706f6f6c3a3a61636365737344656e6965643a6044820152606401610602565b600082610c2885611238565b6001600160a01b0316610c3b9190612820565b9050600083610c4b61babe611238565b6001600160a01b0316610c5e9190612820565b9050610c6a8583611d03565b6000610c7586611238565b6001600160a01b031611610c8c57610c8c85611f62565b610c9861babe82611d03565b5050505050565b600330331480610cbe575060005461010090046001600160a01b031633145b80610cde5750600054610cde9061010090046001600160a01b0316611945565b80610da4575060005461010090046001600160a01b0316636cfdc32e3330846006811115610d1c57634e487b7160e01b600052602160045260246000fd5b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b158015610d6c57600080fd5b505afa158015610d80573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610da4919061263b565b610df05760405162461bcd60e51b815260206004820181905260248201527f666c65782066756e64696e6720706f6f6c3a3a61636365737344656e6965643a6044820152606401610602565b81610dfc61babe611238565b6001600160a01b03161015610e795760405162461bcd60e51b815260206004820152602d60248201527f666c65782066756e64696e6720706f6f6c3a3a77697468647261773a3a6e6f7460448201527f20656e6f7567682066756e6473000000000000000000000000000000000000006064820152608401610602565b610e8d6001600160a01b0384168584611c83565b604080516001600160a01b03808716825280861660208301528416918101919091527fede32f53632f476b275a5d994aa0c640845bf9088e592e43cefc14d81c76bb40906060015b60405180910390a150505050565b60005460ff1615610f5c5760405162461bcd60e51b815260206004820152602560248201527f666c65782066756e64696e6720706f6f6c20616c726561647920696e6974696160448201527f6c697a65640000000000000000000000000000000000000000000000000000006064820152608401610602565b60405163288c314960e21b81526001600160a01b03828116600483015283169063a230c5249060240160206040518083038186803b158015610f9d57600080fd5b505afa158015610fb1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fd5919061263b565b6110215760405162461bcd60e51b815260206004820152601d60248201527f666c65782066756e64696e6720706f6f6c3a3a6e6f74206d656d6265720000006044820152606401610602565b50600080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff006001600160a01b0390931661010002929092167fffffffffffffffffffffff000000000000000000000000000000000000000000909216919091176001179055565b6002303314806110a8575060005461010090046001600160a01b031633145b806110c857506000546110c89061010090046001600160a01b0316611945565b8061118e575060005461010090046001600160a01b0316636cfdc32e333084600681111561110657634e487b7160e01b600052602160045260246000fd5b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b15801561115657600080fd5b505afa15801561116a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061118e919061263b565b6111da5760405162461bcd60e51b815260206004820181905260248201527f666c65782066756e64696e6720706f6f6c3a3a61636365737344656e6965643a6044820152606401610602565b6000826111e686611238565b6001600160a01b03166111f99190612820565b905060008361120786611238565b6001600160a01b031661121a919061276c565b90506112268683611d03565b6112308582611d03565b505050505050565b6001600160a01b03811660009081526002602052604081205463ffffffff16806112635760006112b1565b6001600160a01b0383166000908152600160208190526040822091906112899084612837565b63ffffffff168152602081019190915260400160002054600160601b90046001600160a01b03165b9392505050565b60405163288c314960e21b81526001600160a01b0382811660048301526000919084169063a230c5249060240160206040518083038186803b1580156112fd57600080fd5b505afa158015611311573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112b1919061263b565b600030331480611354575060005461010090046001600160a01b031633145b8061137457506000546113749061010090046001600160a01b0316611945565b8061143a575060005461010090046001600160a01b0316636cfdc32e33308460068111156113b257634e487b7160e01b600052602160045260246000fd5b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b15801561140257600080fd5b505afa158015611416573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061143a919061263b565b6114865760405162461bcd60e51b815260206004820181905260248201527f666c65782066756e64696e6720706f6f6c3a3a61636365737344656e6965643a6044820152606401610602565b60008261149285611238565b6001600160a01b03166114a5919061276c565b90506000836114b561babe611238565b6001600160a01b03166114c8919061276c565b90506114d48583611d03565b6114e061babe82611d03565b610c9885611fed565b6000610589600383612086565b600130331480611515575060005461010090046001600160a01b031633145b8061153557506000546115359061010090046001600160a01b0316611945565b806115fb575060005461010090046001600160a01b0316636cfdc32e333084600681111561157357634e487b7160e01b600052602160045260246000fd5b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b1580156115c357600080fd5b505afa1580156115d7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115fb919061263b565b6116475760405162461bcd60e51b815260206004820181905260248201527f666c65782066756e64696e6720706f6f6c3a3a61636365737344656e6965643a6044820152606401610602565b600061165360036120a8565b9050600061166261babe611238565b6001600160a01b0316905060005b82518160ff161015610c98576000838260ff16815181106116a157634e487b7160e01b600052603260045260246000fd5b6020026020010151905060006116b682611238565b6001600160a01b031611156116f0576116f081846116d384611238565b6116e6906001600160a01b03168a6127e3565b6101b391906127ac565b50806116fb8161288c565b915050611670565b600330331480611722575060005461010090046001600160a01b031633145b8061174257506000546117429061010090046001600160a01b0316611945565b80611808575060005461010090046001600160a01b0316636cfdc32e333084600681111561178057634e487b7160e01b600052602160045260246000fd5b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015260ff16604482015260640160206040518083038186803b1580156117d057600080fd5b505afa1580156117e4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611808919061263b565b6118545760405162461bcd60e51b815260206004820181905260248201527f666c65782066756e64696e6720706f6f6c3a3a61636365737344656e6965643a6044820152606401610602565b8161185e85611238565b6001600160a01b031610156118db5760405162461bcd60e51b815260206004820152602d60248201527f666c65782066756e64696e6720706f6f6c3a3a77697468647261773a3a6e6f7460448201527f20656e6f7567682066756e6473000000000000000000000000000000000000006064820152608401610602565b6118e58483610acb565b6118f96001600160a01b0384168584611c83565b604080516001600160a01b03808716825280861660208301528416918101919091527ff4d47ca48b90728e6b853fff159bd92cdbd2be6ce116e9ebd8ca4f7f68ce4c8d90606001610ed5565b600080826001600160a01b031663c19d93fb6040518163ffffffff1660e01b815260040160206040518083038186803b15801561198157600080fd5b505afa158015611995573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119b991906126b0565b60018111156119d857634e487b7160e01b600052602160045260246000fd5b1480156105895750816001600160a01b031663c67143666040518163ffffffff1660e01b815260040160206040518083038186803b158015611a1957600080fd5b505afa158015611a2d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a5191906126e7565b1580611acf575060405163288c314960e21b81523360048201526001600160a01b0383169063a230c5249060240160206040518083038186803b158015611a9757600080fd5b505afa158015611aab573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611acf919061263b565b8061058957506040517f68c18beb0000000000000000000000000000000000000000000000000000000081523360048201526001600160a01b038316906368c18beb9060240160206040518083038186803b158015611b2d57600080fd5b505afa158015611b41573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610589919061263b565b80471015611bb55760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e63650000006044820152606401610602565b6000826001600160a01b03168260405160006040518083038185875af1925050503d8060008114611c02576040519150601f19603f3d011682016040523d82523d6000602084013e611c07565b606091505b5050905080611c7e5760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d617920686176652072657665727465640000000000006064820152608401610602565b505050565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb00000000000000000000000000000000000000000000000000000000179052611c7e9084906120b5565b6001600160a01b038110611d7f5760405162461bcd60e51b815260206004820152602660248201527f746f6b656e20616d6f756e74206578636565647320746865206d6178696d756d60448201527f206c696d697400000000000000000000000000000000000000000000000000006064820152608401610602565b6001600160a01b038216600090815260026020526040902054819063ffffffff168015801590611df957506001600160a01b0384166000908152600160208190526040822043929091611dd29085612837565b63ffffffff1681526020810191909152604001600020546bffffffffffffffffffffffff16145b15611e6b576001600160a01b0384166000908152600160208190526040822084929091611e269085612837565b63ffffffff168152602081019190915260400160002080546001600160a01b0392909216600160601b026bffffffffffffffffffffffff909216919091179055611f22565b6040805180820182526bffffffffffffffffffffffff43811682526001600160a01b0380861660208085019182528983166000908152600180835287822063ffffffff8a1683529092529590952093519051909116600160601b029116179055611ed6908290612784565b6001600160a01b038516600090815260026020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000001663ffffffff929092169190911790555b604080516001600160a01b038087168252841660208201527faaaac6f7f8353fdf9046fe40fdd4fe7925fd5c5e6f4ddb82cd7fa9b9751624bf9101610ed5565b6001600160a01b038116611fde5760405162461bcd60e51b815260206004820152603a60248201527f46756e64696e67506f6f6c3a3a5f72656d6f7665496e766573746f723a3a696e60448201527f76616c696420696e766573746f724164647220616464726573730000000000006064820152608401610602565b611fe960038261219a565b5050565b6001600160a01b0381166120695760405162461bcd60e51b815260206004820152603360248201527f46756e64696e67506f6f6c3a3a5f6e6577496e766573746f723a3a696e76616c60448201527f696420696e766573746f722061646472657373000000000000000000000000006064820152608401610602565b612074600382612086565b61208357611fe96003826121af565b50565b6001600160a01b038116600090815260018301602052604081205415156112b1565b606060006112b1836121c4565b600061210a826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166122209092919063ffffffff16565b805190915015611c7e5780806020019051810190612128919061263b565b611c7e5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f742073756363656564000000000000000000000000000000000000000000006064820152608401610602565b60006112b1836001600160a01b038416612237565b60006112b1836001600160a01b038416612354565b60608160000180548060200260200160405190810160405280929190818152602001828054801561221457602002820191906000526020600020905b815481526020019060010190808311612200575b50505050509050919050565b606061222f84846000856123a3565b949350505050565b6000818152600183016020526040812054801561234a57600061225b600183612820565b855490915060009061226f90600190612820565b90508181146122f057600086600001828154811061229d57634e487b7160e01b600052603260045260246000fd5b90600052602060002001549050808760000184815481106122ce57634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910192909255918252600188019052604090208390555b855486908061230f57634e487b7160e01b600052603160045260246000fd5b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610589565b6000915050610589565b600081815260018301602052604081205461239b57508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610589565b506000610589565b60608247101561241b5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c00000000000000000000000000000000000000000000000000006064820152608401610602565b6001600160a01b0385163b6124725760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610602565b600080866001600160a01b0316858760405161248e91906126ff565b60006040518083038185875af1925050503d80600081146124cb576040519150601f19603f3d011682016040523d82523d6000602084013e6124d0565b606091505b50915091506124e08282866124eb565b979650505050505050565b606083156124fa5750816112b1565b82511561250a5782518084602001fd5b8160405162461bcd60e51b8152600401610602919061271b565b600060208284031215612535578081fd5b81356112b1816128d8565b60008060008060808587031215612555578283fd5b8435612560816128d8565b93506020850135612570816128d8565b92506040850135612580816128d8565b9396929550929360600135925050565b6000806000606084860312156125a4578283fd5b83356125af816128d8565b925060208401356125bf816128d8565b929592945050506040919091013590565b600080604083850312156125e2578182fd5b82356125ed816128d8565b946020939093013593505050565b6000806040838503121561260d578182fd5b8235612618816128d8565b9150602083013563ffffffff81168114612630578182fd5b809150509250929050565b60006020828403121561264c578081fd5b815180151581146112b1578182fd5b60006020828403121561266c578081fd5b81356001600160e01b0319811681146112b1578182fd5b60008060408385031215612695578182fd5b82356126a0816128d8565b91506020830135612630816128d8565b6000602082840312156126c1578081fd5b8151600281106112b1578182fd5b6000602082840312156126e0578081fd5b5035919050565b6000602082840312156126f8578081fd5b5051919050565b6000825161271181846020870161285c565b9190910192915050565b602081526000825180602084015261273a81604085016020870161285c565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b6000821982111561277f5761277f6128ac565b500190565b600063ffffffff8083168185168083038211156127a3576127a36128ac565b01949350505050565b6000826127bb576127bb6128c2565b500490565b600063ffffffff808416806127d7576127d76128c2565b92169190910492915050565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561281b5761281b6128ac565b500290565b600082821015612832576128326128ac565b500390565b600063ffffffff83811690831681811015612854576128546128ac565b039392505050565b60005b8381101561287757818101518382015260200161285f565b83811115612886576000848401525b50505050565b600060ff821660ff8114156128a3576128a36128ac565b60010192915050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b6001600160a01b038116811461208357600080fdfea2646970667358221220d81a74260a9cf8f7dc7ec53dc7e20d7372c1c38d82ef680441aace1c9f21062264736f6c63430008040033";

type ColletiveInvestmentPoolExtensionConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ColletiveInvestmentPoolExtensionConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ColletiveInvestmentPoolExtension__factory extends ContractFactory {
  constructor(...args: ColletiveInvestmentPoolExtensionConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ColletiveInvestmentPoolExtension> {
    return super.deploy(
      overrides || {}
    ) as Promise<ColletiveInvestmentPoolExtension>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ColletiveInvestmentPoolExtension {
    return super.attach(address) as ColletiveInvestmentPoolExtension;
  }
  override connect(signer: Signer): ColletiveInvestmentPoolExtension__factory {
    return super.connect(signer) as ColletiveInvestmentPoolExtension__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ColletiveInvestmentPoolExtensionInterface {
    return new utils.Interface(
      _abi
    ) as ColletiveInvestmentPoolExtensionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ColletiveInvestmentPoolExtension {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ColletiveInvestmentPoolExtension;
  }
}
