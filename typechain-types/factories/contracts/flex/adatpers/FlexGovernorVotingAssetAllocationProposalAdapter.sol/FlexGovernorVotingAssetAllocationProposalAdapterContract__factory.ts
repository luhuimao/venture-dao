/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  FlexGovernorVotingAssetAllocationProposalAdapterContract,
  FlexGovernorVotingAssetAllocationProposalAdapterContractInterface,
} from "../../../../../contracts/flex/adatpers/FlexGovernorVotingAssetAllocationProposalAdapter.sol/FlexGovernorVotingAssetAllocationProposalAdapterContract";

const _abi = [
  {
    inputs: [],
    name: "ADAPTER_NOT_FUND",
    type: "error",
  },
  {
    inputs: [],
    name: "INVALID_GOVERNOR",
    type: "error",
  },
  {
    inputs: [],
    name: "INVALID_PARAMS",
    type: "error",
  },
  {
    inputs: [],
    name: "PROPOSAL_ALREADY_PROCESSED",
    type: "error",
  },
  {
    inputs: [],
    name: "PROPOSAL_HAS_NOT_BEEN_VOTED_ON_YET",
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
        internalType: "address[]",
        name: "governors",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "allocations",
        type: "uint256[]",
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
          "enum FlexGovernorVotingAssetAllocationProposalAdapterContract.ProposalState",
        name: "state",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "allVotingWeight",
        type: "uint128",
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
        name: "voteResult",
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
        name: "",
        type: "address",
      },
    ],
    name: "ongoingProposal",
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
        components: [
          {
            internalType: "uint256[]",
            name: "allocs",
            type: "uint256[]",
          },
        ],
        internalType:
          "struct FlexGovernorVotingAssetAllocationProposalAdapterContract.VotingAllocation",
        name: "allocs",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address[]",
            name: "governors",
            type: "address[]",
          },
        ],
        internalType:
          "struct FlexGovernorVotingAssetAllocationProposalAdapterContract.VotingGovernor",
        name: "govs",
        type: "tuple",
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
          "enum FlexGovernorVotingAssetAllocationProposalAdapterContract.ProposalState",
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
        internalType: "address[]",
        name: "govs",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "allocs",
        type: "uint256[]",
      },
    ],
    name: "submitProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50612db4806100206000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c80638ecf7720116100505780638ecf7720146100c85780639573167d146100eb578063fde92fcf1461010057600080fd5b80635cb752761461006c57806362e86df51461009a575b600080fd5b61007f61007a36600461286d565b610113565b60405161009196959493929190612afd565b60405180910390f35b6100ba6100a836600461266a565b60016020526000908152604090205481565b604051908152602001610091565b6100db6100d63660046127b5565b610217565b6040519015158152602001610091565b6100fe6100f936600461286d565b6102b6565b005b6100fe61010e3660046127ed565b610722565b6000602081815292815260408082208452918152819020805482516001830180548087028301860186529582018681526001600160a01b039093169593949193909284929091849184018282801561018a57602002820191906000526020600020905b815481526020019060010190808311610176575b5050509190925250506040805160028501805460208181028401850185528301818152959695929450909284929184918401828280156101f357602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116101d5575b50505091909252505050600382015460048301546005909301549192909160ff1686565b6040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b0382811660048301526000919084169063a230c5249060240160206040518083038186803b15801561027557600080fd5b505afa158015610289573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ad9190612770565b90505b92915050565b6001600160a01b0382166000818152602081815260408083208584529091529081902090517ff941f69100000000000000000000000000000000000000000000000000000000815290919063f941f69190610318908590600290600401612b90565b60206040518083038186803b15801561033057600080fd5b505afa158015610344573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103689190612770565b1561039f576040517f35153ac400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040516317ba7d8560e01b81527f0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba760048201526000906001600160a01b038516906317ba7d859060240160206040518083038186803b15801561040157600080fd5b505afa158015610415573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610439919061268d565b90506001600160a01b03811661047b576040517f5d78cd3c00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040517f76225e730000000000000000000000000000000000000000000000000000000081526001600160a01b0385811660048301526024820185905260009182918291908516906376225e7390604401606060405180830381600087803b1580156104e657600080fd5b505af11580156104fa573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061051e9190612898565b9194509250905060006105318888610f62565b6040517f30490e91000000000000000000000000000000000000000000000000000000008152600481018990529091506001600160a01b038916906330490e9190602401600060405180830381600087803b15801561058f57600080fd5b505af11580156105a3573d6000803e3d6000fd5b50600292506105b0915050565b8460058111156105d057634e487b7160e01b600052602160045260246000fd5b141561060b5760058601805460ff191660011790556105ef8888611222565b6005860180546002919060ff19166001835b02179055506106a5565b600384600581111561062d57634e487b7160e01b600052602160045260246000fd5b14806106585750600184600581111561065657634e487b7160e01b600052602160045260246000fd5b145b15610673576005860180546003919060ff1916600183610601565b6040517fe2489e3300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b7f7ab29e6deeb60f3b76461422909b7ae5bda1be890b270b70c56a32d54cd2a45688888860050160009054906101000a900460ff168487878a60058111156106fd57634e487b7160e01b600052602160045260246000fd5b6040516107109796959493929190612aa3565b60405180910390a15050505050505050565b84600061072e82611419565b90508661073b8133611703565b858414610774576040517f6a9c3ed500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61077f888888611777565b876001600160a01b03166383b8e61e6040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156107ba57600080fd5b505af11580156107ce573d6000803e3d6000fd5b5050505060006108798960c01b6108548b6001600160a01b031663be29984e6040518163ffffffff1660e01b815260040160206040518083038186803b15801561081757600080fd5b505afa15801561082b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061084f9190612901565b6118af565b60405160200161086592919061297e565b604051602081830303815290604052611a05565b604051634941d71d60e11b81527f9876c0f0505bfb2b1c38d3bbd25ba13159172cd0868972d76927723f5a9480fc60048201529091506000906001600160a01b038b1690639283ae3a9060240160206040518083038186803b1580156108de57600080fd5b505afa1580156108f2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109169190612901565b6109209042612c32565b90506040518060c00160405280336001600160a01b0316815260200160405180602001604052808c8c905067ffffffffffffffff81111561097157634e487b7160e01b600052604160045260246000fd5b60405190808252806020026020018201604052801561099a578160200160208202803683370190505b50815250815260200160405180602001604052808c8c905067ffffffffffffffff8111156109d857634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610a01578160200160208202803683370190505b509052815242602082015260408101839052606001600090526001600160a01b038b811660009081526020818152604080832087845282529091208351815473ffffffffffffffffffffffffffffffffffffffff19169316929092178255828101518051805191926001850192610a7b928492019061253e565b5050506040820151805180516002840191610a9b91839160200190612589565b505050606082015181600301556080820151816004015560a08201518160050160006101000a81548160ff02191690836003811115610aea57634e487b7160e01b600052602160045260246000fd5b021790555090505060005b60ff8116891115610c495787878260ff16818110610b2357634e487b7160e01b600052603260045260246000fd5b6001600160a01b038e166000908152602081815260408083208984528252909120600101805492909102939093013592915060ff8416908110610b7657634e487b7160e01b600052603260045260246000fd5b600091825260209091200155898960ff8316818110610ba557634e487b7160e01b600052603260045260246000fd5b9050602002016020810190610bba919061266a565b6001600160a01b038c166000908152602081815260408083208784529091529020600201805460ff8416908110610c0157634e487b7160e01b600052603260045260246000fd5b6000918252602090912001805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b039290921691909117905580610c4181612cda565b915050610af5565b506001600160a01b038a16600081815260016020526040808220859055516317ba7d8560e01b81527f0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba760048201529091906317ba7d859060240160206040518083038186803b158015610cbb57600080fd5b505afa158015610ccf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cf3919061268d565b6040517fb73dc389000000000000000000000000000000000000000000000000000000008152600481018590529091506001600160a01b038c169063b73dc38990602401600060405180830381600087803b158015610d5157600080fd5b505af1158015610d65573d6000803e3d6000fd5b50506040516317ba7d8560e01b81527f0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba760048201526001600160a01b038e16925063815a2bf49150859083906317ba7d859060240160206040518083038186803b158015610dd257600080fd5b505afa158015610de6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e0a919061268d565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b16815260048101929092526001600160a01b03166024820152604401600060405180830381600087803b158015610e6957600080fd5b505af1158015610e7d573d6000803e3d6000fd5b5050604080516020810182526000815290517f2b0974d00000000000000000000000000000000000000000000000000000000081526001600160a01b0385169350632b0974d09250610ed6918f91889190600401612bb4565b600060405180830381600087803b158015610ef057600080fd5b505af1158015610f04573d6000803e3d6000fd5b505050507f1a430b52b7d2c175591f9e71d42ec16859629de97bdb96f0513d7dc639159f4a8b848c8c8c8c88604051610f4397969594939291906129ec565b60405180910390a150505050610f598282611a21565b50505050505050565b600080610f6e84611a2c565b6040516317ba7d8560e01b81527f0d479c38716a0298633b1dbf1ce145a3fbd1d79ca4527de172afc3bad04a2ba7600482015290915060009081906001600160a01b038716906317ba7d859060240160206040518083038186803b158015610fd557600080fd5b505afa158015610fe9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061100d919061268d565b905060005b83518160ff16101561121757816001600160a01b03166324a2cceb8888878560ff168151811061105257634e487b7160e01b600052603260045260246000fd5b60200260200101516040518463ffffffff1660e01b8152600401611096939291906001600160a01b0393841681526020810192909252909116604082015260600190565b60206040518083038186803b1580156110ae57600080fd5b505afa1580156110c2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110e69190612770565b156111c457816001600160a01b03166391d2fd538888878560ff168151811061111f57634e487b7160e01b600052603260045260246000fd5b60200260200101516040518463ffffffff1660e01b8152600401611163939291906001600160a01b0393841681526020810192909252909116604082015260600190565b60206040518083038186803b15801561117b57600080fd5b505afa15801561118f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111b391906128d1565b6111bd9084612bfe565b9250611205565b6111f887858360ff16815181106111eb57634e487b7160e01b600052603260045260246000fd5b6020026020010151611aa3565b6112029084612bfe565b92505b8061120f81612cda565b915050611012565b509095945050505050565b6001600160a01b0382166000908152602081815260408083208484529091529020600281015415611414576040516317ba7d8560e01b81527f37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e60048201526000906001600160a01b038516906317ba7d859060240160206040518083038186803b1580156112af57600080fd5b505afa1580156112c3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112e7919061268d565b905060005b600283015460ff8216101561141157816001600160a01b0316635f15b1d986856002016000018460ff168154811061133457634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001870180546001600160a01b039092169160ff871690811061137357634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546040517fffffffff0000000000000000000000000000000000000000000000000000000060e086901b1681526001600160a01b0393841660048201529290911660248301526044820152606401600060405180830381600087803b1580156113e657600080fd5b505af11580156113fa573d6000803e3d6000fd5b50505050808061140990612cda565b9150506112ec565b50505b505050565b6040805160808101825260008082526020820181905291810182905260608101919091525a81600001818152505043826001600160a01b031663b21634826040518163ffffffff1660e01b815260040160206040518083038186803b15801561148157600080fd5b505afa158015611495573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114b99190612901565b1415611526576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f7265656e7472616e63792067756172640000000000000000000000000000000060448201526064015b60405180910390fd5b816001600160a01b03166310fdb0a26040518163ffffffff1660e01b8152600401600060405180830381600087803b15801561156157600080fd5b505af1158015611575573d6000803e3d6000fd5b50506040517f72c6838f0000000000000000000000000000000000000000000000000000000081527f1f2fd42ad6a6cacd573c4b212beb7a4e2499ad45d742a65337097f130e71daff6004820152600092506001600160a01b03851691506372c6838f9060240160206040518083038186803b1580156115f457600080fd5b505afa158015611608573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061162c919061268d565b90506001600160a01b03811661164857600060208301526116fd565b6001600160a01b038181166060840181905283516040517f43a8a3f1000000000000000000000000000000000000000000000000000000008152928616600484015260248301526000918291906343a8a3f190604401604080518083038186803b1580156116b557600080fd5b505afa1580156116c9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116ed919061278a565b9015156020860152604085015250505b50919050565b61170d8282610217565b611773576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600c60248201527f6f6e6c79476f7665726e6f720000000000000000000000000000000000000000604482015260640161151d565b5050565b80156114145760005b60ff81168211156118a957836001600160a01b031663a230c52484848460ff168181106117bd57634e487b7160e01b600052603260045260246000fd5b90506020020160208101906117d2919061266a565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e084901b1681526001600160a01b03909116600482015260240160206040518083038186803b15801561182957600080fd5b505afa15801561183d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118619190612770565b611897576040517f24acff8400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b806118a181612cda565b915050611780565b50505050565b6060816118ef57505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b8115611919578061190381612ca1565b91506119129050600a83612c4a565b91506118f3565b60008167ffffffffffffffff81111561194257634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f19166020018201604052801561196c576020820181803683370190505b5090505b84156119fd57611981600183612c5e565b915061198e600a86612cfa565b611999906030612c32565b60f81b8183815181106119bc57634e487b7160e01b600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506119f6600a86612c4a565b9450611970565b949350505050565b6000815160001415611a1957506000919050565b506020015190565b611773828233612308565b6060816001600160a01b031663a6f636416040518163ffffffff1660e01b815260040160006040518083038186803b158015611a6757600080fd5b505afa158015611a7b573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102b091908101906126a9565b604051634941d71d60e11b81527f75b7d343967750d1f6c15979b7559cea8be22ff1a06a51681b9cbef0d2fff4fe600482015260009081906001600160a01b03851690639283ae3a9060240160206040518083038186803b158015611b0757600080fd5b505afa158015611b1b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b3f9190612901565b604051634941d71d60e11b81527f18ef0b57fe939edb640a200fdf533493bd8f26a274151543a109b64c857e20f360048201529091506000906001600160a01b03861690639283ae3a9060240160206040518083038186803b158015611ba457600080fd5b505afa158015611bb8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bdc9190612901565b6040516317ba7d8560e01b81527f37cbe06c1044f98864ea25736326bc1d488e24e5e23781ea2ad64c4069cb9e6e60048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b158015611c4157600080fd5b505afa158015611c55573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c79919061268d565b604051634941d71d60e11b81527f77b1580d1632c74a32483c26a7156260a89ae4138b020ea7d09b0dcf24f1ea2460048201529091506000906001600160a01b03881690639283ae3a9060240160206040518083038186803b158015611cde57600080fd5b505afa158015611cf2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d169190612901565b6040517ffd310d290000000000000000000000000000000000000000000000000000000081527fb5a1ad3f04728d7c38547e3d43006a1ec090a02fce04bbb1d0ee4519a1921e5760048201529091506000906001600160a01b0389169063fd310d299060240160206040518083038186803b158015611d9457600080fd5b505afa158015611da8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611dcc919061268d565b90508360011415611fe957600085611e73576040516370a0823160e01b81526001600160a01b038981166004830152670de0b6b3a764000091908416906370a082319060240160206040518083038186803b158015611e2a57600080fd5b505afa158015611e3e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e629190612901565b611e6c9190612c4a565b9050611f80565b8560011415611ef6576040516370a0823160e01b81526001600160a01b0389811660048301528316906370a08231906024015b60206040518083038186803b158015611ebe57600080fd5b505afa158015611ed2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e6c9190612901565b8560021415611f3257604051627eeac760e11b81526001600160a01b0389811660048301526024820185905283169062fdd58e90604401611ea6565b8560031415611f71576040516329b6517360e21b81526001600160a01b038a81166004830152898116602483015285169063a6d945cc90604401611ea6565b600096505050505050506102b0565b60008111611f9757600096505050505050506102b0565b677fffffffffffffff8110611fb557603296505050505050506102b0565b6000611fd0611fcb611fc68461240d565b61242b565b612522565b67ffffffffffffffff1697506102b09650505050505050565b836002141561215b57600085612090576040516370a0823160e01b81526001600160a01b038981166004830152600091908416906370a08231906024015b60206040518083038186803b15801561203f57600080fd5b505afa158015612053573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906120779190612901565b11612083576000612086565b60015b60ff16905061214e565b85600114156120cb576040516370a0823160e01b81526001600160a01b038981166004830152600091908416906370a0823190602401612027565b856002141561210b57604051627eeac760e11b81526001600160a01b038981166004830152602482018590526000919084169062fdd58e90604401612027565b8560031415611f71576040516329b6517360e21b81526001600160a01b038a8116600483015289811660248301526000919086169063a6d945cc90604401612027565b95506102b0945050505050565b836122fa576000856121fc576040516370a0823160e01b81526001600160a01b038981166004830152670de0b6b3a764000091908416906370a082319060240160206040518083038186803b1580156121b357600080fd5b505afa1580156121c7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906121eb9190612901565b6121f59190612c4a565b905061214e565b856001141561227f576040516370a0823160e01b81526001600160a01b0389811660048301528316906370a08231906024015b60206040518083038186803b15801561224757600080fd5b505afa15801561225b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906121f59190612901565b85600214156122bb57604051627eeac760e11b81526001600160a01b0389811660048301526024820185905283169062fdd58e9060440161222f565b8560031415611f71576040516329b6517360e21b81526001600160a01b038a81166004830152898116602483015285169063a6d945cc9060440161222f565b6000955050505050506102b0565b8160200151156123be5781606001516001600160a01b0316635e5eb01384835a86516123349190612c5e565b60408088015190517fffffffff0000000000000000000000000000000000000000000000000000000060e087901b1681526001600160a01b03948516600482015293909216602484015260448301526064820152608401600060405180830381600087803b1580156123a557600080fd5b505af11580156123b9573d6000803e3d6000fd5b505050505b826001600160a01b031663d4f7af436040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156123f957600080fd5b505af1158015610f59573d6000803e3d6000fd5b6000677fffffffffffffff82111561242457600080fd5b5060401b90565b60008082600f0b1361243c57600080fd5b6000600f83900b68010000000000000000811261245b576040918201911d5b640100000000811261246f576020918201911d5b620100008112612481576010918201911d5b6101008112612492576008918201911d5b601081126124a2576004918201911d5b600481126124b2576002918201911d5b600281126124c1576001820191505b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0820160401b600f85900b607f8490031b6780000000000000005b60008113156112175790800260ff81901c8281029390930192607f011c9060011d6124fc565b60008082600f0b121561253457600080fd5b50600f0b60401d90565b828054828255906000526020600020908101928215612579579160200282015b8281111561257957825182559160200191906001019061255e565b506125859291506125eb565b5090565b828054828255906000526020600020908101928215612579579160200282015b82811115612579578251825473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b039091161782556020909201916001909101906125a9565b5b8082111561258557600081556001016125ec565b805161260b81612d66565b919050565b60008083601f840112612621578081fd5b50813567ffffffffffffffff811115612638578182fd5b6020830191508360208260051b850101111561265357600080fd5b9250929050565b8051801515811461260b57600080fd5b60006020828403121561267b578081fd5b813561268681612d66565b9392505050565b60006020828403121561269e578081fd5b815161268681612d66565b600060208083850312156126bb578182fd5b825167ffffffffffffffff808211156126d2578384fd5b818501915085601f8301126126e5578384fd5b8151818111156126f7576126f7612d50565b8060051b604051601f19603f8301168101818110858211171561271c5761271c612d50565b604052828152858101935084860182860187018a101561273a578788fd5b8795505b838610156127635761274f81612600565b85526001959095019493860193860161273e565b5098975050505050505050565b600060208284031215612781578081fd5b6102ad8261265a565b6000806040838503121561279c578081fd5b6127a58361265a565b9150602083015190509250929050565b600080604083850312156127c7578182fd5b82356127d281612d66565b915060208301356127e281612d66565b809150509250929050565b600080600080600060608688031215612804578081fd5b853561280f81612d66565b9450602086013567ffffffffffffffff8082111561282b578283fd5b61283789838a01612610565b9096509450604088013591508082111561284f578283fd5b5061285c88828901612610565b969995985093965092949392505050565b6000806040838503121561287f578182fd5b823561288a81612d66565b946020939093013593505050565b6000806000606084860312156128ac578283fd5b8351600681106128ba578384fd5b602085015160409095015190969495509392505050565b6000602082840312156128e2578081fd5b81516fffffffffffffffffffffffffffffffff81168114612686578182fd5b600060208284031215612912578081fd5b5051919050565b6004811061292957612929612d3a565b9052565b805160208084528151848201819052600092820190839060408701905b808310156129735783516001600160a01b0316825292840192600192909201919084019061294a565b509695505050505050565b7fffffffffffffffff000000000000000000000000000000000000000000000000831681527f476f7665726e6f7220416c6c6f636174696f6e202300000000000000000000006008820152600082516129de81601d850160208701612c75565b91909101601d019392505050565b6001600160a01b038881168252602080830189905260a0604084018190528301879052600091889160c08501845b8a811015612a41578435612a2d81612d66565b841682529382019390820190600101612a1a565b5085810360608701528781527f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff881115612a79578485fd5b8760051b935083898383013790920190910191825250608091909101919091529695505050505050565b6001600160a01b03881681526020810187905260e08101612ac76040830188612919565b6fffffffffffffffffffffffffffffffff861660608301528460808301528360a08301528260c083015298975050505050505050565b6001600160a01b038716815260c060208083018290528751918301819052815160e0840181905260009282019083906101008601905b80831015612b535783518252928401926001929092019190840190612b33565b508581036040870152612b66818b61292d565b945050505050846060830152836080830152612b8560a0830184612919565b979650505050505050565b8281526040810160038310612ba757612ba7612d3a565b8260208301529392505050565b6001600160a01b03841681528260208201526060604082015260008251806060840152612be8816080850160208701612c75565b601f01601f191691909101608001949350505050565b60006fffffffffffffffffffffffffffffffff808316818516808303821115612c2957612c29612d0e565b01949350505050565b60008219821115612c4557612c45612d0e565b500190565b600082612c5957612c59612d24565b500490565b600082821015612c7057612c70612d0e565b500390565b60005b83811015612c90578181015183820152602001612c78565b838111156118a95750506000910152565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612cd357612cd3612d0e565b5060010190565b600060ff821660ff811415612cf157612cf1612d0e565b60010192915050565b600082612d0957612d09612d24565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612d7b57600080fd5b5056fea264697066735822122076da85ec5027879e081969696220ded36c3a6fc8381fefd3c5e7c30fedb1882564736f6c63430008040033";

type FlexGovernorVotingAssetAllocationProposalAdapterContractConstructorParams =
  [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlexGovernorVotingAssetAllocationProposalAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlexGovernorVotingAssetAllocationProposalAdapterContract__factory extends ContractFactory {
  constructor(
    ...args: FlexGovernorVotingAssetAllocationProposalAdapterContractConstructorParams
  ) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlexGovernorVotingAssetAllocationProposalAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<FlexGovernorVotingAssetAllocationProposalAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(
    address: string
  ): FlexGovernorVotingAssetAllocationProposalAdapterContract {
    return super.attach(
      address
    ) as FlexGovernorVotingAssetAllocationProposalAdapterContract;
  }
  override connect(
    signer: Signer
  ): FlexGovernorVotingAssetAllocationProposalAdapterContract__factory {
    return super.connect(
      signer
    ) as FlexGovernorVotingAssetAllocationProposalAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlexGovernorVotingAssetAllocationProposalAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as FlexGovernorVotingAssetAllocationProposalAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlexGovernorVotingAssetAllocationProposalAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as FlexGovernorVotingAssetAllocationProposalAdapterContract;
  }
}
