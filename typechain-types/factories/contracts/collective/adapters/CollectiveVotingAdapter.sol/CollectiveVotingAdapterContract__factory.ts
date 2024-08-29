/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  CollectiveVotingAdapterContract,
  CollectiveVotingAdapterContractInterface,
} from "../../../../../contracts/collective/adapters/CollectiveVotingAdapter.sol/CollectiveVotingAdapterContract";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "daoAddr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "votingTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "voteStartTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "voteStopTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "voteValue",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nbYes",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nbNo",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "currentQuorum",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "currentSupport",
        type: "uint256",
      },
    ],
    name: "SubmitVote",
    type: "event",
  },
  {
    inputs: [],
    name: "ADAPTER_NAME",
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
        internalType: "address",
        name: "voterAddr",
        type: "address",
      },
    ],
    name: "checkIfVoted",
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
    name: "getAdapterName",
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
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
    ],
    name: "getAllGovernorWeight",
    outputs: [
      {
        internalType: "uint128",
        name: "",
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
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "getAllGovernorWeightByProposalId",
    outputs: [
      {
        internalType: "uint128",
        name: "",
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
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "getSenderAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "pure",
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
    ],
    name: "getVotingWeight",
    outputs: [
      {
        internalType: "uint128",
        name: "",
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
        name: "amount",
        type: "uint256",
      },
    ],
    name: "getVotingWeightByDepositAmount",
    outputs: [
      {
        internalType: "uint128",
        name: "",
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
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "startNewVotingForProposal",
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
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "voteValue",
        type: "uint256",
      },
    ],
    name: "submitVote",
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
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "voteResult",
    outputs: [
      {
        internalType: "enum ICollectiveVoting.VotingState",
        name: "state",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "nbYes",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nbNo",
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
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "voteWeights",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
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
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "votes",
    outputs: [
      {
        internalType: "uint256",
        name: "nbYes",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nbNo",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startingTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stopTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50612eac806100206000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806376225e731161008c5780638ecf7720116100665780638ecf77201461029757806391d2fd53146102aa578063966917d0146102ec578063f2b95da01461031957600080fd5b806376225e73146102265780637fd3cd8b1461024857806387b9e9591461028457600080fd5b80632b0974d0116100c85780632b0974d0146101b7578063325b72f2146101cc57806362c088e7146101df578063669fd0ca1461021357600080fd5b80631db5ade8146100ef5780631f86f5b31461015257806324a2cceb14610194575b600080fd5b61012d6100fd3660046128ab565b60016020818152600093845260408085209091529183529120805491810154600282015460039092015490919084565b6040805194855260208501939093529183015260608201526080015b60405180910390f35b60408051808201909152601881527f436f6c6c656374697665566f74696e67436f6e7472616374000000000000000060208201525b6040516101499190612cb8565b6101a76101a2366004612b39565b61032c565b6040519015158152602001610149565b6101ca6101c5366004612b4d565b61037b565b005b6101ca6101da366004612bd1565b61053d565b6101f26101ed366004612b27565b610c1b565b6040516fffffffffffffffffffffffffffffffff9091168152602001610149565b6101f2610221366004612b27565b610c30565b610239610234366004612b27565b610c45565b60405161014993929190612c90565b6101876040518060400160405280601881526020017f436f6c6c656374697665566f74696e67436f6e7472616374000000000000000081525081565b6101f2610292366004612a2c565b6111f1565b6101a76102a5366004612a2c565b6111fd565b6101f26102b83660046128d6565b600060208181529381526040808220855292815282812090935282529020546fffffffffffffffffffffffffffffffff1681565b6103016102fa366004612a64565b9392505050565b6040516001600160a01b039091168152602001610149565b6101f2610327366004612a10565b61127a565b6001600160a01b03808416600090815260016020908152604080832086845282528083209385168352600484019091528120549091906103705760009150506102fa565b506001949350505050565b6040517f68c18beb00000000000000000000000000000000000000000000000000000000815233600482015284906001600160a01b038216906368c18beb9060240160206040518083038186803b1580156103d557600080fd5b505afa1580156103e9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061040d91906129cb565b8061041c575061041c81611286565b61046d5760405162461bcd60e51b815260206004820152600b60248201527f6f6e6c794164617074657200000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6001600160a01b0385166000818152600160209081526040808320888452909152908190204260028201559051634941d71d60e11b81527f9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc6004820152909190639283ae3a9060240160206040518083038186803b1580156104ee57600080fd5b505afa158015610502573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105269190612c54565b6105309042612d70565b6003909101555050505050565b8261054881336114a6565b83600061055482611500565b6040517ff941f6910000000000000000000000000000000000000000000000000000000081529091506001600160a01b0387169063f941f6919061059f908890600190600401612c6c565b60206040518083038186803b1580156105b757600080fd5b505afa1580156105cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ef91906129cb565b6106615760405162461bcd60e51b815260206004820152602760248201527f7468652070726f706f73616c20686173206e6f74206265656e2073706f6e736f60448201527f72656420796574000000000000000000000000000000000000000000000000006064820152608401610464565b6040517ff941f6910000000000000000000000000000000000000000000000000000000081526001600160a01b0387169063f941f691906106a9908890600290600401612c6c565b60206040518083038186803b1580156106c157600080fd5b505afa1580156106d5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106f991906129cb565b1561076c5760405162461bcd60e51b815260206004820152602760248201527f7468652070726f706f73616c2068617320616c7265616479206265656e20707260448201527f6f636573736564000000000000000000000000000000000000000000000000006064820152608401610464565b60038410801561077c5750600084115b6107ee5760405162461bcd60e51b815260206004820152602b60248201527f6f6e6c79207965732028312920616e64206e6f202832292061726520706f737360448201527f69626c652076616c7565730000000000000000000000000000000000000000006064820152608401610464565b6001600160a01b0386166000908152600160209081526040808320888452909152902060028101546108885760405162461bcd60e51b815260206004820152603260248201527f746869732070726f706f73616c496420686173206e6f20766f746520676f696e60448201527f67206f6e20617420746865206d6f6d656e7400000000000000000000000000006064820152608401610464565b806003015442106108db5760405162461bcd60e51b815260206004820152601660248201527f766f74652068617320616c726561647920656e646564000000000000000000006044820152606401610464565b6040517fc89bb8ba0000000000000000000000000000000000000000000000000000000081523360048201526000906001600160a01b0389169063c89bb8ba9060240160206040518083038186803b15801561093657600080fd5b505afa15801561094a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061096e919061288f565b6001600160a01b0381166000908152600484016020526040902054909150156109d95760405162461bcd60e51b815260206004820152601860248201527f6d656d6265722068617320616c726561647920766f74656400000000000000006044820152606401610464565b60006109e589336117cb565b6001600160a01b038a81166000908152602081815260408083208d84528252808320338452825280832080547fffffffffffffffffffffffffffffffff00000000000000000000000000000000166fffffffffffffffffffffffffffffffff871617905592861682526004870190522088905590506001871415610a9457806fffffffffffffffffffffffffffffffff16836000016000828254610a899190612d70565b90915550610ac99050565b8660021415610ac957806fffffffffffffffffffffffffffffffff16836001016000828254610ac39190612d70565b90915550505b60018301548354600091610adc91612d70565b15610b0e5760018401548454610af29190612d70565b8454610aff906064612da8565b610b099190612d88565b610b11565b60005b90506000610b1e8b611e1e565b60018601548654610b2f9190612d70565b610b3a906064612da8565b610b449190612d88565b90507f702c2a29993fe1e5ce4c366928ffc1d53e245b20536bf8192399abb82b66c7108b8b4288600201548960030154338f8c600001548d600101548b8b604051610bfc9b9a999897969594939291906000610160820190506001600160a01b03808e1683528c60208401528b60408401528a606084015289608084015280891660a0840152508660c08301528560e08301528461010083015283610120830152826101408301529c9b505050505050505050505050565b60405180910390a15050505050610c138282611ffa565b505050505050565b6000610c278383612005565b90505b92915050565b600080610c3d848461221c565b949350505050565b6001600160a01b03821660009081526001602090815260408083208484529091528120600281015482918291610c86576000806000935093509350506111ea565b8060030154421015610ca3576004600080935093509350506111ea565b604051634941d71d60e11b81527fe815a3c082eed7f7f7baab546f11a8718682c0eb3017b099ddc301a92f6673e360048201526000906001600160a01b03881690639283ae3a9060240160206040518083038186803b158015610d0557600080fd5b505afa158015610d19573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d3d9190612c54565b604051634941d71d60e11b81527f730faccfe82f70711a34ce5202c6e1b1f79f421c16fcef745a9d92d06a7c0d4c60048201529091506000906001600160a01b03891690639283ae3a9060240160206040518083038186803b158015610da257600080fd5b505afa158015610db6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dda9190612c54565b90506000610de78961127a565b905081610ee357604051634941d71d60e11b81527f0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e760048201526000906064906001600160a01b038c1690639283ae3a9060240160206040518083038186803b158015610e5357600080fd5b505afa158015610e67573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e8b9190612c54565b610ea7906fffffffffffffffffffffffffffffffff8516612da8565b610eb19190612d88565b6001860154865491925001818111610ee0576003866000015487600101549850985098505050505050506111ea565b50505b8160011415610fbd5760018401548454600091610eff91612d70565b604051634941d71d60e11b81527f0324de13a5a6e302ddb95a9fdf81cc736fc8acee2abe558970daac27395904e760048201529091506001600160a01b038b1690639283ae3a9060240160206040518083038186803b158015610f6157600080fd5b505afa158015610f75573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f999190612c54565b8111610fbb5760038560000154866001015497509750975050505050506111ea565b505b826110e25760018401548454600091610fd591612d70565b604051634941d71d60e11b81527fb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df3260048201529091506000906064906001600160a01b038d1690639283ae3a9060240160206040518083038186803b15801561103d57600080fd5b505afa158015611051573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110759190612c54565b61107f9084612da8565b6110899190612d88565b90508015801561109857508554155b156110ba576001866000015487600101549850985098505050505050506111ea565b855481106110df576003866000015487600101549850985098505050505050506111ea565b50505b82600114156111d3576000846001015485600001541015611104576000611115565b600185015485546111159190612de5565b604051634941d71d60e11b81527fb4c601c38beae7eebb719eda3438f59fcbfd4c6dd7d38c00665b6fd5b432df3260048201529091506001600160a01b038b1690639283ae3a9060240160206040518083038186803b15801561117757600080fd5b505afa15801561118b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111af9190612c54565b81116111d15760038560000154866001015497509750975050505050506111ea565b505b600284600001548560010154965096509650505050505b9250925092565b6000610c2783836117cb565b60405163288c314960e21b81526001600160a01b0382811660048301526000919084169063a230c5249060240160206040518083038186803b15801561124257600080fd5b505afa158015611256573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c2791906129cb565b6000806102fa83612561565b600080826001600160a01b031663c19d93fb6040518163ffffffff1660e01b815260040160206040518083038186803b1580156112c257600080fd5b505afa1580156112d6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112fa9190612c05565b600181111561131957634e487b7160e01b600052602160045260246000fd5b148015610c2a5750816001600160a01b031663c67143666040518163ffffffff1660e01b815260040160206040518083038186803b15801561135a57600080fd5b505afa15801561136e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113929190612c54565b1580611410575060405163288c314960e21b81523360048201526001600160a01b0383169063a230c5249060240160206040518083038186803b1580156113d857600080fd5b505afa1580156113ec573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061141091906129cb565b80610c2a57506040517f68c18beb0000000000000000000000000000000000000000000000000000000081523360048201526001600160a01b038316906368c18beb9060240160206040518083038186803b15801561146e57600080fd5b505afa158015611482573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c2a91906129cb565b6114b082826111fd565b6114fc5760405162461bcd60e51b815260206004820152600c60248201527f6f6e6c79476f7665726e6f7200000000000000000000000000000000000000006044820152606401610464565b5050565b6040805160808101825260008082526020820181905291810182905260608101919091525a81600001818152505043826001600160a01b031663b21634826040518163ffffffff1660e01b815260040160206040518083038186803b15801561156857600080fd5b505afa15801561157c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115a09190612c54565b14156115ee5760405162461bcd60e51b815260206004820152601060248201527f7265656e7472616e6379206775617264000000000000000000000000000000006044820152606401610464565b816001600160a01b03166310fdb0a26040518163ffffffff1660e01b8152600401600060405180830381600087803b15801561162957600080fd5b505af115801561163d573d6000803e3d6000fd5b50506040517f72c6838f0000000000000000000000000000000000000000000000000000000081527f1f2fd42ad6a6cacd573c4b212beb7a4e2499ad45d742a65337097f130e71daff6004820152600092506001600160a01b03851691506372c6838f9060240160206040518083038186803b1580156116bc57600080fd5b505afa1580156116d0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116f4919061288f565b90506001600160a01b03811661171057600060208301526117c5565b6001600160a01b038181166060840181905283516040517f43a8a3f1000000000000000000000000000000000000000000000000000000008152928616600484015260248301526000918291906343a8a3f190604401604080518083038186803b15801561177d57600080fd5b505afa158015611791573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117b591906129e5565b9015156020860152604085015250505b50919050565b604051634941d71d60e11b81527feee23dc9ab95b6666db01c2b6cae6a5ef706099a25926e21e0a2e043fe885604600482015260009081906001600160a01b03851690639283ae3a9060240160206040518083038186803b15801561182f57600080fd5b505afa158015611843573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118679190612c54565b604051634941d71d60e11b81527fd093d4a34a12a221b19c0a6689d5449f1346aa769d15cca4e9782c36fda9339a60048201529091506000906001600160a01b03861690639283ae3a9060240160206040518083038186803b1580156118cc57600080fd5b505afa1580156118e0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119049190612c54565b6040517f17ba7d850000000000000000000000000000000000000000000000000000000081527f8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea60048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b15801561198257600080fd5b505afa158015611996573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119ba919061288f565b6040517f593e96b60000000000000000000000000000000000000000000000000000000081527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab60048201529091506000906001600160a01b0388169063593e96b69060240160206040518083038186803b158015611a3857600080fd5b505afa158015611a4c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a70919061288f565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815261decd60048201526001600160a01b0391909116906370a082319060240160206040518083038186803b158015611acc57600080fd5b505afa158015611ae0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b049190612c54565b11158015611b86575060405163288c314960e21b81526001600160a01b03868116600483015287169063a230c5249060240160206040518083038186803b158015611b4e57600080fd5b505afa158015611b62573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b8691906129cb565b15611b975760019350505050610c2a565b8160011415611cb457600083611c4457604051633de222bb60e21b81526001600160a01b0388811660048301528781166024830152670de0b6b3a7640000919084169063f7888aec9060440160206040518083038186803b158015611bfb57600080fd5b505afa158015611c0f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c339190612c54565b611c3d9190612d88565b9050611c51565b6000945050505050610c2a565b60008111611c66576000945050505050610c2a565b677fffffffffffffff8110611c82576032945050505050610c2a565b6000611c9d611c98611c9384612630565b61264e565b612745565b67ffffffffffffffff169550610c2a945050505050565b8160021415611d6957600083611c4457604051633de222bb60e21b81526001600160a01b03888116600483015287811660248301526000919084169063f7888aec9060440160206040518083038186803b158015611d1157600080fd5b505afa158015611d25573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d499190612c54565b11611d55576000611d58565b60015b60ff1690505b9350610c2a92505050565b81611e1257600083611c4457604051633de222bb60e21b81526001600160a01b0388811660048301528781166024830152670de0b6b3a7640000919084169063f7888aec9060440160206040518083038186803b158015611dc957600080fd5b505afa158015611ddd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e019190612c54565b611e0b9190612d88565b9050611d5e565b60009350505050610c2a565b600080826001600160a01b031663c67143666040518163ffffffff1660e01b815260040160206040518083038186803b158015611e5a57600080fd5b505afa158015611e6e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e929190612c54565b90506000805b828160ff161015611ff2576040517f9029444a00000000000000000000000000000000000000000000000000000000815260ff821660048201526001600160a01b0386169063a230c524908290639029444a9060240160206040518083038186803b158015611f0657600080fd5b505afa158015611f1a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f3e919061288f565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e084901b1681526001600160a01b03909116600482015260240160206040518083038186803b158015611f9557600080fd5b505afa158015611fa9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611fcd91906129cb565b15611fe057611fdd600183612d70565b91505b80611fea81612dfc565b915050611e98565b509392505050565b6114fc828233612761565b604051634941d71d60e11b81527feee23dc9ab95b6666db01c2b6cae6a5ef706099a25926e21e0a2e043fe885604600482015260009081906001600160a01b03851690639283ae3a9060240160206040518083038186803b15801561206957600080fd5b505afa15801561207d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906120a19190612c54565b604051634941d71d60e11b81527fd093d4a34a12a221b19c0a6689d5449f1346aa769d15cca4e9782c36fda9339a60048201529091506000906001600160a01b03861690639283ae3a9060240160206040518083038186803b15801561210657600080fd5b505afa15801561211a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061213e9190612c54565b905080600114156121ba57600082611e1257612162670de0b6b3a764000086612d88565b9050600081116121785760009350505050610c2a565b677fffffffffffffff81106121935760329350505050610c2a565b60006121a4611c98611c9384612630565b67ffffffffffffffff169450610c2a9350505050565b80600214156121ec57600082611e1257600085116121d95760006121dc565b60015b60ff1690505b9250610c2a915050565b8061221157600082611e125761220a670de0b6b3a764000086612d88565b90506121e2565b600092505050610c2a565b600080836001600160a01b031663a6f636416040518163ffffffff1660e01b815260040160006040518083038186803b15801561225857600080fd5b505afa15801561226c573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526122949190810190612917565b6040517f17ba7d850000000000000000000000000000000000000000000000000000000081527f907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae600482015290915060009081906001600160a01b038716906317ba7d859060240160206040518083038186803b15801561231457600080fd5b505afa158015612328573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061234c919061288f565b905060005b83518160ff16101561255657816001600160a01b03166324a2cceb8888878560ff168151811061239157634e487b7160e01b600052603260045260246000fd5b60200260200101516040518463ffffffff1660e01b81526004016123d5939291906001600160a01b0393841681526020810192909252909116604082015260600190565b60206040518083038186803b1580156123ed57600080fd5b505afa158015612401573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061242591906129cb565b1561250357816001600160a01b03166391d2fd538888878560ff168151811061245e57634e487b7160e01b600052603260045260246000fd5b60200260200101516040518463ffffffff1660e01b81526004016124a2939291906001600160a01b0393841681526020810192909252909116604082015260600190565b60206040518083038186803b1580156124ba57600080fd5b505afa1580156124ce573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124f29190612c24565b6124fc9084612d3c565b9250612544565b61253787858360ff168151811061252a57634e487b7160e01b600052603260045260246000fd5b60200260200101516117cb565b6125419084612d3c565b92505b8061254e81612dfc565b915050612351565b509095945050505050565b600080826001600160a01b031663a6f636416040518163ffffffff1660e01b815260040160006040518083038186803b15801561259d57600080fd5b505afa1580156125b1573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526125d99190810190612917565b90506000805b82518160ff161015611ff25761261285848360ff168151811061252a57634e487b7160e01b600052603260045260246000fd5b61261c9083612d3c565b91508061262881612dfc565b9150506125df565b6000677fffffffffffffff82111561264757600080fd5b5060401b90565b60008082600f0b1361265f57600080fd5b6000600f83900b68010000000000000000811261267e576040918201911d5b6401000000008112612692576020918201911d5b6201000081126126a4576010918201911d5b61010081126126b5576008918201911d5b601081126126c5576004918201911d5b600481126126d5576002918201911d5b600281126126e4576001820191505b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0820160401b600f85900b607f8490031b6780000000000000005b60008113156125565790800260ff81901c8281029390930192607f011c9060011d61271f565b60008082600f0b121561275757600080fd5b50600f0b60401d90565b8160200151156128175781606001516001600160a01b0316635e5eb01384835a865161278d9190612de5565b60408088015190517fffffffff0000000000000000000000000000000000000000000000000000000060e087901b1681526001600160a01b03948516600482015293909216602484015260448301526064820152608401600060405180830381600087803b1580156127fe57600080fd5b505af1158015612812573d6000803e3d6000fd5b505050505b826001600160a01b031663d4f7af436040518163ffffffff1660e01b8152600401600060405180830381600087803b15801561285257600080fd5b505af1158015612866573d6000803e3d6000fd5b50505050505050565b803561287a81612e5e565b919050565b8051801515811461287a57600080fd5b6000602082840312156128a0578081fd5b81516102fa81612e5e565b600080604083850312156128bd578081fd5b82356128c881612e5e565b946020939093013593505050565b6000806000606084860312156128ea578081fd5b83356128f581612e5e565b925060208401359150604084013561290c81612e5e565b809150509250925092565b60006020808385031215612929578182fd5b825167ffffffffffffffff80821115612940578384fd5b818501915085601f830112612953578384fd5b81518181111561296557612965612e48565b8060051b9150612976848301612d0b565b8181528481019084860184860187018a1015612990578788fd5b8795505b838610156129be57805194506129a985612e5e565b84835260019590950194918601918601612994565b5098975050505050505050565b6000602082840312156129dc578081fd5b610c278261287f565b600080604083850312156129f7578182fd5b612a008361287f565b9150602083015190509250929050565b600060208284031215612a21578081fd5b81356102fa81612e5e565b60008060408385031215612a3e578182fd5b8235612a4981612e5e565b91506020830135612a5981612e5e565b809150509250929050565b60008060008060808587031215612a79578081fd5b8435612a8481612e5e565b9350602085810135612a9581612e5e565b9350604086013567ffffffffffffffff80821115612ab1578384fd5b818801915088601f830112612ac4578384fd5b813581811115612ad657612ad6612e48565b612ae884601f19601f84011601612d0b565b91508082528984828501011115612afd578485fd5b80848401858401378101909201839052509150612b1c6060860161286f565b905092959194509250565b600080604083850312156128bd578182fd5b6000806000606084860312156128ea578283fd5b60008060008060608587031215612b62578182fd5b8435612b6d81612e5e565b935060208501359250604085013567ffffffffffffffff80821115612b90578384fd5b818701915087601f830112612ba3578384fd5b813581811115612bb1578485fd5b886020828501011115612bc2578485fd5b95989497505060200194505050565b600080600060608486031215612be5578081fd5b8335612bf081612e5e565b95602085013595506040909401359392505050565b600060208284031215612c16578081fd5b8151600281106102fa578182fd5b600060208284031215612c35578081fd5b81516fffffffffffffffffffffffffffffffff811681146102fa578182fd5b600060208284031215612c65578081fd5b5051919050565b8281526040810160038310612c8357612c83612e32565b8260208301529392505050565b6060810160068510612ca457612ca4612e32565b938152602081019290925260409091015290565b6000602080835283518082850152825b81811015612ce457858101830151858201604001528201612cc8565b81811115612cf55783604083870101525b50601f01601f1916929092016040019392505050565b604051601f8201601f1916810167ffffffffffffffff81118282101715612d3457612d34612e48565b604052919050565b60006fffffffffffffffffffffffffffffffff808316818516808303821115612d6757612d67612e1c565b01949350505050565b60008219821115612d8357612d83612e1c565b500190565b600082612da357634e487b7160e01b81526012600452602481fd5b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615612de057612de0612e1c565b500290565b600082821015612df757612df7612e1c565b500390565b600060ff821660ff811415612e1357612e13612e1c565b60010192915050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612e7357600080fd5b5056fea26469706673582212207143eeb860f6aa9924fc7de229e4a736fa226de068c632da34f33b59661b12b864736f6c63430008040033";

type CollectiveVotingAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CollectiveVotingAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CollectiveVotingAdapterContract__factory extends ContractFactory {
  constructor(...args: CollectiveVotingAdapterContractConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CollectiveVotingAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<CollectiveVotingAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CollectiveVotingAdapterContract {
    return super.attach(address) as CollectiveVotingAdapterContract;
  }
  override connect(signer: Signer): CollectiveVotingAdapterContract__factory {
    return super.connect(signer) as CollectiveVotingAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CollectiveVotingAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as CollectiveVotingAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CollectiveVotingAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CollectiveVotingAdapterContract;
  }
}
