/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  ColletiveExpenseProposalAdapterContract,
  ColletiveExpenseProposalAdapterContractInterface,
} from "../../../../../contracts/collective/adapters/CollectiveExpenseProposalAdapter.sol/ColletiveExpenseProposalAdapterContract";

const _abi = [
  {
    inputs: [],
    name: "FUND_RAISE_PROPOSAL_UNEXECUTE",
    type: "error",
  },
  {
    inputs: [],
    name: "INSUFFICIENT_FUND",
    type: "error",
  },
  {
    inputs: [],
    name: "UNDONE_DAOSET_PROPOSALS",
    type: "error",
  },
  {
    inputs: [],
    name: "UNDONE_PROPOSALS",
    type: "error",
  },
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
    ],
    name: "ProposalCreated",
    type: "event",
  },
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
        internalType:
          "enum ColletiveExpenseProposalAdapterContract.ProposalState",
        name: "state",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "voteResult",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "allVotingWeight",
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
    ],
    name: "ProposalProcessed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
    ],
    name: "allDone",
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
    name: "processProposal",
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
        name: "",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "creationTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stopVoteTime",
        type: "uint256",
      },
      {
        internalType:
          "enum ColletiveExpenseProposalAdapterContract.ProposalState",
        name: "state",
        type: "uint8",
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
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "summbitProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50612c22806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80635cb7527614610051578063642fc0c0146100c65780639573167d146100e9578063b990219d146100fc575b600080fd5b6100ab61005f3660046126b8565b60006020818152928152604080822090935290815220805460018201546002830154600384015460048501546005909501546001600160a01b0394851695939490921692909160ff1686565b6040516100bd969594939291906129b9565b60405180910390f35b6100d96100d43660046127ef565b610111565b60405190151581526020016100bd565b6100d96100f736600461285b565b610149565b61010f61010a36600461280b565b6108d9565b005b6001600160a01b0381166000908152600160205260408120819061013490611105565b11610140576001610143565b60005b92915050565b60008260006101578261110f565b6001600160a01b0386166000818152602081815260408083208984529091529081902090517ff941f6910000000000000000000000000000000000000000000000000000000081529293509163f941f691906101ba9088906002906004016129fe565b60206040518083038186803b1580156101d257600080fd5b505afa1580156101e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061020a91906127aa565b1561025c5760405162461bcd60e51b815260206004820152601a60248201527f70726f706f73616c20616c72656164792070726f63657373656400000000000060448201526064015b60405180910390fd5b6040516317ba7d8560e01b81527f907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae60048201526000906001600160a01b038816906317ba7d859060240160206040518083038186803b1580156102be57600080fd5b505afa1580156102d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102f6919061269c565b90506001600160a01b03811661034e5760405162461bcd60e51b815260206004820152601160248201527f61646170746572206e6f7420666f756e640000000000000000000000000000006044820152606401610253565b6040517f76225e730000000000000000000000000000000000000000000000000000000081526001600160a01b0388811660048301526024820188905260009182918291908516906376225e7390604401606060405180830381600087803b1580156103b957600080fd5b505af11580156103cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103f1919061288c565b9194509250905060006104038b6113da565b6040517f30490e91000000000000000000000000000000000000000000000000000000008152600481018c90529091506001600160a01b038c16906330490e9190602401600060405180830381600087803b15801561046157600080fd5b505af1158015610475573d6000803e3d6000fd5b5060029250610482915050565b8460058111156104a257634e487b7160e01b600052602160045260246000fd5b141561072b57604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab60048201526000906001600160a01b038d169063593e96b69060240160206040518083038186803b15801561050a57600080fd5b505afa15801561051e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610542919061269c565b600188015488546040517ff59e38b700000000000000000000000000000000000000000000000000000000815261decd60048201526001600160a01b03918216602482015292935090919083169063f59e38b79060440160206040518083038186803b1580156105b157600080fd5b505afa1580156105c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105e991906128c5565b10156106035760058701805460ff19166003179055610725565b6002870154875460018901546040517fe176b35e0000000000000000000000000000000000000000000000000000000081526001600160a01b039384166004820152918316602483015260448201529082169063e176b35e90606401600060405180830381600087803b15801561067957600080fd5b505af115801561068d573d6000803e3d6000fd5b5050885460018a01546040517fc3c7645c0000000000000000000000000000000000000000000000000000000081526001600160a01b0392831660048201526024810191909152908416925063c3c7645c9150604401600060405180830381600087803b1580156106fd57600080fd5b505af1158015610711573d6000803e3d6000fd5b5050505060058701805460ff191660021790555b506107ff565b600384600581111561074d57634e487b7160e01b600052602160045260246000fd5b14806107785750600184600581111561077657634e487b7160e01b600052602160045260246000fd5b145b156107915760058601805460ff191660031790556107ff565b60405162461bcd60e51b815260206004820152602260248201527f70726f706f73616c20686173206e6f74206265656e20766f746564206f6e207960448201527f65740000000000000000000000000000000000000000000000000000000000006064820152608401610253565b6001600160a01b038b166000908152600160205260409020610821908b6114be565b1561084a576001600160a01b038b166000908152600160205260409020610848908b6114d9565b505b7ff3d22b9e73b9947a3edd70bd6279f80eda44c15f3cc8af46dc57bfb8191edd2b8b8b8860050160009054906101000a900460ff168487878a60058111156108a257634e487b7160e01b600052602160045260246000fd5b6040516108b5979695949392919061295f565b60405180910390a1600198505050505050506108d182826114e5565b505092915050565b836108e481336114f4565b8460006108f08261110f565b6040516317ba7d8560e01b81527fdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f5423760048201529091506001600160a01b038816906317ba7d859060240160206040518083038186803b15801561095257600080fd5b505afa158015610966573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061098a919061269c565b6040517f9a0242fc0000000000000000000000000000000000000000000000000000000081526001600160a01b0389811660048301529190911690639a0242fc9060240160206040518083038186803b1580156109e657600080fd5b505afa1580156109fa573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a1e91906127aa565b610a54576040517f01aaef1900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610a5d876115d2565b604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab60048201526000906001600160a01b0389169063593e96b69060240160206040518083038186803b158015610abf57600080fd5b505afa158015610ad3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610af7919061269c565b6040517ff59e38b700000000000000000000000000000000000000000000000000000000815261decd60048201526001600160a01b038981166024830152919250869183169063f59e38b79060440160206040518083038186803b158015610b5e57600080fd5b505afa158015610b72573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b9691906128c5565b1015610bce576040517f5cabbf5000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b876001600160a01b031663e0966bd56040518163ffffffff1660e01b8152600401600060405180830381600087803b158015610c0957600080fd5b505af1158015610c1d573d6000803e3d6000fd5b505050506000610cc88960c01b610ca38b6001600160a01b0316632116046f6040518163ffffffff1660e01b815260040160206040518083038186803b158015610c6657600080fd5b505afa158015610c7a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c9e91906128c5565b611ae5565b604051602001610cb49291906128f1565b604051602081830303815290604052611c3b565b90506040518060c00160405280896001600160a01b03168152602001878152602001886001600160a01b031681526020014281526020018a6001600160a01b0316639283ae3a7f9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc6040518263ffffffff1660e01b8152600401610d4d91815260200190565b60206040518083038186803b158015610d6557600080fd5b505afa158015610d79573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d9d91906128c5565b610da79042612aa0565b8152602001600090526001600160a01b03808b16600090815260208181526040808320868452825291829020845181549085167fffffffffffffffffffffffff000000000000000000000000000000000000000091821617825591850151600180830191909155928501516002820180549190951692169190911790925560608301516003808401919091556080840151600484015560a08401516005840180549193909260ff19909216918490811115610e7257634e487b7160e01b600052602160045260246000fd5b0217905550506040517fb73dc389000000000000000000000000000000000000000000000000000000008152600481018390526001600160a01b038b16915063b73dc38990602401600060405180830381600087803b158015610ed457600080fd5b505af1158015610ee8573d6000803e3d6000fd5b50506040516317ba7d8560e01b81527f907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae6004820152600092506001600160a01b038c1691506317ba7d859060240160206040518083038186803b158015610f4e57600080fd5b505afa158015610f62573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f86919061269c565b604080516020810182526000815290517f2b0974d00000000000000000000000000000000000000000000000000000000081529192506001600160a01b03831691632b0974d091610fdd918e918791600401612a22565b600060405180830381600087803b158015610ff757600080fd5b505af115801561100b573d6000803e3d6000fd5b50506040517f815a2bf4000000000000000000000000000000000000000000000000000000008152600481018590526001600160a01b0384811660248301528d16925063815a2bf49150604401600060405180830381600087803b15801561107257600080fd5b505af1158015611086573d6000803e3d6000fd5b5050506001600160a01b038b1660009081526001602052604090206110ac915083611c57565b50604080516001600160a01b038c168152602081018490527ffe22c13d0cc04eef2a813c30901da5f8cd64f5ba91866fccce71c606ce464874910160405180910390a15050506110fc82826114e5565b50505050505050565b6000610143825490565b6040805160808101825260008082526020820181905291810182905260608101919091525a81600001818152505043826001600160a01b031663b21634826040518163ffffffff1660e01b815260040160206040518083038186803b15801561117757600080fd5b505afa15801561118b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111af91906128c5565b14156111fd5760405162461bcd60e51b815260206004820152601060248201527f7265656e7472616e6379206775617264000000000000000000000000000000006044820152606401610253565b816001600160a01b03166310fdb0a26040518163ffffffff1660e01b8152600401600060405180830381600087803b15801561123857600080fd5b505af115801561124c573d6000803e3d6000fd5b50506040517f72c6838f0000000000000000000000000000000000000000000000000000000081527f1f2fd42ad6a6cacd573c4b212beb7a4e2499ad45d742a65337097f130e71daff6004820152600092506001600160a01b03851691506372c6838f9060240160206040518083038186803b1580156112cb57600080fd5b505afa1580156112df573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611303919061269c565b90506001600160a01b03811661131f57600060208301526113d4565b6001600160a01b038181166060840181905283516040517f43a8a3f1000000000000000000000000000000000000000000000000000000008152928616600484015260248301526000918291906343a8a3f190604401604080518083038186803b15801561138c57600080fd5b505afa1580156113a0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113c491906127c4565b9015156020860152604085015250505b50919050565b600080826001600160a01b031663a6f636416040518163ffffffff1660e01b815260040160006040518083038186803b15801561141657600080fd5b505afa15801561142a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261145291908101906126e3565b90506000805b82518160ff1610156114b65761149885848360ff168151811061148b57634e487b7160e01b600052603260045260246000fd5b6020026020010151611c63565b6114a29083612a6c565b9150806114ae81612b48565b915050611458565b509392505050565b600081815260018301602052604081205415155b9392505050565b60006114d283836122cf565b6114f08282336123ec565b5050565b6040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b03828116600483015283169063a230c5249060240160206040518083038186803b15801561154e57600080fd5b505afa158015611562573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061158691906127aa565b6114f05760405162461bcd60e51b815260206004820152600c60248201527f6f6e6c79476f7665726e6f7200000000000000000000000000000000000000006044820152606401610253565b6040516317ba7d8560e01b81527f72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a860048201526000906001600160a01b038316906317ba7d859060240160206040518083038186803b15801561163457600080fd5b505afa158015611648573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061166c919061269c565b6040516317ba7d8560e01b81527f1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe60048201529091506000906001600160a01b038416906317ba7d859060240160206040518083038186803b1580156116d157600080fd5b505afa1580156116e5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611709919061269c565b6040516317ba7d8560e01b81527f3b4de3360220463b2e1b681516ac7919070009f0544e8465d80dc511828dae5b60048201529091506000906001600160a01b038516906317ba7d859060240160206040518083038186803b15801561176e57600080fd5b505afa158015611782573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117a6919061269c565b905060016040516317ba7d8560e01b81527f8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea60048201526001600160a01b038616906317ba7d859060240160206040518083038186803b15801561180957600080fd5b505afa15801561181d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611841919061269c565b6040517f0c916bae0000000000000000000000000000000000000000000000000000000081526001600160a01b0387811660048301529190911690630c916bae9060240160206040518083038186803b15801561189d57600080fd5b505afa1580156118b1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118d5919061286d565b60038111156118f457634e487b7160e01b600052602160045260246000fd5b141561192c576040517fd65930d300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b604051630190bf0360e61b81526001600160a01b03858116600483015284169063642fc0c09060240160206040518083038186803b15801561196d57600080fd5b505afa158015611981573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119a591906127aa565b1580611a275750604051630190bf0360e61b81526001600160a01b03858116600483015283169063642fc0c09060240160206040518083038186803b1580156119ed57600080fd5b505afa158015611a01573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a2591906127aa565b155b80611aa85750604051630190bf0360e61b81526001600160a01b03858116600483015282169063642fc0c09060240160206040518083038186803b158015611a6e57600080fd5b505afa158015611a82573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611aa691906127aa565b155b15611adf576040517fabeb532d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50505050565b606081611b2557505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b8115611b4f5780611b3981612b0f565b9150611b489050600a83612ab8565b9150611b29565b60008167ffffffffffffffff811115611b7857634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611ba2576020820181803683370190505b5090505b8415611c3357611bb7600183612acc565b9150611bc4600a86612b68565b611bcf906030612aa0565b60f81b818381518110611bf257634e487b7160e01b600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350611c2c600a86612ab8565b9450611ba6565b949350505050565b6000815160001415611c4f57506000919050565b506020015190565b60006114d283836124f1565b6040517f9283ae3a0000000000000000000000000000000000000000000000000000000081527feee23dc9ab95b6666db01c2b6cae6a5ef706099a25926e21e0a2e043fe885604600482015260009081906001600160a01b03851690639283ae3a9060240160206040518083038186803b158015611ce057600080fd5b505afa158015611cf4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d1891906128c5565b6040517f9283ae3a0000000000000000000000000000000000000000000000000000000081527fd093d4a34a12a221b19c0a6689d5449f1346aa769d15cca4e9782c36fda9339a60048201529091506000906001600160a01b03861690639283ae3a9060240160206040518083038186803b158015611d9657600080fd5b505afa158015611daa573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611dce91906128c5565b6040516317ba7d8560e01b81527f8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea60048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b158015611e3357600080fd5b505afa158015611e47573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e6b919061269c565b604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab60048201529091506000906001600160a01b0388169063593e96b69060240160206040518083038186803b158015611ed057600080fd5b505afa158015611ee4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f08919061269c565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815261decd60048201526001600160a01b0391909116906370a082319060240160206040518083038186803b158015611f6457600080fd5b505afa158015611f78573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f9c91906128c5565b1115801561203757506040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b03868116600483015287169063a230c5249060240160206040518083038186803b158015611fff57600080fd5b505afa158015612013573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061203791906127aa565b156120485760019350505050610143565b8160011415612165576000836120f557604051633de222bb60e21b81526001600160a01b0388811660048301528781166024830152670de0b6b3a7640000919084169063f7888aec9060440160206040518083038186803b1580156120ac57600080fd5b505afa1580156120c0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906120e491906128c5565b6120ee9190612ab8565b9050612102565b6000945050505050610143565b60008111612117576000945050505050610143565b677fffffffffffffff8110612133576032945050505050610143565b600061214e61214961214484612540565b61255e565b612660565b67ffffffffffffffff169550610143945050505050565b816002141561221a576000836120f557604051633de222bb60e21b81526001600160a01b03888116600483015287811660248301526000919084169063f7888aec9060440160206040518083038186803b1580156121c257600080fd5b505afa1580156121d6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906121fa91906128c5565b11612206576000612209565b60015b60ff1690505b935061014392505050565b816122c3576000836120f557604051633de222bb60e21b81526001600160a01b0388811660048301528781166024830152670de0b6b3a7640000919084169063f7888aec9060440160206040518083038186803b15801561227a57600080fd5b505afa15801561228e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122b291906128c5565b6122bc9190612ab8565b905061220f565b60009350505050610143565b600081815260018301602052604081205480156123e25760006122f3600183612acc565b855490915060009061230790600190612acc565b905081811461238857600086600001828154811061233557634e487b7160e01b600052603260045260246000fd5b906000526020600020015490508087600001848154811061236657634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910192909255918252600188019052604090208390555b85548690806123a757634e487b7160e01b600052603160045260246000fd5b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610143565b6000915050610143565b8160200151156124a25781606001516001600160a01b0316635e5eb01384835a86516124189190612acc565b60408088015190517fffffffff0000000000000000000000000000000000000000000000000000000060e087901b1681526001600160a01b03948516600482015293909216602484015260448301526064820152608401600060405180830381600087803b15801561248957600080fd5b505af115801561249d573d6000803e3d6000fd5b505050505b826001600160a01b031663d4f7af436040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156124dd57600080fd5b505af11580156110fc573d6000803e3d6000fd5b600081815260018301602052604081205461253857508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610143565b506000610143565b6000677fffffffffffffff82111561255757600080fd5b5060401b90565b60008082600f0b1361256f57600080fd5b6000600f83900b68010000000000000000811261258e576040918201911d5b64010000000081126125a2576020918201911d5b6201000081126125b4576010918201911d5b61010081126125c5576008918201911d5b601081126125d5576004918201911d5b600481126125e5576002918201911d5b600281126125f4576001820191505b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0820160401b600f85900b607f8490031b6780000000000000005b60008113156126555790800260ff81901c8281029390930192607f011c9060011d61262f565b509095945050505050565b60008082600f0b121561267257600080fd5b50600f0b60401d90565b805161268781612bd4565b919050565b8051801515811461268757600080fd5b6000602082840312156126ad578081fd5b81516114d281612bd4565b600080604083850312156126ca578081fd5b82356126d581612bd4565b946020939093013593505050565b600060208083850312156126f5578182fd5b825167ffffffffffffffff8082111561270c578384fd5b818501915085601f83011261271f578384fd5b81518181111561273157612731612bbe565b8060051b604051601f19603f8301168101818110858211171561275657612756612bbe565b604052828152858101935084860182860187018a1015612774578788fd5b8795505b8386101561279d576127898161267c565b855260019590950194938601938601612778565b5098975050505050505050565b6000602082840312156127bb578081fd5b6114d28261268c565b600080604083850312156127d6578182fd5b6127df8361268c565b9150602083015190509250929050565b600060208284031215612800578081fd5b81356114d281612bd4565b60008060008060808587031215612820578182fd5b843561282b81612bd4565b9350602085013561283b81612bd4565b9250604085013561284b81612bd4565b9396929550929360600135925050565b600080604083850312156126ca578182fd5b60006020828403121561287e578081fd5b8151600481106114d2578182fd5b6000806000606084860312156128a0578283fd5b8351600681106128ae578384fd5b602085015160409095015190969495509392505050565b6000602082840312156128d6578081fd5b5051919050565b600481106128ed576128ed612ba8565b9052565b7fffffffffffffffff000000000000000000000000000000000000000000000000831681527f457870656e736523000000000000000000000000000000000000000000000000600882015260008251612951816010850160208701612ae3565b919091016010019392505050565b6001600160a01b03881681526020810187905260e0810161298360408301886128dd565b6fffffffffffffffffffffffffffffffff861660608301528460808301528360a08301528260c083015298975050505050505050565b6001600160a01b0387811682526020820187905285166040820152606081018490526080810183905260c081016129f360a08301846128dd565b979650505050505050565b8281526040810160038310612a1557612a15612ba8565b8260208301529392505050565b6001600160a01b03841681528260208201526060604082015260008251806060840152612a56816080850160208701612ae3565b601f01601f191691909101608001949350505050565b60006fffffffffffffffffffffffffffffffff808316818516808303821115612a9757612a97612b7c565b01949350505050565b60008219821115612ab357612ab3612b7c565b500190565b600082612ac757612ac7612b92565b500490565b600082821015612ade57612ade612b7c565b500390565b60005b83811015612afe578181015183820152602001612ae6565b83811115611adf5750506000910152565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612b4157612b41612b7c565b5060010190565b600060ff821660ff811415612b5f57612b5f612b7c565b60010192915050565b600082612b7757612b77612b92565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612be957600080fd5b5056fea264697066735822122093c3f68acd679ecd7a19123ffcb53598136aba3ac9b4d13e7e2e89b0a28abda664736f6c63430008040033";

type ColletiveExpenseProposalAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ColletiveExpenseProposalAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ColletiveExpenseProposalAdapterContract__factory extends ContractFactory {
  constructor(
    ...args: ColletiveExpenseProposalAdapterContractConstructorParams
  ) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ColletiveExpenseProposalAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<ColletiveExpenseProposalAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ColletiveExpenseProposalAdapterContract {
    return super.attach(address) as ColletiveExpenseProposalAdapterContract;
  }
  override connect(
    signer: Signer
  ): ColletiveExpenseProposalAdapterContract__factory {
    return super.connect(
      signer
    ) as ColletiveExpenseProposalAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ColletiveExpenseProposalAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as ColletiveExpenseProposalAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ColletiveExpenseProposalAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ColletiveExpenseProposalAdapterContract;
  }
}
