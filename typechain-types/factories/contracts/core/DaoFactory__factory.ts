/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  DaoFactory,
  DaoFactoryInterface,
} from "../../../contracts/core/DaoFactory";

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
        name: "_address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "DAOCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_oldOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_newOwner",
        type: "address",
      },
    ],
    name: "OwnerChanged",
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
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint128",
            name: "flags",
            type: "uint128",
          },
        ],
        internalType: "struct DaoFactory.Adapter[]",
        name: "adapters",
        type: "tuple[]",
      },
    ],
    name: "addAdapters",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "addresses",
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
    inputs: [
      {
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "extension",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint128",
            name: "flags",
            type: "uint128",
          },
        ],
        internalType: "struct DaoFactory.Adapter[]",
        name: "adapters",
        type: "tuple[]",
      },
    ],
    name: "configureExtension",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "daoName",
        type: "string",
      },
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "createDao",
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
    ],
    name: "daos",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "daoName",
        type: "string",
      },
    ],
    name: "getDaoAddress",
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
  {
    inputs: [],
    name: "owner",
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
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "setOwner",
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
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint128",
            name: "flags",
            type: "uint128",
          },
        ],
        internalType: "struct DaoFactory.Adapter",
        name: "adapter",
        type: "tuple",
      },
    ],
    name: "updateAdapter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161141538038061141583398101604081905261002f916100a6565b6001600160a01b0381166100785760405162461bcd60e51b815260206004820152600c60248201526b34b73b30b634b21030b2323960a11b604482015260640160405180910390fd5b600280546001600160a01b039092166001600160a01b031992831617905560038054909116331790556100d4565b6000602082840312156100b7578081fd5b81516001600160a01b03811681146100cd578182fd5b9392505050565b611332806100e36000396000f3fe608060405234801561001057600080fd5b50600436106100be5760003560e01c80638da5cb5b11610076578063ac704cbe1161005b578063ac704cbe1461017d578063bf45767a14610190578063c25f3cf6146101a357600080fd5b80638da5cb5b146101575780639bb200841461016a57600080fd5b806329ca12ed116100a757806329ca12ed146101085780633baeff3f1461011b578063699f200f1461012e57600080fd5b806313af4035146100c35780631d1f0a27146100d8575b600080fd5b6100d66100d1366004610eb7565b6101d1565b005b6100eb6100e6366004611026565b610269565b6040516001600160a01b0390911681526020015b60405180910390f35b6100d6610116366004610f12565b6102ba565b6100d6610129366004611066565b61059e565b6100eb61013c366004610efa565b6001602052600090815260409020546001600160a01b031681565b6003546100eb906001600160a01b031681565b6100d6610178366004610f75565b610741565b6100d661018b366004610fc8565b610ab5565b6002546100eb906001600160a01b031681565b6101c36101b1366004610eb7565b60006020819052908152604090205481565b6040519081526020016100ff565b6003546001600160a01b031633146101e857600080fd5b600354604080516001600160a01b03928316815291831660208301527fb532073b38c83145e3e5135377a08bf9aab55bc0fd7c1179cd4fb995d2a5159c910160405180910390a1600380547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b60006001600061029985856040516020016102859291906110eb565b604051602081830303815290604052610d0f565b81526020810191909152604001600020546001600160a01b03169392505050565b60405163288c314960e21b81523360048201526001600160a01b0385169063a230c5249060240160206040518083038186803b1580156102f957600080fd5b505afa15801561030d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103319190610eda565b6103825760405162461bcd60e51b815260206004820152600a60248201527f6e6f74206d656d6265720000000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6000846001600160a01b031663c19d93fb6040518163ffffffff1660e01b815260040160206040518083038186803b1580156103bd57600080fd5b505afa1580156103d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103f59190611007565b600181111561041457634e487b7160e01b600052602160045260246000fd5b146104615760405162461bcd60e51b815260206004820152601f60248201527f746869732044414f2068617320616c7265616479206265656e207365747570006044820152606401610379565b80156105985760005b8181101561059657846001600160a01b031663179986f8858585858181106104a257634e487b7160e01b600052603260045260246000fd5b90506060020160200160208101906104ba9190610eb7565b8686868181106104da57634e487b7160e01b600052603260045260246000fd5b90506060020160400160208101906104f291906110bb565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b1681526001600160a01b0393841660048201529290911660248301526fffffffffffffffffffffffffffffffff166044820152606401600060405180830381600087803b15801561056b57600080fd5b505af115801561057f573d6000803e3d6000fd5b50505050808061058e906112a2565b91505061046a565b505b50505050565b60006105b684846040516020016102859291906110eb565b6000818152600160209081526040918290205491519293506001600160a01b0390911615916105e99187918791016110fb565b604051602081830303815290604052906106165760405162461bcd60e51b8152600401610379919061124f565b5060025460009061062f906001600160a01b0316610d2b565b600083815260016020908152604080832080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b038681169182179092558085529284905292819020869055517fc0c53b8b000000000000000000000000000000000000000000000000000000008152918616600483015233602483015230604483015291925082919063c0c53b8b90606401600060405180830381600087803b1580156106e457600080fd5b505af11580156106f8573d6000803e3d6000fd5b505050507f87efdefc545e4a926431f358053a7ddaf28342672ba94923d20b4c07451b75a0818588886040516107319493929190611158565b60405180910390a1505050505050565b60405163288c314960e21b81523360048201526001600160a01b0384169063a230c5249060240160206040518083038186803b15801561078057600080fd5b505afa158015610794573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107b89190610eda565b6108045760405162461bcd60e51b815260206004820152600a60248201527f6e6f74206d656d626572000000000000000000000000000000000000000000006044820152606401610379565b6000836001600160a01b031663c19d93fb6040518163ffffffff1660e01b815260040160206040518083038186803b15801561083f57600080fd5b505afa158015610853573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108779190611007565b600181111561089657634e487b7160e01b600052602160045260246000fd5b146108e35760405162461bcd60e51b815260206004820152601f60248201527f746869732044414f2068617320616c7265616479206265656e207365747570006044820152606401610379565b6109216040518060400160405280600b81526020017f6164644164617074657273000000000000000000000000000000000000000000815250610d94565b8015610ab05760005b81811015610a7157836001600160a01b031663a37ff5e484848481811061096157634e487b7160e01b600052603260045260246000fd5b9050606002016000013585858581811061098b57634e487b7160e01b600052603260045260246000fd5b90506060020160200160208101906109a39190610eb7565b8686868181106109c357634e487b7160e01b600052603260045260246000fd5b90506060020160400160208101906109db91906110bb565b60408051600080825260208201908152818301928390527fffffffff0000000000000000000000000000000000000000000000000000000060e088901b16909252610a2c94939291604482016111a2565b600060405180830381600087803b158015610a4657600080fd5b505af1158015610a5a573d6000803e3d6000fd5b505050508080610a69906112a2565b91505061092a565b50610ab06040518060400160405280600d81526020017f6164617074657220616464656400000000000000000000000000000000000000815250610d94565b505050565b60405163288c314960e21b81523360048201526001600160a01b0383169063a230c5249060240160206040518083038186803b158015610af457600080fd5b505afa158015610b08573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b2c9190610eda565b610b785760405162461bcd60e51b815260206004820152600a60248201527f6e6f74206d656d626572000000000000000000000000000000000000000000006044820152606401610379565b6000826001600160a01b031663c19d93fb6040518163ffffffff1660e01b815260040160206040518083038186803b158015610bb357600080fd5b505afa158015610bc7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610beb9190611007565b6001811115610c0a57634e487b7160e01b600052602160045260246000fd5b14610c575760405162461bcd60e51b815260206004820152601f60248201527f746869732044414f2068617320616c7265616479206265656e207365747570006044820152606401610379565b6001600160a01b03821663a37ff5e48235610c786040850160208601610eb7565b610c8860608601604087016110bb565b60408051600080825260208201908152818301928390527fffffffff0000000000000000000000000000000000000000000000000000000060e088901b16909252610cd994939291604482016111a2565b600060405180830381600087803b158015610cf357600080fd5b505af1158015610d07573d6000803e3d6000fd5b505050505050565b6000815160001415610d2357506000919050565b506020015190565b6000808260601b90506040517f3d602d80600a3d3981f3363d3d373d3d3d363d7300000000000000000000000081528160148201527f5af43d82803e903d91602b57fd5bf3000000000000000000000000000000000060288201526037816000f0949350505050565b610e0581604051602401610da8919061124f565b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167f41304fac00000000000000000000000000000000000000000000000000000000179052610e08565b50565b610e058160006a636f6e736f6c652e6c6f679050600080835160208501845afa505050565b60008083601f840112610e3e578182fd5b50813567ffffffffffffffff811115610e55578182fd5b602083019150836020606083028501011115610e7057600080fd5b9250929050565b60008083601f840112610e88578182fd5b50813567ffffffffffffffff811115610e9f578182fd5b602083019150836020828501011115610e7057600080fd5b600060208284031215610ec8578081fd5b8135610ed3816112e7565b9392505050565b600060208284031215610eeb578081fd5b81518015158114610ed3578182fd5b600060208284031215610f0b578081fd5b5035919050565b60008060008060608587031215610f27578283fd5b8435610f32816112e7565b93506020850135610f42816112e7565b9250604085013567ffffffffffffffff811115610f5d578283fd5b610f6987828801610e2d565b95989497509550505050565b600080600060408486031215610f89578283fd5b8335610f94816112e7565b9250602084013567ffffffffffffffff811115610faf578283fd5b610fbb86828701610e2d565b9497909650939450505050565b6000808284036080811215610fdb578283fd5b8335610fe6816112e7565b92506060601f1982011215610ff9578182fd5b506020830190509250929050565b600060208284031215611018578081fd5b815160028110610ed3578182fd5b60008060208385031215611038578182fd5b823567ffffffffffffffff81111561104e578283fd5b61105a85828601610e77565b90969095509350505050565b60008060006040848603121561107a578283fd5b833567ffffffffffffffff811115611090578384fd5b61109c86828701610e77565b90945092505060208401356110b0816112e7565b809150509250925092565b6000602082840312156110cc578081fd5b81356fffffffffffffffffffffffffffffffff81168114610ed3578182fd5b8183823760009101908152919050565b7f6e616d65200000000000000000000000000000000000000000000000000000008152818360058301377f20616c72656164792074616b656e00000000000000000000000000000000000091016005810191909152601301919050565b60006001600160a01b0380871683528086166020840152506060604083015282606083015282846080840137818301608090810191909152601f909201601f191601019392505050565b600060a0820187835260206001600160a01b038816818501526fffffffffffffffffffffffffffffffff8716604085015260a0606085015281865180845260c0860191508288019350845b81811015611209578451835293830193918301916001016111ed565b505084810360808601528551808252908201925081860190845b8181101561123f57825185529383019391830191600101611223565b50929a9950505050505050505050565b6000602080835283518082850152825b8181101561127b5785810183015185820160400152820161125f565b8181111561128c5783604083870101525b50601f01601f1916929092016040019392505050565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156112e057634e487b7160e01b81526011600452602481fd5b5060010190565b6001600160a01b0381168114610e0557600080fdfea2646970667358221220bb0b4215d513bfa17b86aa63c8d45e38de63abda6e221d4e2b301f455d51467564736f6c63430008040033";

type DaoFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DaoFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DaoFactory__factory extends ContractFactory {
  constructor(...args: DaoFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _identityAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DaoFactory> {
    return super.deploy(
      _identityAddress,
      overrides || {}
    ) as Promise<DaoFactory>;
  }
  override getDeployTransaction(
    _identityAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_identityAddress, overrides || {});
  }
  override attach(address: string): DaoFactory {
    return super.attach(address) as DaoFactory;
  }
  override connect(signer: Signer): DaoFactory__factory {
    return super.connect(signer) as DaoFactory__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DaoFactoryInterface {
    return new utils.Interface(_abi) as DaoFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DaoFactory {
    return new Contract(address, _abi, signerOrProvider) as DaoFactory;
  }
}
