/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  FlexERC721,
  FlexERC721Interface,
} from "../../../../contracts/flex/adatpers/FlexERC721";

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
        indexed: true,
        internalType: "uint256",
        name: "id",
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
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
        indexed: true,
        internalType: "uint256",
        name: "id",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "getApproved",
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
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "getTokenAmountByTokenId",
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
    ],
    name: "isApprovedForAll",
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
    name: "mint",
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
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "owner",
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
        name: "id",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
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
        name: "id",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_fetcher",
        type: "address",
      },
    ],
    name: "setTokenURIFetcher",
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
    name: "tokenId",
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
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "tokenURI",
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
    name: "tokenURIFetcher",
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
        name: "id",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405260016006553480156200001657600080fd5b50604080518082018252600c81526b466c65782056657374696e6760a01b60208083019182528351808501909452600884526711931156159154d560c21b9084015281519192916200006b916000916200009c565b508051620000819060019060208401906200009c565b5050600880546001600160a01b03191633179055506200017f565b828054620000aa9062000142565b90600052602060002090601f016020900481019282620000ce576000855562000119565b82601f10620000e957805160ff191683800117855562000119565b8280016001018555821562000119579182015b8281111562000119578251825591602001919060010190620000fc565b50620001279291506200012b565b5090565b5b808211156200012757600081556001016200012c565b600181811c908216806200015757607f821691505b602082108114156200017957634e487b7160e01b600052602260045260246000fd5b50919050565b61165c806200018f6000396000f3fe608060405234801561001057600080fd5b50600436106101515760003560e01c80634d3af18c116100cd578063a22cb46511610081578063b88d4fde11610066578063b88d4fde146102c6578063c87b56dd146102d9578063e985e9c5146102ed57600080fd5b8063a22cb465146102a0578063b3a2b2cf146102b357600080fd5b806370a08231116100b257806370a08231146102725780638da5cb5b1461028557806395d89b411461029857600080fd5b80634d3af18c1461024c5780636352211e1461025f57600080fd5b8063095ea7b31161012457806323b872dd1161010957806323b872dd146102135780632cfd30051461022657806342842e0e1461023957600080fd5b8063095ea7b3146101e757806317d70f7c146101fc57600080fd5b806301ffc9a71461015657806306fdde031461017e57806307d88aad14610193578063081812fc146101be575b600080fd5b6101696101643660046113f5565b61031b565b60405190151581526020015b60405180910390f35b610186610400565b60405161017591906114ee565b6007546101a6906001600160a01b031681565b6040516001600160a01b039091168152602001610175565b6101a66101cc366004611461565b6004602052600090815260409020546001600160a01b031681565b6101fa6101f53660046113ae565b61048e565b005b61020560065481565b604051908152602001610175565b6101fa6102213660046112a7565b610591565b6101696102343660046113ae565b6107b1565b6101fa6102473660046112a7565b610b11565b61020561025a36600461142d565b610c56565b6101a661026d366004611461565b610dca565b610205610280366004611230565b610e34565b6008546101a6906001600160a01b031681565b610186610ea8565b6101fa6102ae366004611381565b610eb5565b6101fa6102c1366004611230565b610f3f565b6101fa6102d43660046112e7565b610fc8565b6101866102e7366004611461565b50606090565b6101696102fb36600461126f565b600560209081526000928352604080842090915290825290205460ff1681565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff00000000000000000000000000000000000000000000000000000000831614806103ae57507f80ac58cd000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b806103fa57507f5b5e139f000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b6000805461040d9061157e565b80601f01602080910402602001604051908101604052809291908181526020018280546104399061157e565b80156104865780601f1061045b57610100808354040283529160200191610486565b820191906000526020600020905b81548152906001019060200180831161046957829003601f168201915b505050505081565b6000818152600260205260409020546001600160a01b0316338114806104d757506001600160a01b038116600090815260056020908152604080832033845290915290205460ff165b6105285760405162461bcd60e51b815260206004820152600e60248201527f4e4f545f415554484f52495a454400000000000000000000000000000000000060448201526064015b60405180910390fd5b600082815260046020526040808220805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0387811691821790925591518593918516917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a4505050565b6000818152600260205260409020546001600160a01b038481169116146105fa5760405162461bcd60e51b815260206004820152600a60248201527f57524f4e475f46524f4d00000000000000000000000000000000000000000000604482015260640161051f565b6001600160a01b0382166106505760405162461bcd60e51b815260206004820152601160248201527f494e56414c49445f524543495049454e54000000000000000000000000000000604482015260640161051f565b336001600160a01b038416148061068a57506001600160a01b038316600090815260056020908152604080832033845290915290205460ff165b806106ab57506000818152600460205260409020546001600160a01b031633145b6106f75760405162461bcd60e51b815260206004820152600e60248201527f4e4f545f415554484f52495a4544000000000000000000000000000000000000604482015260640161051f565b6001600160a01b03808416600081815260036020908152604080832080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190559386168083528483208054600101905585835260028252848320805473ffffffffffffffffffffffffffffffffffffffff199081168317909155600490925284832080549092169091559251849392917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6040517f17ba7d850000000000000000000000000000000000000000000000000000000081527fb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8600482015260009081906001600160a01b038516906317ba7d859060240160206040518083038186803b15801561082e57600080fd5b505afa158015610842573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108669190611253565b6040517f309f01180000000000000000000000000000000000000000000000000000000081526001600160a01b038681166004830152602482018690523360448301529192509082169063309f01189060640160206040518083038186803b1580156108d157600080fd5b505afa1580156108e5573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061090991906113d9565b6109555760405162461bcd60e51b815260206004820152600c60248201527f6e6f7420656c696769626c650000000000000000000000000000000000000000604482015260640161051f565b6040517f01e6aa020000000000000000000000000000000000000000000000000000000081526001600160a01b038581166004830152602482018590523360448301528216906301e6aa029060640160206040518083038186803b1580156109bc57600080fd5b505afa1580156109d0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f491906113d9565b15610a415760405162461bcd60e51b815260206004820152600e60248201527f616c7265616479206d696e746564000000000000000000000000000000000000604482015260640161051f565b610a4d336006546110fd565b600160066000828254610a609190611541565b90915550506040517f620ee0420000000000000000000000000000000000000000000000000000000081526001600160a01b0385811660048301526024820185905233604483015282169063620ee04290606401602060405180830381600087803b158015610ace57600080fd5b505af1158015610ae2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b0691906113d9565b506001949350505050565b610b1c838383610591565b6001600160a01b0382163b1580610c0557506040517f150b7a02000000000000000000000000000000000000000000000000000000008082523360048301526001600160a01b03858116602484015260448301849052608060648401526000608484015290919084169063150b7a029060a401602060405180830381600087803b158015610ba957600080fd5b505af1158015610bbd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610be19190611411565b7fffffffff0000000000000000000000000000000000000000000000000000000016145b610c515760405162461bcd60e51b815260206004820152601060248201527f554e534146455f524543495049454e5400000000000000000000000000000000604482015260640161051f565b505050565b6040517f17ba7d850000000000000000000000000000000000000000000000000000000081527fb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc8600482015260009081906001600160a01b038616906317ba7d859060240160206040518083038186803b158015610cd357600080fd5b505afa158015610ce7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d0b9190611253565b90506000610d1884610dca565b6040517f1190b0a60000000000000000000000000000000000000000000000000000000081526001600160a01b038881166004830152602482018890528083166044830152919250600091841690631190b0a690606401604080518083038186803b158015610d8657600080fd5b505afa158015610d9a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dbe9190611479565b50979650505050505050565b6000818152600260205260409020546001600160a01b031680610e2f5760405162461bcd60e51b815260206004820152600a60248201527f4e4f545f4d494e54454400000000000000000000000000000000000000000000604482015260640161051f565b919050565b60006001600160a01b038216610e8c5760405162461bcd60e51b815260206004820152600c60248201527f5a45524f5f414444524553530000000000000000000000000000000000000000604482015260640161051f565b506001600160a01b031660009081526003602052604090205490565b6001805461040d9061157e565b3360008181526005602090815260408083206001600160a01b0387168085529083529281902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b6008546001600160a01b03163314610f995760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161051f565b6007805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0392909216919091179055565b610fd3858585610591565b6001600160a01b0384163b15806110aa57506040517f150b7a0200000000000000000000000000000000000000000000000000000000808252906001600160a01b0386169063150b7a02906110349033908a9089908990899060040161149d565b602060405180830381600087803b15801561104e57600080fd5b505af1158015611062573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110869190611411565b7fffffffff0000000000000000000000000000000000000000000000000000000016145b6110f65760405162461bcd60e51b815260206004820152601060248201527f554e534146455f524543495049454e5400000000000000000000000000000000604482015260640161051f565b5050505050565b6001600160a01b0382166111535760405162461bcd60e51b815260206004820152601160248201527f494e56414c49445f524543495049454e54000000000000000000000000000000604482015260640161051f565b6000818152600260205260409020546001600160a01b0316156111b85760405162461bcd60e51b815260206004820152600e60248201527f414c52454144595f4d494e544544000000000000000000000000000000000000604482015260640161051f565b6001600160a01b0382166000818152600360209081526040808320805460010190558483526002909152808220805473ffffffffffffffffffffffffffffffffffffffff19168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b600060208284031215611241578081fd5b813561124c816115d2565b9392505050565b600060208284031215611264578081fd5b815161124c816115d2565b60008060408385031215611281578081fd5b823561128c816115d2565b9150602083013561129c816115d2565b809150509250929050565b6000806000606084860312156112bb578081fd5b83356112c6816115d2565b925060208401356112d6816115d2565b929592945050506040919091013590565b6000806000806000608086880312156112fe578081fd5b8535611309816115d2565b94506020860135611319816115d2565b935060408601359250606086013567ffffffffffffffff8082111561133c578283fd5b818801915088601f83011261134f578283fd5b81358181111561135d578384fd5b89602082850101111561136e578384fd5b9699959850939650602001949392505050565b60008060408385031215611393578182fd5b823561139e816115d2565b9150602083013561129c816115ea565b600080604083850312156113c0578182fd5b82356113cb816115d2565b946020939093013593505050565b6000602082840312156113ea578081fd5b815161124c816115ea565b600060208284031215611406578081fd5b813561124c816115f8565b600060208284031215611422578081fd5b815161124c816115f8565b600080600060608486031215611441578283fd5b833561144c816115d2565b95602085013595506040909401359392505050565b600060208284031215611472578081fd5b5035919050565b6000806040838503121561148b578182fd5b82519150602083015161129c816115ea565b60006001600160a01b03808816835280871660208401525084604083015260806060830152826080830152828460a084013781830160a090810191909152601f909201601f19160101949350505050565b6000602080835283518082850152825b8181101561151a578581018301518582016040015282016114fe565b8181111561152b5783604083870101525b50601f01601f1916929092016040019392505050565b60008219821115611579577f4e487b710000000000000000000000000000000000000000000000000000000081526011600452602481fd5b500190565b600181811c9082168061159257607f821691505b602082108114156115cc577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b6001600160a01b03811681146115e757600080fd5b50565b80151581146115e757600080fd5b7fffffffff00000000000000000000000000000000000000000000000000000000811681146115e757600080fdfea2646970667358221220257cbfd2626a961e62ee82e2abb877b78efc3fc711c71b2ad6a0e7c74c9d6b8664736f6c63430008040033";

type FlexERC721ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlexERC721ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlexERC721__factory extends ContractFactory {
  constructor(...args: FlexERC721ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlexERC721> {
    return super.deploy(overrides || {}) as Promise<FlexERC721>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FlexERC721 {
    return super.attach(address) as FlexERC721;
  }
  override connect(signer: Signer): FlexERC721__factory {
    return super.connect(signer) as FlexERC721__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlexERC721Interface {
    return new utils.Interface(_abi) as FlexERC721Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlexERC721 {
    return new Contract(address, _abi, signerOrProvider) as FlexERC721;
  }
}
