/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  TestToken2,
  TestToken2Interface,
} from "../../../contracts/test/TestToken2";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_totalSupply",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
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
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
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
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
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
    name: "transferFrom",
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
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162000e2b38038062000e2b833981016040819052620000349162000275565b6040518060400160405280600a8152602001692a32b9ba2a37b5b2b71960b11b815250604051806040016040528060038152602001622a2a1960e91b81525081600390805190602001906200008b929190620001cf565b508051620000a1906004906020840190620001cf565b505050620000db33620000b9620000e260201b60201c565b620000c99060ff16600a620002f2565b620000d59084620003bd565b620000e7565b5062000432565b601290565b6001600160a01b038216620001425760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640160405180910390fd5b80600260008282546200015691906200028e565b90915550506001600160a01b03821660009081526020819052604081208054839290620001859084906200028e565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b828054620001dd90620003df565b90600052602060002090601f0160209004810192826200020157600085556200024c565b82601f106200021c57805160ff19168380011785556200024c565b828001600101855582156200024c579182015b828111156200024c5782518255916020019190600101906200022f565b506200025a9291506200025e565b5090565b5b808211156200025a57600081556001016200025f565b60006020828403121562000287578081fd5b5051919050565b60008219821115620002a457620002a46200041c565b500190565b600181815b80851115620002ea578160001904821115620002ce57620002ce6200041c565b80851615620002dc57918102915b93841c9390800290620002ae565b509250929050565b600062000300838362000307565b9392505050565b6000826200031857506001620003b7565b816200032757506000620003b7565b81600181146200034057600281146200034b576200036b565b6001915050620003b7565b60ff8411156200035f576200035f6200041c565b50506001821b620003b7565b5060208310610133831016604e8410600b841016171562000390575081810a620003b7565b6200039c8383620002a9565b8060001904821115620003b357620003b36200041c565b0290505b92915050565b6000816000190483118215151615620003da57620003da6200041c565b500290565b600181811c90821680620003f457607f821691505b602082108114156200041657634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b6109e980620004426000396000f3fe608060405234801561001057600080fd5b50600436106100c95760003560e01c80633950935111610081578063a457c2d71161005b578063a457c2d714610187578063a9059cbb1461019a578063dd62ed3e146101ad57600080fd5b8063395093511461014357806370a082311461015657806395d89b411461017f57600080fd5b806318160ddd116100b257806318160ddd1461010f57806323b872dd14610121578063313ce5671461013457600080fd5b806306fdde03146100ce578063095ea7b3146100ec575b600080fd5b6100d66101e6565b6040516100e391906108b1565b60405180910390f35b6100ff6100fa366004610888565b610278565b60405190151581526020016100e3565b6002545b6040519081526020016100e3565b6100ff61012f36600461084d565b610290565b604051601281526020016100e3565b6100ff610151366004610888565b6102b4565b6101136101643660046107fa565b6001600160a01b031660009081526020819052604090205490565b6100d66102f3565b6100ff610195366004610888565b610302565b6100ff6101a8366004610888565b6103b1565b6101136101bb36600461081b565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6060600380546101f59061095f565b80601f01602080910402602001604051908101604052809291908181526020018280546102219061095f565b801561026e5780601f106102435761010080835404028352916020019161026e565b820191906000526020600020905b81548152906001019060200180831161025157829003601f168201915b5050505050905090565b6000336102868185856103bf565b5060019392505050565b60003361029e858285610517565b6102a98585856105c7565b506001949350505050565b3360008181526001602090815260408083206001600160a01b038716845290915281205490919061028690829086906102ee908790610922565b6103bf565b6060600480546101f59061095f565b3360008181526001602090815260408083206001600160a01b0387168452909152812054909190838110156103a45760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6102a982868684036103bf565b6000336102868185856105c7565b6001600160a01b03831661043a5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f7265737300000000000000000000000000000000000000000000000000000000606482015260840161039b565b6001600160a01b0382166104b65760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f7373000000000000000000000000000000000000000000000000000000000000606482015260840161039b565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146105c157818110156105b45760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000604482015260640161039b565b6105c184848484036103bf565b50505050565b6001600160a01b0383166106435760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f6472657373000000000000000000000000000000000000000000000000000000606482015260840161039b565b6001600160a01b0382166106bf5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f6573730000000000000000000000000000000000000000000000000000000000606482015260840161039b565b6001600160a01b0383166000908152602081905260409020548181101561074e5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e63650000000000000000000000000000000000000000000000000000606482015260840161039b565b6001600160a01b03808516600090815260208190526040808220858503905591851681529081208054849290610785908490610922565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516107d191815260200190565b60405180910390a36105c1565b80356001600160a01b03811681146107f557600080fd5b919050565b60006020828403121561080b578081fd5b610814826107de565b9392505050565b6000806040838503121561082d578081fd5b610836836107de565b9150610844602084016107de565b90509250929050565b600080600060608486031215610861578081fd5b61086a846107de565b9250610878602085016107de565b9150604084013590509250925092565b6000806040838503121561089a578182fd5b6108a3836107de565b946020939093013593505050565b6000602080835283518082850152825b818110156108dd578581018301518582016040015282016108c1565b818111156108ee5783604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b6000821982111561095a577f4e487b710000000000000000000000000000000000000000000000000000000081526011600452602481fd5b500190565b600181811c9082168061097357607f821691505b602082108114156109ad577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b5091905056fea2646970667358221220297a071e27b7ee07c26a9213b5ca74e92cf68ddac9ca6cc6f589b685ec2a22ce64736f6c63430008040033";

type TestToken2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestToken2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestToken2__factory extends ContractFactory {
  constructor(...args: TestToken2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _totalSupply: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TestToken2> {
    return super.deploy(_totalSupply, overrides || {}) as Promise<TestToken2>;
  }
  override getDeployTransaction(
    _totalSupply: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_totalSupply, overrides || {});
  }
  override attach(address: string): TestToken2 {
    return super.attach(address) as TestToken2;
  }
  override connect(signer: Signer): TestToken2__factory {
    return super.connect(signer) as TestToken2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestToken2Interface {
    return new utils.Interface(_abi) as TestToken2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestToken2 {
    return new Contract(address, _abi, signerOrProvider) as TestToken2;
  }
}
