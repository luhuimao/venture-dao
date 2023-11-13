/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  ERC20MinterContract,
  ERC20MinterContractInterface,
} from "../../../../contracts/test/ERC20Minter.sol/ERC20MinterContract";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Minted",
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
    name: "execute",
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
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610614806100206000396000f3fe60806040526004361061002d5760003560e01c8063c6c3bbe614610084578063eafaddfd146100a657600080fd5b3661007f5760405162461bcd60e51b815260206004820152600f60248201527f66616c6c6261636b20726576657274000000000000000000000000000000000060448201526064015b60405180910390fd5b600080fd5b34801561009057600080fd5b506100a461009f36600461056e565b6100c6565b005b3480156100b257600080fd5b506100a46100c136600461056e565b6102a1565b6040517f593e96b60000000000000000000000000000000000000000000000000000000081527f0a6340841997155e4545ea64344191824abf8b42ca0c889bb376e9a09b1c4c79600482015283906000906001600160a01b0383169063593e96b69060240160206040518083038186803b15801561014357600080fd5b505afa158015610157573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061017b919061054b565b9050306001600160a01b038216146101d55760405162461bcd60e51b815260206004820152601d60248201527f6f6e6c792063616c6c61626c6520627920746865206578656375746f720000006044820152606401610076565b6040517fa0712d6800000000000000000000000000000000000000000000000000000000815260048101849052339085906001600160a01b0382169063a0712d6890602401600060405180830381600087803b15801561023457600080fd5b505af1158015610248573d6000803e3d6000fd5b5050604080516001600160a01b0380871682528a1660208201529081018890527f9d228d69b5fdb8d273a2336f8fb8612d039631024ea9bf09c424a9503aa078f09250606001905060405180910390a150505050505050565b8243816001600160a01b031663b21634826040518163ffffffff1660e01b815260040160206040518083038186803b1580156102dc57600080fd5b505afa1580156102f0573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061031491906105ae565b14156103625760405162461bcd60e51b815260206004820152601060248201527f7265656e7472616e6379206775617264000000000000000000000000000000006044820152606401610076565b806001600160a01b03166310fdb0a26040518163ffffffff1660e01b8152600401600060405180830381600087803b15801561039d57600080fd5b505af11580156103b1573d6000803e3d6000fd5b50506040517f593e96b60000000000000000000000000000000000000000000000000000000081527f0a6340841997155e4545ea64344191824abf8b42ca0c889bb376e9a09b1c4c796004820152600092506001600160a01b038716915063593e96b69060240160206040518083038186803b15801561043057600080fd5b505afa158015610444573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610468919061054b565b6040517fc6c3bbe60000000000000000000000000000000000000000000000000000000081526001600160a01b038781166004830152868116602483015260448201869052919250829182169063c6c3bbe690606401600060405180830381600087803b1580156104d857600080fd5b505af11580156104ec573d6000803e3d6000fd5b505050505050806001600160a01b031663d4f7af436040518163ffffffff1660e01b8152600401600060405180830381600087803b15801561052d57600080fd5b505af1158015610541573d6000803e3d6000fd5b5050505050505050565b60006020828403121561055c578081fd5b8151610567816105c6565b9392505050565b600080600060608486031215610582578182fd5b833561058d816105c6565b9250602084013561059d816105c6565b929592945050506040919091013590565b6000602082840312156105bf578081fd5b5051919050565b6001600160a01b03811681146105db57600080fd5b5056fea264697066735822122020c71916627d2d30a9311e7684f3972a45549670d7daff713f2120266952dbf864736f6c63430008040033";

type ERC20MinterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC20MinterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC20MinterContract__factory extends ContractFactory {
  constructor(...args: ERC20MinterContractConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ERC20MinterContract> {
    return super.deploy(overrides || {}) as Promise<ERC20MinterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC20MinterContract {
    return super.attach(address) as ERC20MinterContract;
  }
  override connect(signer: Signer): ERC20MinterContract__factory {
    return super.connect(signer) as ERC20MinterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20MinterContractInterface {
    return new utils.Interface(_abi) as ERC20MinterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC20MinterContract {
    return new Contract(address, _abi, signerOrProvider) as ERC20MinterContract;
  }
}
