/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  FlexVestingERC721,
  FlexVestingERC721Interface,
} from "../../../../contracts/flex/adatpers/FlexVestingERC721";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "address",
        name: "_vestAddr",
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
        indexed: false,
        internalType: "uint256",
        name: "_fromTokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_toTokenId",
        type: "uint256",
      },
    ],
    name: "BatchMetadataUpdate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "MetadataUpdate",
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
    inputs: [],
    name: "_owner",
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
    inputs: [],
    name: "baseURI",
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
    name: "contractURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "emitRefreshEvent",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getSvg",
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
        name: "to",
        type: "address",
      },
    ],
    name: "safeMint",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
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
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    name: "setBaseURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_vestAddress",
        type: "address",
      },
    ],
    name: "setVestAddress",
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
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
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
  {
    inputs: [],
    name: "vestAddress",
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
  "0x60c0604052601460808190527f68747470733a2f2f64616f7371756172652e666900000000000000000000000060a0908152620000409160079190620000db565b503480156200004e57600080fd5b506040516200353638038062003536833981016040819052620000719162000234565b8251839083906200008a906000906020850190620000db565b508051620000a0906001906020840190620000db565b505060088054336001600160a01b031991821617909155600980549091166001600160a01b0393909316929092179091555062000310915050565b828054620000e990620002bd565b90600052602060002090601f0160209004810192826200010d576000855562000158565b82601f106200012857805160ff191683800117855562000158565b8280016001018555821562000158579182015b82811115620001585782518255916020019190600101906200013b565b50620001669291506200016a565b5090565b5b808211156200016657600081556001016200016b565b600082601f83011262000192578081fd5b81516001600160401b0380821115620001af57620001af620002fa565b604051601f8301601f19908116603f01168101908282118183101715620001da57620001da620002fa565b81604052838152602092508683858801011115620001f6578485fd5b8491505b83821015620002195785820183015181830184015290820190620001fa565b838211156200022a57848385830101525b9695505050505050565b60008060006060848603121562000249578283fd5b83516001600160401b038082111562000260578485fd5b6200026e8783880162000181565b9450602086015191508082111562000284578384fd5b50620002938682870162000181565b604086015190935090506001600160a01b0381168114620002b2578182fd5b809150509250925092565b600181811c90821680620002d257607f821691505b60208210811415620002f457634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b61321680620003206000396000f3fe608060405234801561001057600080fd5b50600436106101815760003560e01c80636c0360eb116100d8578063b2bdfa7b1161008c578063cd7449a511610066578063cd7449a51461032e578063e8a3d48514610341578063e985e9c51461034957600080fd5b8063b2bdfa7b146102f5578063b88d4fde14610308578063c87b56dd1461031b57600080fd5b806395d89b41116100bd57806395d89b41146102c7578063a22cb465146102cf578063b0dc78fa146102e257600080fd5b80636c0360eb146102ac57806370a08231146102b457600080fd5b806323b872dd1161013a57806342842e0e1161011457806342842e0e1461027357806355f804b3146102865780636352211e1461029957600080fd5b806323b872dd1461022c5780632b1983231461023f57806340d097c31461025257600080fd5b806306fdde031161016b57806306fdde03146101d9578063081812fc146101ee578063095ea7b31461021757600080fd5b8062b5d3491461018657806301ffc9a7146101b6575b600080fd5b600954610199906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6101c96101c4366004611f2a565b610377565b60405190151581526020016101ad565b6101e1610414565b6040516101ad9190612bc2565b6101996101fc366004612009565b6004602052600090815260409020546001600160a01b031681565b61022a610225366004611e0c565b6104a2565b005b61022a61023a366004611d01565b6105a5565b61022a61024d366004612009565b6107a7565b610265610260366004611ca6565b610818565b6040519081526020016101ad565b61022a610281366004611d01565b61083f565b61022a610294366004611f62565b610953565b6101996102a7366004612009565b6109c4565b6101e1610a2e565b6102656102c2366004611ca6565b610a3b565b6101e1610aaf565b61022a6102dd366004611ddb565b610abc565b6101e16102f0366004612009565b610b46565b600854610199906001600160a01b031681565b61022a610316366004611d41565b610dc0565b6101e1610329366004612009565b610ec4565b61022a61033c366004611ca6565b611191565b6101e161121a565b6101c9610357366004611cc9565b600560209081526000928352604080842090915290825290205460ff1681565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000006001600160e01b0319831614806103da57507f80ac58cd000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b8061040e57507f5b5e139f000000000000000000000000000000000000000000000000000000006001600160e01b03198316145b92915050565b6000805461042190612d09565b80601f016020809104026020016040519081016040528092919081815260200182805461044d90612d09565b801561049a5780601f1061046f5761010080835404028352916020019161049a565b820191906000526020600020905b81548152906001019060200180831161047d57829003601f168201915b505050505081565b6000818152600260205260409020546001600160a01b0316338114806104eb57506001600160a01b038116600090815260056020908152604080832033845290915290205460ff165b61053c5760405162461bcd60e51b815260206004820152600e60248201527f4e4f545f415554484f52495a454400000000000000000000000000000000000060448201526064015b60405180910390fd5b600082815260046020526040808220805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0387811691821790925591518593918516917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a4505050565b6000818152600260205260409020546001600160a01b0384811691161461060e5760405162461bcd60e51b815260206004820152600a60248201527f57524f4e475f46524f4d000000000000000000000000000000000000000000006044820152606401610533565b6001600160a01b0382166106645760405162461bcd60e51b815260206004820152601160248201527f494e56414c49445f524543495049454e540000000000000000000000000000006044820152606401610533565b336001600160a01b038416148061069e57506001600160a01b038316600090815260056020908152604080832033845290915290205460ff165b806106bf57506000818152600460205260409020546001600160a01b031633145b61070b5760405162461bcd60e51b815260206004820152600e60248201527f4e4f545f415554484f52495a45440000000000000000000000000000000000006044820152606401610533565b6001600160a01b03808416600081815260036020908152604080832080546000190190559386168083528483208054600101905585835260028252848320805473ffffffffffffffffffffffffffffffffffffffff199081168317909155600490925284832080549092169091559251849392917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6040518181527ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce79060200160405180910390a1604080516001815260001960208201527f6bd5c950a8d8df17f772f5af37cb3655737899cbf903264b9795592da439661c910160405180910390a150565b6000610828600680546001019055565b600061083360065490565b905061040e838261126a565b61084a8383836105a5565b6001600160a01b0382163b15806109025750604051630a85bd0160e11b8082523360048301526001600160a01b03858116602484015260448301849052608060648401526000608484015290919084169063150b7a029060a401602060405180830381600087803b1580156108be57600080fd5b505af11580156108d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108f69190611f46565b6001600160e01b031916145b61094e5760405162461bcd60e51b815260206004820152601060248201527f554e534146455f524543495049454e54000000000000000000000000000000006044820152606401610533565b505050565b6008546001600160a01b031633146109ad5760405162461bcd60e51b815260206004820152600b60248201527f6163636573732064656e790000000000000000000000000000000000000000006044820152606401610533565b80516109c09060079060208401906119ef565b5050565b6000818152600260205260409020546001600160a01b031680610a295760405162461bcd60e51b815260206004820152600a60248201527f4e4f545f4d494e544544000000000000000000000000000000000000000000006044820152606401610533565b919050565b6007805461042190612d09565b60006001600160a01b038216610a935760405162461bcd60e51b815260206004820152600c60248201527f5a45524f5f4144445245535300000000000000000000000000000000000000006044820152606401610533565b506001600160a01b031660009081526003602052604090205490565b6001805461042190612d09565b3360008181526005602090815260408083206001600160a01b0387168085529083529281902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b6009546040517f2c29e196000000000000000000000000000000000000000000000000000000008152306004820152602481018390526060916001600160a01b0316906000908290632c29e1969060440160206040518083038186803b158015610baf57600080fd5b505afa158015610bc3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610be79190612021565b6040517f51def556000000000000000000000000000000000000000000000000000000008152600481018290529091506000906001600160a01b038416906351def5569060240160006040518083038186803b158015610c4657600080fd5b505afa158015610c5a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610c829190810190611e37565b6040517f7a4334e2000000000000000000000000000000000000000000000000000000008152306004820152602481018d9052909750600096508695508594506001600160a01b038a169350637a4334e29250604401905060606040518083038186803b158015610cf257600080fd5b505afa158015610d06573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d2a9190612039565b925092509250610db484608001516001600160a01b03166395d89b416040518163ffffffff1660e01b815260040160006040518083038186803b158015610d7057600080fd5b505afa158015610d84573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610dac9190810190611fd6565b848484611375565b98975050505050505050565b610dcb8585856105a5565b6001600160a01b0384163b1580610e715750604051630a85bd0160e11b808252906001600160a01b0386169063150b7a0290610e139033908a90899089908990600401612b71565b602060405180830381600087803b158015610e2d57600080fd5b505af1158015610e41573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e659190611f46565b6001600160e01b031916145b610ebd5760405162461bcd60e51b815260206004820152601060248201527f554e534146455f524543495049454e54000000000000000000000000000000006044820152606401610533565b5050505050565b6009546060906001600160a01b0316610f1f5760405162461bcd60e51b815260206004820152601460248201527f696e76616c6964207665737420616464726573730000000000000000000000006044820152606401610533565b6009546040517f2c29e196000000000000000000000000000000000000000000000000000000008152306004820152602481018490526001600160a01b03909116906000908290632c29e1969060440160206040518083038186803b158015610f8757600080fd5b505afa158015610f9b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fbf9190612021565b6040517f51def556000000000000000000000000000000000000000000000000000000008152600481018290529091506000906001600160a01b038416906351def5569060240160006040518083038186803b15801561101e57600080fd5b505afa158015611032573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261105a9190810190611e37565b6040517f7a4334e2000000000000000000000000000000000000000000000000000000008152306004820152602481018d9052909750600096508695508594506001600160a01b038a169350637a4334e29250604401905060606040518083038186803b1580156110ca57600080fd5b505afa1580156110de573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111029190612039565b925092509250610db4846020015185608001516001600160a01b03166395d89b416040518163ffffffff1660e01b815260040160006040518083038186803b15801561114d57600080fd5b505afa158015611161573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526111899190810190611fd6565b8585856114e2565b6008546001600160a01b031633146111eb5760405162461bcd60e51b815260206004820152600b60248201527f6163636573732064656e790000000000000000000000000000000000000000006044820152606401610533565b6009805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0392909216919091179055565b60606000604051806102a0016040528061027d8152602001612de461027d913990506112458161159d565b6040516020016112559190612a66565b60405160208183030381529060405291505090565b6112748282611766565b6001600160a01b0382163b15806113295750604051630a85bd0160e11b80825233600483015260006024830181905260448301849052608060648401526084830152906001600160a01b0384169063150b7a029060a401602060405180830381600087803b1580156112e557600080fd5b505af11580156112f9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061131d9190611f46565b6001600160e01b031916145b6109c05760405162461bcd60e51b815260206004820152601060248201527f554e534146455f524543495049454e54000000000000000000000000000000006044820152606401610533565b6060600061138284611899565b9050600081876040516020016113999291906129e5565b604051602081830303815290604052905060006113b587611899565b6040516020016113c59190612853565b604051602081830303815290604052905060006113e186611899565b90506000818a6040516020016113f8929190612aab565b604051602081830303815290604052905060008a60405160200161141c9190612812565b60408051601f1981840301815261016083019091526101408083529092506130a16020830139965086856040516020016114579291906125e8565b6040516020818303038152906040529650868460405160200161147b92919061239c565b6040516020818303038152906040529650868260405160200161149f9291906126fd565b604051602081830303815290604052965086816040516020016114c3929190612066565b6040516020818303038152906040529650505050505050949350505050565b606060006114f286868686611375565b905060006114ff8261159d565b60405160200161150f9190612b2c565b60405160208183030381529060405290506000876040516020016115339190612894565b6040516020818303038152906040529050611570818a8460405160200161155c939291906128d5565b60405160208183030381529060405261159d565b6040516020016115809190612a66565b604051602081830303815290604052935050505095945050505050565b8051606090806115bd575050604080516020810190915260008152919050565b600060036115cc836002612c77565b6115d69190612c8f565b6115e1906004612ca3565b905060006115f0826020612c77565b67ffffffffffffffff81111561161657634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611640576020820181803683370190505b5090506000604051806060016040528060408152602001613061604091399050600181016020830160005b868110156116cc576003818a01810151603f601282901c8116860151600c83901c8216870151600684901c831688015192909316870151600891821b60ff94851601821b92841692909201901b91160160e01b83526004909201910161166b565b5060038606600181146116e6576002811461173057611758565b7f3d3d0000000000000000000000000000000000000000000000000000000000007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe830152611758565b7f3d000000000000000000000000000000000000000000000000000000000000006000198301525b505050918152949350505050565b6001600160a01b0382166117bc5760405162461bcd60e51b815260206004820152601160248201527f494e56414c49445f524543495049454e540000000000000000000000000000006044820152606401610533565b6000818152600260205260409020546001600160a01b0316156118215760405162461bcd60e51b815260206004820152600e60248201527f414c52454144595f4d494e5445440000000000000000000000000000000000006044820152606401610533565b6001600160a01b0382166000818152600360209081526040808320805460010190558483526002909152808220805473ffffffffffffffffffffffffffffffffffffffff19168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b6060816118d957505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561190357806118ed81612d44565b91506118fc9050600a83612c8f565b91506118dd565b60008167ffffffffffffffff81111561192c57634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611956576020820181803683370190505b5090505b84156119e75761196b600183612cc2565b9150611978600a86612d5f565b611983906030612c77565b60f81b8183815181106119a657634e487b7160e01b600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506119e0600a86612c8f565b945061195a565b949350505050565b8280546119fb90612d09565b90600052602060002090601f016020900481019282611a1d5760008555611a63565b82601f10611a3657805160ff1916838001178555611a63565b82800160010185558215611a63579182015b82811115611a63578251825591602001919060010190611a48565b50611a6f929150611a73565b5090565b5b80821115611a6f5760008155600101611a74565b8051610a2981612db5565b600082601f830112611aa3578081fd5b8151611ab6611ab182612c4f565b612c1e565b818152846020838601011115611aca578283fd5b6119e7826020830160208701612cd9565b600060808284031215611aec578081fd5b6040516080810181811067ffffffffffffffff82111715611b0f57611b0f612d9f565b604052905080611b1e83611c92565b8152611b2c60208401611c92565b6020820152611b3d60408401611c92565b6040820152611b4e60608401611c92565b60608201525092915050565b600060a08284031215611b6b578081fd5b60405160a0810167ffffffffffffffff8282108183111715611b8f57611b8f612d9f565b816040528293508451915080821115611ba757600080fd5b611bb386838701611a93565b83526020850151915080821115611bc957600080fd5b50611bd685828601611a93565b6020830152506040830151611bea81612db5565b6040820152611bfb60608401611a88565b6060820152611c0c60808401611a88565b60808201525092915050565b600060408284031215611c29578081fd5b6040516040810181811067ffffffffffffffff82111715611c4c57611c4c612d9f565b80604052508091508251611c5f81612db5565b8152602092830151920191909152919050565b80516fffffffffffffffffffffffffffffffff81168114610a2957600080fd5b805163ffffffff81168114610a2957600080fd5b600060208284031215611cb7578081fd5b8135611cc281612db5565b9392505050565b60008060408385031215611cdb578081fd5b8235611ce681612db5565b91506020830135611cf681612db5565b809150509250929050565b600080600060608486031215611d15578081fd5b8335611d2081612db5565b92506020840135611d3081612db5565b929592945050506040919091013590565b600080600080600060808688031215611d58578081fd5b8535611d6381612db5565b94506020860135611d7381612db5565b935060408601359250606086013567ffffffffffffffff80821115611d96578283fd5b818801915088601f830112611da9578283fd5b813581811115611db7578384fd5b896020828501011115611dc8578384fd5b9699959850939650602001949392505050565b60008060408385031215611ded578182fd5b8235611df881612db5565b915060208301358015158114611cf6578182fd5b60008060408385031215611e1e578182fd5b8235611e2981612db5565b946020939093013593505050565b60008060008060008060008789036101a0811215611e53578586fd5b88519750611e6360208a01611c72565b96506040890151955060607fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa082011215611e9b578283fd5b50611ea4612bf5565b611eb060608a01611c92565b8152611ebe60808a01611c72565b6020820152611ecf60a08a01611c72565b60408201529350611ee38960c08a01611adb565b9250611ef3896101408a01611c18565b915061018088015167ffffffffffffffff811115611f0f578182fd5b611f1b8a828b01611b5a565b91505092959891949750929550565b600060208284031215611f3b578081fd5b8135611cc281612dcd565b600060208284031215611f57578081fd5b8151611cc281612dcd565b600060208284031215611f73578081fd5b813567ffffffffffffffff811115611f89578182fd5b8201601f81018413611f99578182fd5b8035611fa7611ab182612c4f565b818152856020838501011115611fbb578384fd5b81602084016020830137908101602001929092525092915050565b600060208284031215611fe7578081fd5b815167ffffffffffffffff811115611ffd578182fd5b6119e784828501611a93565b60006020828403121561201a578081fd5b5035919050565b600060208284031215612032578081fd5b5051919050565b60008060006060848603121561204d578081fd5b8351925060208401519150604084015190509250925092565b60008351612078818460208801612cd9565b83519083019061208c818360208801612cd9565b7f3c2f747370616e3e3c2f746578743e3c696d61676520783d223336302220793d91019081527f223339392220687265663d2268747470733a2f2f64616f7371756172652d696e60208201527f63756261746f722e73332e61702d736f757468656173742d312e616d617a6f6e60408201527f6177732e636f6d2f696e63756261746f722d6c6f676f2e73766722206865696760608201527f68743d22313030222077696474683d22313030222f3e3c696d6167652068726560808201527f663d2268747470733a2f2f64616f7371756172652d696e63756261746f722e7360a08201527f332e61702d736f757468656173742d312e616d617a6f6e6177732e636f6d2f7660c08201527f657374696e672d6c6f676f2e73766722206865696768743d223538222077696460e08201527f68743d2235382220783d2233382220793d22343022202f3e3c646566733e3c6c6101008201527f696e6561724772616469656e742069643d227061696e74305f6c696e6561725f6101208201527f31303638335f323231313836222078313d223235302e343434222079313d222d6101408201527f3130342e373031222078323d222d36362e39353137222079323d223530302e366101608201527f383522206772616469656e74556e6974733d227573657253706163654f6e55736101808201527f65223e3c73746f702073746f702d636f6c6f723d2223464441453846222f3e3c6101a08201527f73746f70206f66667365743d2231222073746f702d636f6c6f723d22234644316101c08201527f433638222f3e3c2f6c696e6561724772616469656e743e3c636c6970506174686101e08201527f2069643d22636c6970305f31303638335f323231313836223e3c7265637420776102008201527f696474683d22353622206865696768743d223536222066696c6c3d22776869746102208201527f6522207472616e73666f726d3d227472616e736c61746528343020343029222f6102408201527f3e3c2f636c6970506174683e3c2f646566733e3c2f7376673e0000000000000061026082015261027901949350505050565b600083516123ae818460208801612cd9565b8351908301906123c2818360208801612cd9565b7f3c2f747370616e3e3c2f746578743e3c746578742066696c6c3d22233145323291019081527f33302220786d6c3a73706163653d22707265736572766522207374796c653d2260208201527f77686974652d73706163653a207072652220666f6e742d66616d696c793d224960408201527f6e7465722220666f6e742d73697a653d2231322220666f6e742d7374796c653d60608201527f226974616c69632220666f6e742d7765696768743d2235303022206c6574746560808201527f722d73706163696e673d2230656d223e3c747370616e20783d223238392e363060a08201527f392220793d223434362e333634223e504f5745524544262331303b3c2f74737060c08201527f616e3e3c747370616e20783d223333322e3933342220793d223435382e33363460e08201527f223e42593c2f747370616e3e3c2f746578743e3c746578742066696c6c3d22236101008201527f3145323233302220786d6c3a73706163653d22707265736572766522207374796101208201527f6c653d2277686974652d73706163653a207072652220666f6e742d66616d696c6101408201527f793d22496e7465722220666f6e742d73697a653d22313622206c65747465722d6101608201527f73706163696e673d2230656d223e3c747370616e20783d2234302220793d22326101808201527f35352e333138223e0000000000000000000000000000000000000000000000006101a08201526101a801949350505050565b600083516125fa818460208801612cd9565b83519083019061260e818360208801612cd9565b7f3c2f747370616e3e3c2f746578743e3c746578742066696c6c3d22233145323291019081527f33302220786d6c3a73706163653d22707265736572766522207374796c653d2260208201527f77686974652d73706163653a207072652220666f6e742d66616d696c793d224960408201527f6e7465722220666f6e742d73697a653d2236342220666f6e742d77656967687460608201527f3d22626f6c6422206c65747465722d73706163696e673d2230656d223e3c747360808201527f70616e20783d2234302220793d223138312e373733223e00000000000000000060a082015260b701949350505050565b6000835161270f818460208801612cd9565b835190830190612723818360208801612cd9565b7f3c2f747370616e3e3c2f746578743e3c746578742066696c6c3d22233145323291019081527f33302220786d6c3a73706163653d22707265736572766522207374796c653d2260208201527f77686974652d73706163653a207072652220666f6e742d66616d696c793d224960408201527f6e7465722220666f6e742d73697a653d2233322220666f6e742d77656967687460608201527f3d22626f6c6422206c65747465722d73706163696e673d2230656d223e3c747360808201527f70616e20783d2234302220793d223331302e363336223e00000000000000000060a082015260b701949350505050565b60008251612824818460208701612cd9565b7f2056455354494e47000000000000000000000000000000000000000000000000920191825250600801919050565b60008251612865818460208701612cd9565b7f2500000000000000000000000000000000000000000000000000000000000000920191825250600101919050565b600082516128a6818460208701612cd9565b7f2056657374696e67000000000000000000000000000000000000000000000000920191825250600801919050565b7f7b226e616d65223a22000000000000000000000000000000000000000000000081526000845161290d816009850160208901612cd9565b7f222c20226465736372697074696f6e223a220000000000000000000000000000600991840191820152845161294a81601b840160208901612cd9565b7f222c2022696d616765223a202200000000000000000000000000000000000000601b92909101918201527f646174613a696d6167652f7376672b786d6c3b6261736536342c000000000000602882015283516129ae816042840160208801612cd9565b7f227d0000000000000000000000000000000000000000000000000000000000006042929091019182015260440195945050505050565b7f52454d41494e494e473a20000000000000000000000000000000000000000000815260008351612a1d81600b850160208801612cd9565b7f2000000000000000000000000000000000000000000000000000000000000000600b918401918201528351612a5a81600c840160208801612cd9565b01600c01949350505050565b7f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c000000815260008251612a9e81601d850160208701612cd9565b91909101601d0192915050565b7f544f54414c3a2000000000000000000000000000000000000000000000000000815260008351612ae3816007850160208801612cd9565b7f20000000000000000000000000000000000000000000000000000000000000006007918401918201528351612b20816008840160208801612cd9565b01600801949350505050565b7f646174613a696d6167652f7376672b786d6c3b6261736536342c000000000000815260008251612b6481601a850160208701612cd9565b91909101601a0192915050565b60006001600160a01b03808816835280871660208401525084604083015260806060830152826080830152828460a084013781830160a090810191909152601f909201601f19160101949350505050565b6020815260008251806020840152612be1816040850160208701612cd9565b601f01601f19169190910160400192915050565b6040516060810167ffffffffffffffff81118282101715612c1857612c18612d9f565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715612c4757612c47612d9f565b604052919050565b600067ffffffffffffffff821115612c6957612c69612d9f565b50601f01601f191660200190565b60008219821115612c8a57612c8a612d73565b500190565b600082612c9e57612c9e612d89565b500490565b6000816000190483118215151615612cbd57612cbd612d73565b500290565b600082821015612cd457612cd4612d73565b500390565b60005b83811015612cf4578181015183820152602001612cdc565b83811115612d03576000848401525b50505050565b600181811c90821680612d1d57607f821691505b60208210811415612d3e57634e487b7160e01b600052602260045260246000fd5b50919050565b6000600019821415612d5857612d58612d73565b5060010190565b600082612d6e57612d6e612d89565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612dca57600080fd5b50565b6001600160e01b031981168114612dca57600080fdfe7b226e616d65223a202244414f537175617265204d616e75616c2056657374696e67222c226465736372697074696f6e223a2244414f537175617265204d616e75616c2056657374696e6720436f6c6c656374696f6e20e698afe4b880e4b8aae4b8bae68980e69c89e59ca82044414f5371756172652056657374696e672041505020e4b88ae6898be58aa8e5889be5bbbae79a842056657374696e6720e9a1b9e79baee585b1e794a8e79a84204e465420436f6c6c656374696f6ee38082e6af8fe4b880e4b8aae6898be58aa8e5889be5bbbae79a8456657374696e6720e9a1b9e79baee58886e4baab204e465420436f6c6c656374696f6e20e4b8ade79a84e4b880e5ae9a20546f6b656e20494420e58cbae997b4e38082e794b1e4ba8ee6af8fe4b880e4b8aa20e6898be58aa82056657374696e6720e9a1b9e79baee79a84e59bbee78987e38081e5908de7a7b0e38081e4bb8be7bb8de4b88de5908cefbc8ce59ba0e6ada4e4bda0e58fafe4bba5e59ca8e8bf99e4b8aa20436f6c6c656374696f6e20e4b8ade696b9e4bebfe59cb0e8af86e588abe5ae83e4bbace38082e5a682e69e9ce4bda0e68ba5e69c89e4bbbbe4bd95e4b880e5bca0e69c9fe4b8ade79a84204e46542ce4bda0e58fafe4bba5e8aebfe997ae2044414f53717561726520496e63756261746f7220e69fa5e79c8be5b9b6e9a286e58f9620546f6b656ee38082222c22696d616765223a22697066733a2f2f626166796265696862737077643768716d6b6162713578706a6e616171716c376d6964703234776c6d7371663367743769346c62616c626a73376d222c2265787465726e616c5f6c696e6b223a2268747470733a2f2f64616f7371756172652e6669227d4142434445464748494a4b4c4d4e4f505152535455565758595a6162636465666768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2f3c7376672077696474683d2235303022206865696768743d22353030222076696577426f783d223020302035303020353030222066696c6c3d226e6f6e652220786d6c6e733d22687474703a2f2f7777772e77332e6f72672f323030302f737667223e3c726563742077696474683d2235303022206865696768743d22353030222066696c6c3d2275726c28237061696e74305f6c696e6561725f31303638335f32323131383629222f3e3c746578742066696c6c3d22233145323233302220786d6c3a73706163653d22707265736572766522207374796c653d2277686974652d73706163653a207072652220666f6e742d66616d696c793d22496e7465722220666f6e742d73697a653d22313622206c65747465722d73706163696e673d2230656d223e3c747370616e20783d2234302220793d223232382e333138223ea2646970667358221220c57c7509b16aaf4c4f99a5e424ef883c1c73a8e31f5f2f3b514e9586fb97c6f064736f6c63430008040033";

type FlexVestingERC721ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlexVestingERC721ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlexVestingERC721__factory extends ContractFactory {
  constructor(...args: FlexVestingERC721ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    name: PromiseOrValue<string>,
    symbol: PromiseOrValue<string>,
    _vestAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlexVestingERC721> {
    return super.deploy(
      name,
      symbol,
      _vestAddr,
      overrides || {}
    ) as Promise<FlexVestingERC721>;
  }
  override getDeployTransaction(
    name: PromiseOrValue<string>,
    symbol: PromiseOrValue<string>,
    _vestAddr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(name, symbol, _vestAddr, overrides || {});
  }
  override attach(address: string): FlexVestingERC721 {
    return super.attach(address) as FlexVestingERC721;
  }
  override connect(signer: Signer): FlexVestingERC721__factory {
    return super.connect(signer) as FlexVestingERC721__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlexVestingERC721Interface {
    return new utils.Interface(_abi) as FlexVestingERC721Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlexVestingERC721 {
    return new Contract(address, _abi, signerOrProvider) as FlexVestingERC721;
  }
}
