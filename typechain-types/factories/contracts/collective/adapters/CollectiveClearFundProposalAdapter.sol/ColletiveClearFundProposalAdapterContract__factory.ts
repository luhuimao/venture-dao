/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  ColletiveClearFundProposalAdapterContract,
  ColletiveClearFundProposalAdapterContractInterface,
} from "../../../../../contracts/collective/adapters/CollectiveClearFundProposalAdapter.sol/ColletiveClearFundProposalAdapterContract";

const _abi = [
  {
    inputs: [],
    name: "UNDONE_DAOSETTING_PROPOSALS",
    type: "error",
  },
  {
    inputs: [],
    name: "UNDONE_OPERATION_PROPOSALS",
    type: "error",
  },
  {
    inputs: [],
    name: "UNDONE_PRE_CLEAR_FUND_PROPOSAL",
    type: "error",
  },
  {
    inputs: [],
    name: "VOTE_NOT_START",
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
          "enum ColletiveClearFundProposalAdapterContract.ProposalState",
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
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "ongoingClearFundProposal",
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
    name: "processClearFundProposal",
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
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "proposor",
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
          "enum ColletiveClearFundProposalAdapterContract.ProposalState",
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
    ],
    name: "submitClearFundProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50612a36806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806339f584b3146100515780635cb752761461006657806360e6fbea146100d15780638e3ee388146100ff575b600080fd5b61006461005f366004612698565b610112565b005b6100b7610074366004612561565b600260208181526000938452604080852090915291835291208054600182015492820154600383015460049093015491936001600160a01b031692909160ff1685565b6040516100c89594939291906127d7565b60405180910390f35b6100f16100df366004612522565b60006020819052908152604090205481565b6040519081526020016100c8565b61006461010d366004612522565b6106fc565b81600061011e82610d1a565b6001600160a01b03851660008181526002602081815260408084208985529091529182902091517ff941f691000000000000000000000000000000000000000000000000000000008152939450909263f941f6919161018291889190600401612812565b60206040518083038186803b15801561019a57600080fd5b505afa1580156101ae573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d29190612653565b156102245760405162461bcd60e51b815260206004820152601a60248201527f70726f706f73616c20616c72656164792070726f63657373656400000000000060448201526064015b60405180910390fd5b6040516317ba7d8560e01b81527f907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae60048201526000906001600160a01b038716906317ba7d859060240160206040518083038186803b15801561028657600080fd5b505afa15801561029a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102be9190612545565b90506001600160a01b0381166103165760405162461bcd60e51b815260206004820152601160248201527f61646170746572206e6f7420666f756e64000000000000000000000000000000604482015260640161021b565b6040517f76225e730000000000000000000000000000000000000000000000000000000081526001600160a01b0387811660048301526024820187905260009182918291908516906376225e7390604401606060405180830381600087803b15801561038157600080fd5b505af1158015610395573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103b991906126aa565b9194509250905060006103cb8a610fe5565b6040517f30490e91000000000000000000000000000000000000000000000000000000008152600481018b90529091506001600160a01b038b16906330490e9190602401600060405180830381600087803b15801561042957600080fd5b505af115801561043d573d6000803e3d6000fd5b506002925061044a915050565b84600581111561046a57634e487b7160e01b600052602160045260246000fd5b1415610597576040516317ba7d8560e01b81527f8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea60048201526000906001600160a01b038c16906317ba7d859060240160206040518083038186803b1580156104d257600080fd5b505afa1580156104e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061050a9190612545565b6040517f83cffffe0000000000000000000000000000000000000000000000000000000081526001600160a01b038d81166004830152919250908216906383cffffe90602401600060405180830381600087803b15801561056a57600080fd5b505af115801561057e573d6000803e3d6000fd5b5050505060048701805460ff191660021790555061062f565b60038460058111156105b957634e487b7160e01b600052602160045260246000fd5b14806105e4575060018460058111156105e257634e487b7160e01b600052602160045260246000fd5b145b156105fd5760048601805460ff1916600317905561062f565b6040517f97cbb52b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001600160a01b038a166000908152600160205260409020610651908a6110c9565b1561067a576001600160a01b038a166000908152600160205260409020610678908a6110e6565b505b60048601547ff3d22b9e73b9947a3edd70bd6279f80eda44c15f3cc8af46dc57bfb8191edd2b908b908b9060ff168760058111156106c857634e487b7160e01b600052602160045260246000fd5b8588886040516106de979695949392919061277d565b60405180910390a15050505050506106f682826110f2565b50505050565b806107078133611101565b81600061071382610d1a565b905061071e846111df565b610727846117ae565b6001600160a01b038416600090815260016020526040812061074890611914565b511115610781576040517fcf4edbe900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b836001600160a01b031663b00cda466040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156107bc57600080fd5b505af11580156107d0573d6000803e3d6000fd5b50505050600061087b8560c01b610856876001600160a01b031663f2449bc96040518163ffffffff1660e01b815260040160206040518083038186803b15801561081957600080fd5b505afa15801561082d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061085191906126e3565b61191f565b60405160200161086792919061270f565b604051602081830303815290604052611a75565b6040805160a08101825282815233602082015242818301529051634941d71d60e11b81527f9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc60048201529192509060608201906001600160a01b03881690639283ae3a9060240160206040518083038186803b1580156108fa57600080fd5b505afa15801561090e573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061093291906126e3565b61093c90426128b4565b8152602001600090526001600160a01b0386811660009081526002602081815260408084208785528252928390208551815590850151600180830180547fffffffffffffffffffffffff000000000000000000000000000000000000000016929096169190911790945591840151908201556060830151600380830191909155608084015160048301805493949193909260ff19909116919084908111156109f457634e487b7160e01b600052602160045260246000fd5b0217905550506040517fb73dc389000000000000000000000000000000000000000000000000000000008152600481018390526001600160a01b038716915063b73dc38990602401600060405180830381600087803b158015610a5657600080fd5b505af1158015610a6a573d6000803e3d6000fd5b50506040516317ba7d8560e01b81527f907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae60048201526001600160a01b038816925063815a2bf49150839083906317ba7d859060240160206040518083038186803b158015610ad757600080fd5b505afa158015610aeb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b0f9190612545565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b16815260048101929092526001600160a01b03166024820152604401600060405180830381600087803b158015610b6e57600080fd5b505af1158015610b82573d6000803e3d6000fd5b50506040516317ba7d8560e01b81527f907642cbfe4e58ddd14eaa320923fbe4c29721dd0950ae4cb3b2626e292791ae6004820152600092506001600160a01b03881691506317ba7d859060240160206040518083038186803b158015610be857600080fd5b505afa158015610bfc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c209190612545565b604080516020810182526000815290517f2b0974d00000000000000000000000000000000000000000000000000000000081529192506001600160a01b03831691632b0974d091610c77918a918791600401612836565b600060405180830381600087803b158015610c9157600080fd5b505af1158015610ca5573d6000803e3d6000fd5b5050506001600160a01b0387166000908152600160205260409020610ccb915083611a91565b50604080516001600160a01b0388168152602081018490527ffe22c13d0cc04eef2a813c30901da5f8cd64f5ba91866fccce71c606ce464874910160405180910390a150506106f682826110f2565b6040805160808101825260008082526020820181905291810182905260608101919091525a81600001818152505043826001600160a01b031663b21634826040518163ffffffff1660e01b815260040160206040518083038186803b158015610d8257600080fd5b505afa158015610d96573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dba91906126e3565b1415610e085760405162461bcd60e51b815260206004820152601060248201527f7265656e7472616e637920677561726400000000000000000000000000000000604482015260640161021b565b816001600160a01b03166310fdb0a26040518163ffffffff1660e01b8152600401600060405180830381600087803b158015610e4357600080fd5b505af1158015610e57573d6000803e3d6000fd5b50506040517f72c6838f0000000000000000000000000000000000000000000000000000000081527f1f2fd42ad6a6cacd573c4b212beb7a4e2499ad45d742a65337097f130e71daff6004820152600092506001600160a01b03851691506372c6838f9060240160206040518083038186803b158015610ed657600080fd5b505afa158015610eea573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f0e9190612545565b90506001600160a01b038116610f2a5760006020830152610fdf565b6001600160a01b038181166060840181905283516040517f43a8a3f1000000000000000000000000000000000000000000000000000000008152928616600484015260248301526000918291906343a8a3f190604401604080518083038186803b158015610f9757600080fd5b505afa158015610fab573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fcf919061266d565b9015156020860152604085015250505b50919050565b600080826001600160a01b031663a6f636416040518163ffffffff1660e01b815260040160006040518083038186803b15801561102157600080fd5b505afa158015611035573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261105d919081019061258c565b90506000805b82518160ff1610156110c1576110a385848360ff168151811061109657634e487b7160e01b600052603260045260246000fd5b6020026020010151611a9d565b6110ad9083612880565b9150806110b98161295c565b915050611063565b509392505050565b600081815260018301602052604081205415155b90505b92915050565b60006110dd83836120f0565b6110fd82823361220d565b5050565b6040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b03828116600483015283169063a230c5249060240160206040518083038186803b15801561115b57600080fd5b505afa15801561116f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111939190612653565b6110fd5760405162461bcd60e51b815260206004820152600c60248201527f6f6e6c79476f7665726e6f720000000000000000000000000000000000000000604482015260640161021b565b6040516317ba7d8560e01b81527fd0e09561b13ad01191fc8f65f6fc85651e4f495d3f9ab93d95010ea58382434b60048201526000906001600160a01b038316906317ba7d859060240160206040518083038186803b15801561124157600080fd5b505afa158015611255573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112799190612545565b6040516317ba7d8560e01b81527f72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a860048201529091506000906001600160a01b038416906317ba7d859060240160206040518083038186803b1580156112de57600080fd5b505afa1580156112f2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113169190612545565b6040516317ba7d8560e01b81527f3a06648a49edffe95b8384794dfe9cf3ab34782fab0130b4c91bfd53f3407e6b60048201529091506000906001600160a01b038516906317ba7d859060240160206040518083038186803b15801561137b57600080fd5b505afa15801561138f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113b39190612545565b6040516317ba7d8560e01b81527f1a4f1390baec30049008138e650571a3c4374eba88116bc89dc192f2f9295efe60048201529091506000906001600160a01b038616906317ba7d859060240160206040518083038186803b15801561141857600080fd5b505afa15801561142c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114509190612545565b6040516317ba7d8560e01b81527f3b4de3360220463b2e1b681516ac7919070009f0544e8465d80dc511828dae5b60048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b1580156114b557600080fd5b505afa1580156114c9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114ed9190612545565b604051630190bf0360e61b81526001600160a01b0388811660048301529192509086169063642fc0c09060240160206040518083038186803b15801561153257600080fd5b505afa158015611546573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061156a9190612653565b15806115ec5750604051630190bf0360e61b81526001600160a01b03878116600483015285169063642fc0c09060240160206040518083038186803b1580156115b257600080fd5b505afa1580156115c6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115ea9190612653565b155b8061166d5750604051630190bf0360e61b81526001600160a01b03878116600483015284169063642fc0c09060240160206040518083038186803b15801561163357600080fd5b505afa158015611647573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061166b9190612653565b155b806116ee5750604051630190bf0360e61b81526001600160a01b03878116600483015283169063642fc0c09060240160206040518083038186803b1580156116b457600080fd5b505afa1580156116c8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116ec9190612653565b155b8061176f5750604051630190bf0360e61b81526001600160a01b03878116600483015282169063642fc0c09060240160206040518083038186803b15801561173557600080fd5b505afa158015611749573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061176d9190612653565b155b156117a6576040517f08988c4f00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505050505050565b6040516317ba7d8560e01b81527fdac6d9ce728ebc92a61253866b4e5a4c73b76ba0aa11e7297a633f6232f5423760048201526000906001600160a01b038316906317ba7d859060240160206040518083038186803b15801561181057600080fd5b505afa158015611824573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118489190612545565b6040517f9a0242fc0000000000000000000000000000000000000000000000000000000081526001600160a01b03848116600483015291925090821690639a0242fc9060240160206040518083038186803b1580156118a657600080fd5b505afa1580156118ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118de9190612653565b6110fd576040517f1e8d80d100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60606110e08261231b565b60608161195f57505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b8115611989578061197381612923565b91506119829050600a836128cc565b9150611963565b60008167ffffffffffffffff8111156119b257634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f1916602001820160405280156119dc576020820181803683370190505b5090505b8415611a6d576119f16001836128e0565b91506119fe600a8661297c565b611a099060306128b4565b60f81b818381518110611a2c57634e487b7160e01b600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350611a66600a866128cc565b94506119e0565b949350505050565b6000815160001415611a8957506000919050565b506020015190565b60006110dd8383612377565b604051634941d71d60e11b81527feee23dc9ab95b6666db01c2b6cae6a5ef706099a25926e21e0a2e043fe885604600482015260009081906001600160a01b03851690639283ae3a9060240160206040518083038186803b158015611b0157600080fd5b505afa158015611b15573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b3991906126e3565b604051634941d71d60e11b81527fd093d4a34a12a221b19c0a6689d5449f1346aa769d15cca4e9782c36fda9339a60048201529091506000906001600160a01b03861690639283ae3a9060240160206040518083038186803b158015611b9e57600080fd5b505afa158015611bb2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bd691906126e3565b6040516317ba7d8560e01b81527f8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea60048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b158015611c3b57600080fd5b505afa158015611c4f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c739190612545565b6040517f593e96b60000000000000000000000000000000000000000000000000000000081527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab60048201529091506000906001600160a01b0388169063593e96b69060240160206040518083038186803b158015611cf157600080fd5b505afa158015611d05573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d299190612545565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815261decd60048201526001600160a01b0391909116906370a082319060240160206040518083038186803b158015611d8557600080fd5b505afa158015611d99573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611dbd91906126e3565b11158015611e5857506040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b03868116600483015287169063a230c5249060240160206040518083038186803b158015611e2057600080fd5b505afa158015611e34573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e589190612653565b15611e6957600193505050506110e0565b8160011415611f8657600083611f1657604051633de222bb60e21b81526001600160a01b0388811660048301528781166024830152670de0b6b3a7640000919084169063f7888aec9060440160206040518083038186803b158015611ecd57600080fd5b505afa158015611ee1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f0591906126e3565b611f0f91906128cc565b9050611f23565b60009450505050506110e0565b60008111611f385760009450505050506110e0565b677fffffffffffffff8110611f545760329450505050506110e0565b6000611f6f611f6a611f65846123c6565b6123e4565b6124e6565b67ffffffffffffffff1695506110e0945050505050565b816002141561203b57600083611f1657604051633de222bb60e21b81526001600160a01b03888116600483015287811660248301526000919084169063f7888aec9060440160206040518083038186803b158015611fe357600080fd5b505afa158015611ff7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061201b91906126e3565b1161202757600061202a565b60015b60ff1690505b93506110e092505050565b816120e457600083611f1657604051633de222bb60e21b81526001600160a01b0388811660048301528781166024830152670de0b6b3a7640000919084169063f7888aec9060440160206040518083038186803b15801561209b57600080fd5b505afa1580156120af573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906120d391906126e3565b6120dd91906128cc565b9050612030565b600093505050506110e0565b600081815260018301602052604081205480156122035760006121146001836128e0565b8554909150600090612128906001906128e0565b90508181146121a957600086600001828154811061215657634e487b7160e01b600052603260045260246000fd5b906000526020600020015490508087600001848154811061218757634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910192909255918252600188019052604090208390555b85548690806121c857634e487b7160e01b600052603160045260246000fd5b6001900381819060005260206000200160009055905585600101600086815260200190815260200160002060009055600193505050506110e0565b60009150506110e0565b8160200151156122c35781606001516001600160a01b0316635e5eb01384835a865161223991906128e0565b60408088015190517fffffffff0000000000000000000000000000000000000000000000000000000060e087901b1681526001600160a01b03948516600482015293909216602484015260448301526064820152608401600060405180830381600087803b1580156122aa57600080fd5b505af11580156122be573d6000803e3d6000fd5b505050505b826001600160a01b031663d4f7af436040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156122fe57600080fd5b505af1158015612312573d6000803e3d6000fd5b50505050505050565b60608160000180548060200260200160405190810160405280929190818152602001828054801561236b57602002820191906000526020600020905b815481526020019060010190808311612357575b50505050509050919050565b60008181526001830160205260408120546123be575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556110e0565b5060006110e0565b6000677fffffffffffffff8211156123dd57600080fd5b5060401b90565b60008082600f0b136123f557600080fd5b6000600f83900b680100000000000000008112612414576040918201911d5b6401000000008112612428576020918201911d5b62010000811261243a576010918201911d5b610100811261244b576008918201911d5b6010811261245b576004918201911d5b6004811261246b576002918201911d5b6002811261247a576001820191505b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0820160401b600f85900b607f8490031b6780000000000000005b60008113156124db5790800260ff81901c8281029390930192607f011c9060011d6124b5565b509095945050505050565b60008082600f0b12156124f857600080fd5b50600f0b60401d90565b805161250d816129e8565b919050565b8051801515811461250d57600080fd5b600060208284031215612533578081fd5b813561253e816129e8565b9392505050565b600060208284031215612556578081fd5b815161253e816129e8565b60008060408385031215612573578081fd5b823561257e816129e8565b946020939093013593505050565b6000602080838503121561259e578182fd5b825167ffffffffffffffff808211156125b5578384fd5b818501915085601f8301126125c8578384fd5b8151818111156125da576125da6129d2565b8060051b604051601f19603f830116810181811085821117156125ff576125ff6129d2565b604052828152858101935084860182860187018a101561261d578788fd5b8795505b838610156126465761263281612502565b855260019590950194938601938601612621565b5098975050505050505050565b600060208284031215612664578081fd5b6110dd82612512565b6000806040838503121561267f578182fd5b61268883612512565b9150602083015190509250929050565b60008060408385031215612573578182fd5b6000806000606084860312156126be578081fd5b8351600681106126cc578182fd5b602085015160409095015190969495509392505050565b6000602082840312156126f4578081fd5b5051919050565b6004811061270b5761270b6129bc565b9052565b7fffffffffffffffff000000000000000000000000000000000000000000000000831681527f436c65617246756e64230000000000000000000000000000000000000000000060088201526000825161276f8160128501602087016128f7565b919091016012019392505050565b6001600160a01b03881681526020810187905260e081016127a160408301886126fb565b8560608301526fffffffffffffffffffffffffffffffff851660808301528360a08301528260c083015298975050505050505050565b8581526001600160a01b0385166020820152604081018490526060810183905260a0810161280860808301846126fb565b9695505050505050565b8281526040810160038310612829576128296129bc565b8260208301529392505050565b6001600160a01b0384168152826020820152606060408201526000825180606084015261286a8160808501602087016128f7565b601f01601f191691909101608001949350505050565b60006fffffffffffffffffffffffffffffffff8083168185168083038211156128ab576128ab612990565b01949350505050565b600082198211156128c7576128c7612990565b500190565b6000826128db576128db6129a6565b500490565b6000828210156128f2576128f2612990565b500390565b60005b838110156129125781810151838201526020016128fa565b838111156106f65750506000910152565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561295557612955612990565b5060010190565b600060ff821660ff81141561297357612973612990565b60010192915050565b60008261298b5761298b6129a6565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146129fd57600080fd5b5056fea264697066735822122074303989d423d4c312fcb6f5e6c39906cf3b50d0862078f37f1746bf6509fd2064736f6c63430008040033";

type ColletiveClearFundProposalAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ColletiveClearFundProposalAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ColletiveClearFundProposalAdapterContract__factory extends ContractFactory {
  constructor(
    ...args: ColletiveClearFundProposalAdapterContractConstructorParams
  ) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ColletiveClearFundProposalAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<ColletiveClearFundProposalAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ColletiveClearFundProposalAdapterContract {
    return super.attach(address) as ColletiveClearFundProposalAdapterContract;
  }
  override connect(
    signer: Signer
  ): ColletiveClearFundProposalAdapterContract__factory {
    return super.connect(
      signer
    ) as ColletiveClearFundProposalAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ColletiveClearFundProposalAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as ColletiveClearFundProposalAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ColletiveClearFundProposalAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ColletiveClearFundProposalAdapterContract;
  }
}
