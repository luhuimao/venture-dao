/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  VintageSetRiceReceiverProposalAdapterContract,
  VintageSetRiceReceiverProposalAdapterContractInterface,
} from "../../../../../contracts/vintage/adapters/VintageSetRiceReceiverAdapter.sol/VintageSetRiceReceiverProposalAdapterContract";

const _abi = [
  {
    inputs: [],
    name: "ADAPTER_NOT_FOUND",
    type: "error",
  },
  {
    inputs: [],
    name: "PROPOSAL_ALREADY_PROCESSED",
    type: "error",
  },
  {
    inputs: [],
    name: "PROPOSAL_NOT_VOTED_YET",
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
      {
        indexed: false,
        internalType: "address",
        name: "riceReceiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "creationTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stopVoteTime",
        type: "uint256",
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
          "enum VintageSetRiceReceiverProposalAdapterContract.ProposalState",
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
        internalType: "uint128",
        name: "allVotingWeight",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "nbYes",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "nbNo",
        type: "uint128",
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
    ],
    name: "processProposal",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "address",
        name: "proposer",
        type: "address",
      },
      {
        internalType: "address",
        name: "riceReceiver",
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
          "enum VintageSetRiceReceiverProposalAdapterContract.ProposalState",
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
        name: "riceReceiver",
        type: "address",
      },
    ],
    name: "submitProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50612e13806100206000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c80638ecf7720116100505780638ecf7720146100fd5780639573167d14610110578063e4780fc51461012557600080fd5b80635cb752761461006c578063642fc0c0146100da575b600080fd5b6100c061007a366004612a09565b6000602081815292815260408082209093529081522080546001820154600283015460038401546004909401546001600160a01b03938416949390921692909160ff1685565b6040516100d1959493929190612b4e565b60405180910390f35b6100ed6100e83660046129b5565b610138565b60405190151581526020016100d1565b6100ed61010b3660046129d1565b610170565b61012361011e366004612a09565b61020d565b005b6101236101333660046129d1565b610767565b6001600160a01b0381166000908152600160205260408120819061015b90610d51565b1161016757600161016a565b60005b92915050565b6040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b0382811660048301526000919084169063a230c5249060240160206040518083038186803b1580156101ce57600080fd5b505afa1580156101e2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102069190612970565b9392505050565b81600061021982610d5b565b6001600160a01b0385166000818152602081815260408083208884529091529081902090517ff941f6910000000000000000000000000000000000000000000000000000000081529293509163f941f6919061027c908790600290600401612be8565b60206040518083038186803b15801561029457600080fd5b505afa1580156102a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102cc9190612970565b15610303576040517f35153ac400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040516317ba7d8560e01b81527fd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a860048201526000906001600160a01b038716906317ba7d859060240160206040518083038186803b15801561036557600080fd5b505afa158015610379573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061039d919061288d565b90506001600160a01b0381166103df576040517f2c87831e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040517f76225e730000000000000000000000000000000000000000000000000000000081526001600160a01b0387811660048301526024820187905260009182918291908516906376225e7390604401606060405180830381600087803b15801561044a57600080fd5b505af115801561045e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104829190612a53565b6040517f30490e91000000000000000000000000000000000000000000000000000000008152600481018c905292955090935091506001600160a01b038a16906330490e9190602401600060405180830381600087803b1580156104e557600080fd5b505af11580156104f9573d6000803e3d6000fd5b5050505060006105098a8a611045565b9050600284600581111561052d57634e487b7160e01b600052602160045260246000fd5b1415610600576004868101805460ff191660019081179091558701546040517f3b4f921a0000000000000000000000000000000000000000000000000000000081527fc77068975ba2254bd67080aa196783f213ee682a15d902d03f33782130cf737d928101929092526001600160a01b0390811660248301528b1690633b4f921a90604401600060405180830381600087803b1580156105cd57600080fd5b505af11580156105e1573d6000803e3d6000fd5b5050506004870180546002925060ff19166001835b021790555061069a565b600384600581111561062257634e487b7160e01b600052602160045260246000fd5b148061064d5750600184600581111561064b57634e487b7160e01b600052602160045260246000fd5b145b15610668576004860180546003919060ff19166001836105f6565b6040517ffa488e0200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001600160a01b038a1660009081526001602052604090206106bc908a611371565b156106e5576001600160a01b038a1660009081526001602052604090206106e3908a611389565b505b60048601547fe0867d363777a6ada708063230ad9d25fe940a2b5913de073948e222345816b2908b908b9060ff1687600581111561073357634e487b7160e01b600052602160045260246000fd5b8588886040516107499796959493929190612b8b565b60405180910390a15050505050506107618282611395565b50505050565b8161077281336113a4565b82600061077e82610d5b565b9050846001600160a01b031663d1480ddc6040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156107bb57600080fd5b505af11580156107cf573d6000803e3d6000fd5b50505050600061087a8660c01b610855886001600160a01b031663e34bf3f86040518163ffffffff1660e01b815260040160206040518083038186803b15801561081857600080fd5b505afa15801561082c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108509190612ab4565b61149c565b604051602001610866929190612ae0565b6040516020818303038152906040526115f2565b6040805160a0810182523381526001600160a01b03888116602083015242828401529151634941d71d60e11b81527f9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc6004820152929350916060830191891690639283ae3a9060240160206040518083038186803b1580156108fb57600080fd5b505afa15801561090f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109339190612ab4565b61093d9042612c91565b8152602001600090526001600160a01b03808816600090815260208181526040808320868452825291829020845181549085167fffffffffffffffffffffffff00000000000000000000000000000000000000009182161782559185015160018083018054929096169190931617909355908301516002830155606083015160038084019190915560808401516004840180549193909260ff199092169184908111156109fa57634e487b7160e01b600052602160045260246000fd5b0217905550506040517fb73dc389000000000000000000000000000000000000000000000000000000008152600481018390526001600160a01b038816915063b73dc38990602401600060405180830381600087803b158015610a5c57600080fd5b505af1158015610a70573d6000803e3d6000fd5b50506040516317ba7d8560e01b81527fd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a86004820152600092506001600160a01b03891691506317ba7d859060240160206040518083038186803b158015610ad657600080fd5b505afa158015610aea573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b0e919061288d565b604080516020810182526000815290517f26078cd00000000000000000000000000000000000000000000000000000000081529192506001600160a01b038316916326078cd091610b68918b918791429190600401612c0c565b600060405180830381600087803b158015610b8257600080fd5b505af1158015610b96573d6000803e3d6000fd5b50506040517f815a2bf4000000000000000000000000000000000000000000000000000000008152600481018590526001600160a01b0384811660248301528a16925063815a2bf49150604401600060405180830381600087803b158015610bfd57600080fd5b505af1158015610c11573d6000803e3d6000fd5b5050506001600160a01b0388166000908152600160205260409020610c3791508361160e565b507f6aaae501ff139d513d1bc12ea99b136b059504e091d4f950c8636d3a4256c298878388428b6001600160a01b0316639283ae3a7f9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc6040518263ffffffff1660e01b8152600401610cab91815260200190565b60206040518083038186803b158015610cc357600080fd5b505afa158015610cd7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cfb9190612ab4565b610d059042612c91565b604080516001600160a01b039687168152602081019590955292909416838301526060830152608082019290925290519081900360a00190a15050610d4a8282611395565b5050505050565b600061016a825490565b6040805160808101825260008082526020820181905291810182905260608101919091525a81600001818152505043826001600160a01b031663b21634826040518163ffffffff1660e01b815260040160206040518083038186803b158015610dc357600080fd5b505afa158015610dd7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dfb9190612ab4565b1415610e68576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f7265656e7472616e63792067756172640000000000000000000000000000000060448201526064015b60405180910390fd5b816001600160a01b03166310fdb0a26040518163ffffffff1660e01b8152600401600060405180830381600087803b158015610ea357600080fd5b505af1158015610eb7573d6000803e3d6000fd5b50506040517f72c6838f0000000000000000000000000000000000000000000000000000000081527f1f2fd42ad6a6cacd573c4b212beb7a4e2499ad45d742a65337097f130e71daff6004820152600092506001600160a01b03851691506372c6838f9060240160206040518083038186803b158015610f3657600080fd5b505afa158015610f4a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f6e919061288d565b90506001600160a01b038116610f8a576000602083015261103f565b6001600160a01b038181166060840181905283516040517f43a8a3f1000000000000000000000000000000000000000000000000000000008152928616600484015260248301526000918291906343a8a3f190604401604080518083038186803b158015610ff757600080fd5b505afa15801561100b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061102f919061298a565b9015156020860152604085015250505b50919050565b600080836001600160a01b031663a6f636416040518163ffffffff1660e01b815260040160006040518083038186803b15801561108157600080fd5b505afa158015611095573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526110bd91908101906128a9565b6040516317ba7d8560e01b81527fd3999c37f8f35da86f802a74f9bf032c4aeb46e49abd9c861f489ef4cb40d0a8600482015290915060009081906001600160a01b038716906317ba7d859060240160206040518083038186803b15801561112457600080fd5b505afa158015611138573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061115c919061288d565b905060005b83518160ff16101561136657816001600160a01b03166324a2cceb8888878560ff16815181106111a157634e487b7160e01b600052603260045260246000fd5b60200260200101516040518463ffffffff1660e01b81526004016111e5939291906001600160a01b0393841681526020810192909252909116604082015260600190565b60206040518083038186803b1580156111fd57600080fd5b505afa158015611211573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112359190612970565b1561131357816001600160a01b03166391d2fd538888878560ff168151811061126e57634e487b7160e01b600052603260045260246000fd5b60200260200101516040518463ffffffff1660e01b81526004016112b2939291906001600160a01b0393841681526020810192909252909116604082015260600190565b60206040518083038186803b1580156112ca57600080fd5b505afa1580156112de573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113029190612a9a565b61130c9084612c5d565b9250611354565b61134787858360ff168151811061133a57634e487b7160e01b600052603260045260246000fd5b602002602001015161161a565b6113519084612c5d565b92505b8061135e81612d39565b915050611161565b509095945050505050565b60008181526001830160205260408120541515610206565b600061020683836124a2565b6113a08282336125bf565b5050565b6040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b03828116600483015283169063a230c5249060240160206040518083038186803b1580156113fe57600080fd5b505afa158015611412573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114369190612970565b6113a0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600c60248201527f6f6e6c79476f7665726e6f7200000000000000000000000000000000000000006044820152606401610e5f565b6060816114dc57505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561150657806114f081612d00565b91506114ff9050600a83612ca9565b91506114e0565b60008167ffffffffffffffff81111561152f57634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611559576020820181803683370190505b5090505b84156115ea5761156e600183612cbd565b915061157b600a86612d59565b611586906030612c91565b60f81b8183815181106115a957634e487b7160e01b600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506115e3600a86612ca9565b945061155d565b949350505050565b600081516000141561160657506000919050565b506020015190565b600061020683836126cd565b6040516317ba7d8560e01b81527faaff643bdbd909f604d46ce015336f7e20fee3ac4a55cef3610188dee176c892600482015260009081906001600160a01b038516906317ba7d859060240160206040518083038186803b15801561167e57600080fd5b505afa158015611692573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116b6919061288d565b6040516317ba7d8560e01b81527fa837e34a29b67bf52f684a1c93def79b84b9c012732becee4e5df62809df64ed60048201529091506000906001600160a01b038616906317ba7d859060240160206040518083038186803b15801561171b57600080fd5b505afa15801561172f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611753919061288d565b6040516317ba7d8560e01b81527f1fa6846b165d822fff79e37c67625706652fa9380c2aa49fd513ce534cc72ed460048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b1580156117b857600080fd5b505afa1580156117cc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117f0919061288d565b604051634941d71d60e11b81527f686efe7bd1699b408d306db6bbee658ed667971c52d48d6912d7ee496e36e62760048201529091506000906001600160a01b03881690639283ae3a9060240160206040518083038186803b15801561185557600080fd5b505afa158015611869573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061188d9190612ab4565b604051634941d71d60e11b81527fb75eae231d9582c6afc6491273df4a0ffbccd48ab2c48dbce59e5d68f2d19dc460048201529091506000906001600160a01b03891690639283ae3a9060240160206040518083038186803b1580156118f257600080fd5b505afa158015611906573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061192a9190612ab4565b604051634941d71d60e11b81527e634460a4b60c2e1bf8c87bfc42b6b68fd2a71f4bb2d760816eabc5038b503660048201529091506000906001600160a01b038a1690639283ae3a9060240160206040518083038186803b15801561198e57600080fd5b505afa1580156119a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119c69190612ab4565b6040517ffd310d290000000000000000000000000000000000000000000000000000000081527fcd9b30ab6388c165d825b60b7d393528191ba59d975b4b1b52b7184b63b8a97c60048201529091506000906001600160a01b038b169063fd310d299060240160206040518083038186803b158015611a4457600080fd5b505afa158015611a58573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a7c919061288d565b90508260011415611ef757600084611b24576040516370a0823160e01b81526001600160a01b038b81166004830152670de0b6b3a764000091908416906370a08231906024015b60206040518083038186803b158015611adb57600080fd5b505afa158015611aef573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b139190612ab4565b611b1d9190612ca9565b9050611e88565b8460011415611ba7576040516370a0823160e01b81526001600160a01b038b811660048301528316906370a08231906024015b60206040518083038186803b158015611b6f57600080fd5b505afa158015611b83573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b1d9190612ab4565b8460021415611be357604051627eeac760e11b81526001600160a01b038b811660048301526024820185905283169062fdd58e90604401611b57565b8460031415611c22576040516329b6517360e21b81526001600160a01b038c811660048301528b8116602483015287169063a6d945cc90604401611b57565b8460041415611e775760026040517f1ee1a2b00000000000000000000000000000000000000000000000000000000081526001600160a01b038d811660048301528a1690631ee1a2b09060240160206040518083038186803b158015611c8757600080fd5b505afa158015611c9b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611cbf9190612a34565b6003811115611cde57634e487b7160e01b600052602160045260246000fd5b148015611d805750604051634941d71d60e11b81527f9ce69cf04065e3c7823cc5540c0598d8a694bd7a9a5a2a786d8bccf14ed6e2ea60048201526001600160a01b038c1690639283ae3a9060240160206040518083038186803b158015611d4557600080fd5b505afa158015611d59573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d7d9190612ab4565b42105b8015611e2057506040517f4fc0a76d0000000000000000000000000000000000000000000000000000000081526001600160a01b038c8116600483015260019190891690634fc0a76d9060240160206040518083038186803b158015611de557600080fd5b505afa158015611df9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e1d9190612ab4565b10155b15611e6657604051633de222bb60e21b81526001600160a01b038c811660048301528b81166024830152670de0b6b3a764000091908a169063f7888aec90604401611ac3565b60019850505050505050505061016a565b60009850505050505050505061016a565b60008111611ea15760009850505050505050505061016a565b677fffffffffffffff8110611ec15760329850505050505050505061016a565b6000611edc611ed7611ed28461271c565b61273a565b612831565b67ffffffffffffffff16995061016a98505050505050505050565b82600214156120ae57600084611f9e576040516370a0823160e01b81526001600160a01b038b81166004830152600091908416906370a08231906024015b60206040518083038186803b158015611f4d57600080fd5b505afa158015611f61573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f859190612ab4565b11611f91576000611f94565b60015b60ff16905061209f565b8460011415611fd9576040516370a0823160e01b81526001600160a01b038b81166004830152600091908416906370a0823190602401611f35565b846002141561201957604051627eeac760e11b81526001600160a01b038b81166004830152602482018590526000919084169062fdd58e90604401611f35565b846003141561205c576040516329b6517360e21b81526001600160a01b038c811660048301528b811660248301526000919088169063a6d945cc90604401611f35565b8460041415611e7757604051633de222bb60e21b81526001600160a01b038c811660048301528b81166024830152600091908a169063f7888aec90604401611f35565b975061016a9650505050505050565b8261249257600084612150576040516370a0823160e01b81526001600160a01b038b81166004830152670de0b6b3a764000091908416906370a08231906024015b60206040518083038186803b15801561210757600080fd5b505afa15801561211b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061213f9190612ab4565b6121499190612ca9565b905061209f565b84600114156121d3576040516370a0823160e01b81526001600160a01b038b811660048301528316906370a08231906024015b60206040518083038186803b15801561219b57600080fd5b505afa1580156121af573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906121499190612ab4565b846002141561220f57604051627eeac760e11b81526001600160a01b038b811660048301526024820185905283169062fdd58e90604401612183565b846003141561224e576040516329b6517360e21b81526001600160a01b038c811660048301528b8116602483015287169063a6d945cc90604401612183565b8460041415611e775760026040517f1ee1a2b00000000000000000000000000000000000000000000000000000000081526001600160a01b038d811660048301528a1690631ee1a2b09060240160206040518083038186803b1580156122b357600080fd5b505afa1580156122c7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122eb9190612a34565b600381111561230a57634e487b7160e01b600052602160045260246000fd5b1480156123ac5750604051634941d71d60e11b81527f9ce69cf04065e3c7823cc5540c0598d8a694bd7a9a5a2a786d8bccf14ed6e2ea60048201526001600160a01b038c1690639283ae3a9060240160206040518083038186803b15801561237157600080fd5b505afa158015612385573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123a99190612ab4565b42105b801561244c57506040517f4fc0a76d0000000000000000000000000000000000000000000000000000000081526001600160a01b038c8116600483015260019190891690634fc0a76d9060240160206040518083038186803b15801561241157600080fd5b505afa158015612425573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124499190612ab4565b10155b15611e6657604051633de222bb60e21b81526001600160a01b038c811660048301528b81166024830152670de0b6b3a764000091908a169063f7888aec906044016120ef565b600097505050505050505061016a565b600081815260018301602052604081205480156125b55760006124c6600183612cbd565b85549091506000906124da90600190612cbd565b905081811461255b57600086600001828154811061250857634e487b7160e01b600052603260045260246000fd5b906000526020600020015490508087600001848154811061253957634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910192909255918252600188019052604090208390555b855486908061257a57634e487b7160e01b600052603160045260246000fd5b60019003818190600052602060002001600090559055856001016000868152602001908152602001600020600090556001935050505061016a565b600091505061016a565b8160200151156126755781606001516001600160a01b0316635e5eb01384835a86516125eb9190612cbd565b60408088015190517fffffffff0000000000000000000000000000000000000000000000000000000060e087901b1681526001600160a01b03948516600482015293909216602484015260448301526064820152608401600060405180830381600087803b15801561265c57600080fd5b505af1158015612670573d6000803e3d6000fd5b505050505b826001600160a01b031663d4f7af436040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156126b057600080fd5b505af11580156126c4573d6000803e3d6000fd5b50505050505050565b60008181526001830160205260408120546127145750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561016a565b50600061016a565b6000677fffffffffffffff82111561273357600080fd5b5060401b90565b60008082600f0b1361274b57600080fd5b6000600f83900b68010000000000000000811261276a576040918201911d5b640100000000811261277e576020918201911d5b620100008112612790576010918201911d5b61010081126127a1576008918201911d5b601081126127b1576004918201911d5b600481126127c1576002918201911d5b600281126127d0576001820191505b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0820160401b600f85900b607f8490031b6780000000000000005b60008113156113665790800260ff81901c8281029390930192607f011c9060011d61280b565b60008082600f0b121561284357600080fd5b50600f0b60401d90565b805161285881612dc5565b919050565b8051801515811461285857600080fd5b80516fffffffffffffffffffffffffffffffff8116811461285857600080fd5b60006020828403121561289e578081fd5b815161020681612dc5565b600060208083850312156128bb578182fd5b825167ffffffffffffffff808211156128d2578384fd5b818501915085601f8301126128e5578384fd5b8151818111156128f7576128f7612daf565b8060051b604051601f19603f8301168101818110858211171561291c5761291c612daf565b604052828152858101935084860182860187018a101561293a578788fd5b8795505b838610156129635761294f8161284d565b85526001959095019493860193860161293e565b5098975050505050505050565b600060208284031215612981578081fd5b6102068261285d565b6000806040838503121561299c578081fd5b6129a58361285d565b9150602083015190509250929050565b6000602082840312156129c6578081fd5b813561020681612dc5565b600080604083850312156129e3578182fd5b82356129ee81612dc5565b915060208301356129fe81612dc5565b809150509250929050565b60008060408385031215612a1b578182fd5b8235612a2681612dc5565b946020939093013593505050565b600060208284031215612a45578081fd5b815160048110610206578182fd5b600080600060608486031215612a67578081fd5b835160068110612a75578182fd5b9250612a836020850161286d565b9150612a916040850161286d565b90509250925092565b600060208284031215612aab578081fd5b6102068261286d565b600060208284031215612ac5578081fd5b5051919050565b60048110612adc57612adc612d99565b9052565b7fffffffffffffffff000000000000000000000000000000000000000000000000831681527f5365745269636552656365697665722300000000000000000000000000000000600882015260008251612b40816018850160208701612cd4565b919091016018019392505050565b6001600160a01b03868116825285166020820152604081018490526060810183905260a08101612b816080830184612acc565b9695505050505050565b6001600160a01b03881681526020810187905260e08101612baf6040830188612acc565b60608201959095526fffffffffffffffffffffffffffffffff938416608082015291831660a083015290911660c0909101529392505050565b8281526040810160038310612bff57612bff612d99565b8260208301529392505050565b6001600160a01b03851681528360208201528260408201526080606082015260008251806080840152612c468160a0850160208701612cd4565b601f01601f19169190910160a00195945050505050565b60006fffffffffffffffffffffffffffffffff808316818516808303821115612c8857612c88612d6d565b01949350505050565b60008219821115612ca457612ca4612d6d565b500190565b600082612cb857612cb8612d83565b500490565b600082821015612ccf57612ccf612d6d565b500390565b60005b83811015612cef578181015183820152602001612cd7565b838111156107615750506000910152565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612d3257612d32612d6d565b5060010190565b600060ff821660ff811415612d5057612d50612d6d565b60010192915050565b600082612d6857612d68612d83565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612dda57600080fd5b5056fea26469706673582212206445114c8086ff92f4f45b37b9ff87c22884abc9191bfcaa79d618b86dd733a464736f6c63430008040033";

type VintageSetRiceReceiverProposalAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VintageSetRiceReceiverProposalAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VintageSetRiceReceiverProposalAdapterContract__factory extends ContractFactory {
  constructor(
    ...args: VintageSetRiceReceiverProposalAdapterContractConstructorParams
  ) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<VintageSetRiceReceiverProposalAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<VintageSetRiceReceiverProposalAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(
    address: string
  ): VintageSetRiceReceiverProposalAdapterContract {
    return super.attach(
      address
    ) as VintageSetRiceReceiverProposalAdapterContract;
  }
  override connect(
    signer: Signer
  ): VintageSetRiceReceiverProposalAdapterContract__factory {
    return super.connect(
      signer
    ) as VintageSetRiceReceiverProposalAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VintageSetRiceReceiverProposalAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as VintageSetRiceReceiverProposalAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VintageSetRiceReceiverProposalAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as VintageSetRiceReceiverProposalAdapterContract;
  }
}
