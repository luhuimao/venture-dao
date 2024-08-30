/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  CollectiveAllocationAdapterContract,
  CollectiveAllocationAdapterContractInterface,
} from "../../../../../contracts/collective/adapters/CollectiveAllocationAdapter.sol/CollectiveAllocationAdapterContract";

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
        internalType: "address",
        name: "proposer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "lps",
        type: "address[]",
      },
    ],
    name: "AllocateToken",
    type: "event",
  },
  {
    inputs: [],
    name: "PERCENTAGE_PRECISION",
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
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "proposerAddr",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "uint256[6]",
        name: "uint256Args",
        type: "uint256[6]",
      },
    ],
    name: "allocateProjectToken",
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
        name: "recipient",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "getInvestmentRewards",
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
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "proposerAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
    ],
    name: "getProposerBonus",
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
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "ifEligible",
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
        internalType: "address",
        name: "recepient",
        type: "address",
      },
    ],
    name: "isVestCreated",
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
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "vestCreated",
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
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "vestingInfos",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "created",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506120f1806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80636cb4e9eb1161005b5780636cb4e9eb1461013b5780637d15e7b914610182578063944120fb14610195578063e256888f146101a857600080fd5b80631190b0a61461008d57806324d1669d146100e257806340c508f8146100f7578063560dbdd714610118575b600080fd5b6100c861009b366004611ba5565b60026020908152600093845260408085208252928452828420905282529020805460019091015460ff1682565b604080519283529015156020830152015b60405180910390f35b6100f56100f0366004611cb4565b6101b7565b005b61010a610105366004611d60565b610e5a565b6040519081526020016100d9565b61012b610126366004611da0565b61135d565b60405190151581526020016100d9565b61012b610149366004611da0565b6001600160a01b039283166000908152600260209081526040808320948352938152838220929094168152925290206001015460ff1690565b61012b610190366004611d60565b611499565b61010a6101a3366004611d60565b6117ba565b61010a670de0b6b3a764000081565b6040516317ba7d8560e01b81527f72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a860048201526001600160a01b038616906317ba7d859060240160206040518083038186803b15801561021657600080fd5b505afa15801561022a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061024e9190611b89565b6001600160a01b0316336001600160a01b0316146102b35760405162461bcd60e51b815260206004820152600b60248201527f6163636573732064656e7900000000000000000000000000000000000000000060448201526064015b60405180910390fd5b61035160405180610200016040528060006001600160a01b0316815260200160006001600160a01b03168152602001600081526020016000815260200160008152602001600060ff16815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160006001600160a01b031681525090565b815161010082015260208201516101208201526040808301516101408301526060830151610160830152608083015161018083015260a08301516101a083015251632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab60048201526001600160a01b0387169063593e96b69060240160206040518083038186803b1580156103ee57600080fd5b505afa158015610402573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104269190611b89565b6001600160a01b0390811682526101008201516040516317ba7d8560e01b81527f3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db34600482015290918781169163dd62ed3e918a16906317ba7d859060240160206040518083038186803b15801561049c57600080fd5b505afa1580156104b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104d49190611b89565b6040516001600160e01b031960e084901b1681526001600160a01b03909116600482015230602482015260440160206040518083038186803b15801561051957600080fd5b505afa15801561052d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105519190611ec8565b101561059f5760405162461bcd60e51b815260206004820152601660248201527f696e73756666696369656e7420616c6c6f77616e63650000000000000000000060448201526064016102aa565b6040516317ba7d8560e01b81527f3b8222b84816150ff171ef9b3356ce3d250b8e7c01c09c0208949acc0880db3460048201526001600160a01b03808716916323b872dd918916906317ba7d859060240160206040518083038186803b15801561060857600080fd5b505afa15801561061c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106409190611b89565b6101008401516040516001600160e01b031960e085901b1681526001600160a01b0390921660048301523060248301526044820152606401602060405180830381600087803b15801561069257600080fd5b505af11580156106a6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106ca9190611c9a565b506040517f9283ae3a0000000000000000000000000000000000000000000000000000000081527f8b16fcc7f28e07601cf35dbe966264f4e6dba6686614b06b65a1cbacdd6721b56004820152670de0b6b3a7640000906001600160a01b03881690639283ae3a9060240160206040518083038186803b15801561074d57600080fd5b505afa158015610761573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107859190611ec8565b8261010001516107959190612023565b61079f9190612003565b6101c08201526101008101516107b890879086906117ba565b60e08201526101c081015115610944576040517ffd310d290000000000000000000000000000000000000000000000000000000081527f5460409b9aa4688f80c10b29c3d7ad16025f050f472a6882a45fa7bb9bd12fb160048201526001600160a01b0387169063fd310d299060240160206040518083038186803b15801561084057600080fd5b505afa158015610854573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108789190611b89565b6001600160a01b039081166101e083019081526040805180820182526101c08501518a85166000908152600260209081528482208a835281528482209551909616815293909452912054909182916108d09190611feb565b8152600060209182018190526001600160a01b03898116825260028352604080832088845284528083206101e08701519092168352908352908190208351815592909101516001909201805460ff1916921515929092179091556101c08201519082018051610940908390611feb565b9052505b846001600160a01b031663dd62ed3e30886001600160a01b03166317ba7d857fdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a6040518263ffffffff1660e01b81526004016109a291815260200190565b60206040518083038186803b1580156109ba57600080fd5b505afa1580156109ce573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f29190611b89565b6040516001600160e01b031960e085901b1681526001600160a01b0392831660048201529116602482015260440160206040518083038186803b158015610a3857600080fd5b505afa158015610a4c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a709190611ec8565b60608201819052610100820151610a8691611feb565b60808201526040516317ba7d8560e01b81527fdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a60048201526001600160a01b038681169163095ea7b3918916906317ba7d859060240160206040518083038186803b158015610af457600080fd5b505afa158015610b08573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b2c9190611b89565b60808401516040516001600160e01b031960e085901b1681526001600160a01b0390921660048301526024820152604401602060405180830381600087803b158015610b7757600080fd5b505af1158015610b8b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610baf9190611c9a565b506040516317ba7d8560e01b81527f8f5b4aabbdb8527d420a29cc90ae207773ad49b73c632c3cfd2f29eb8776f2ea60048201526001600160a01b038716906317ba7d859060240160206040518083038186803b158015610c0f57600080fd5b505afa158015610c23573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c479190611b89565b6001600160a01b03908116602083018190526040517f50d9e68800000000000000000000000000000000000000000000000000000000815291881660048301526000916350d9e6889060240160006040518083038186803b158015610cab57600080fd5b505afa158015610cbf573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610ce79190810190611be6565b90506001600160a01b03851615610dbb5760e082015115610dbb5760408051808201825260e08401516001600160a01b03808b166000908152600260209081528582208a83528152858220928b16825291909152929092205490918291610d4e9190611feb565b8152600060209182018190526001600160a01b038a811682526002835260408083208984528452808320918a168352908352908190208351815592909101516001909201805460ff19169215159290921790915560e08301519083018051610db7908390611feb565b9052505b81610100015182604001511115610e145760405162461bcd60e51b815260206004820152600f60248201527f3e7061796261636b20616d6f756e74000000000000000000000000000000000060448201526064016102aa565b7fb30991f84bbcadc6375188d275cc12036a829854c38fa1fb9bf1125fc45b08fe87858784604051610e499493929190611ee0565b60405180910390a150505050505050565b604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab600482015260009081906001600160a01b0386169063593e96b69060240160206040518083038186803b158015610ebe57600080fd5b505afa158015610ed2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ef69190611b89565b6040516317ba7d8560e01b81527f72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a860048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b158015610f5b57600080fd5b505afa158015610f6f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f939190611b89565b6040805160a0810182526000808252602082018190529181018290526060810182905260808101829052919250906040805160808101825260008082526020820181905291810182905260608101919091526040517f5cb752760000000000000000000000000000000000000000000000000000000081526001600160a01b038a811660048301526024820189905260009190861690635cb752769060440160006040518083038186803b15801561104a57600080fd5b505afa15801561105e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526110869190810190611db4565b50855190995093975093955092935060009250506001600160a01b0388169063faaf38b39061decd906110ba60018a612060565b6040516001600160e01b031960e086901b1681526001600160a01b039384166004820152929091166024830152604482015260640160206040518083038186803b15801561110757600080fd5b505afa15801561111b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061113f9190611e98565b6fffffffffffffffffffffffffffffffff1690506000876001600160a01b031663faaf38b38c866000015160018a6111779190612060565b6040516001600160e01b031960e086901b1681526001600160a01b039384166004820152929091166024830152604482015260640160206040518083038186803b1580156111c457600080fd5b505afa1580156111d8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111fc9190611e98565b6fffffffffffffffffffffffffffffffff1690506000670de0b6b3a76400008d6001600160a01b0316639283ae3a7f8b16fcc7f28e07601cf35dbe966264f4e6dba6686614b06b65a1cbacdd6721b56040518263ffffffff1660e01b815260040161126991815260200190565b60206040518083038186803b15801561128157600080fd5b505afa158015611295573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112b99190611ec8565b87606001516112c89190612023565b6112d29190612003565b905060006112e58e8689606001516117ba565b90506000818389606001516112fa9190612060565b6113049190612060565b9050841580611311575083155b8061131a575080155b156113335760009b505050505050505050505050611356565b8461133e8286612023565b6113489190612003565b9b5050505050505050505050505b9392505050565b6040516317ba7d8560e01b81527f15c9835cf5910308466ec9cbdb6a0be1b9ea161943cc4caf2457bc33d880f19760048201526000906001600160a01b038516906317ba7d859060240160206040518083038186803b1580156113bf57600080fd5b505afa1580156113d3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113f79190611b89565b6001600160a01b0316336001600160a01b0316146114575760405162461bcd60e51b815260206004820152600b60248201527f4163636573732064656e7900000000000000000000000000000000000000000060448201526064016102aa565b506001600160a01b039283166000908152600260209081526040808320948352938152838220929094168152925290206001908101805460ff19168217905590565b604051632c9f4b5b60e11b81527f3909e87234f428ccb8748126e2c93f66a62f92a70d315fa5803dec6362be07ab600482015260009081906001600160a01b0386169063593e96b69060240160206040518083038186803b1580156114fd57600080fd5b505afa158015611511573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115359190611b89565b6040516317ba7d8560e01b81527f72894213a5c7f56b36b2947fa6ea18963d6bb1a68746b46d7f552cca76e1a7a860048201529091506000906001600160a01b038716906317ba7d859060240160206040518083038186803b15801561159a57600080fd5b505afa1580156115ae573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115d29190611b89565b6040805160808101825260008082526020820181905291810182905260608101829052919250906040517f5cb752760000000000000000000000000000000000000000000000000000000081526001600160a01b03898116600483015260248201889052841690635cb752769060440160006040518083038186803b15801561165a57600080fd5b505afa15801561166e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526116969190810190611db4565b5085519097509495506000946001600160a01b038a16945063faaf38b393508c925090506116c5600188612060565b6040516001600160e01b031960e086901b1681526001600160a01b039384166004820152929091166024830152604482015260640160206040518083038186803b15801561171257600080fd5b505afa158015611726573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061174a9190611e98565b6fffffffffffffffffffffffffffffffff169050600081118061179957506001600160a01b03808a1660009081526002602090815260408083208b84528252808320938c168352929052205415155b156117ac57600195505050505050611356565b600095505050505050611356565b6040517fa230c5240000000000000000000000000000000000000000000000000000000081526001600160a01b0383811660048301526000919085169063a230c5249060240160206040518083038186803b15801561181857600080fd5b505afa15801561182c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118509190611c9a565b61185c57506000611356565b6040517f9283ae3a0000000000000000000000000000000000000000000000000000000081527f5336359c44e86b23d844644c110b45f50decf679c37f24a46bd2b399996328756004820152600090670de0b6b3a7640000906001600160a01b03871690639283ae3a9060240160206040518083038186803b1580156118e157600080fd5b505afa1580156118f5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119199190611ec8565b6119239085612023565b61192d9190612003565b95945050505050565b8051611941816120a3565b919050565b8051801515811461194157600080fd5b80516005811061194157600080fd5b600082601f830112611975578081fd5b815167ffffffffffffffff81111561198f5761198f61208d565b60206119a381601f19601f85011601611fba565b82815285828487010111156119b6578384fd5b835b838110156119d35785810183015182820184015282016119b8565b838111156119e357848385840101525b5095945050505050565b600060a082840312156119fe578081fd5b60405160a0810181811067ffffffffffffffff82111715611a2157611a2161208d565b604052905080611a3083611946565b81526020830151611a40816120a3565b8060208301525060408301516040820152606083015160608201526080830151611a69816120a3565b6080919091015292915050565b600060408284031215611a87578081fd5b6040516040810181811067ffffffffffffffff82111715611aaa57611aaa61208d565b604052825181526020928301519281019290925250919050565b60006101208284031215611ad6578081fd5b611ade611f4a565b90508151815260208201516020820152604082015160408201526060820151606082015260808201516080820152611b1860a08301611946565b60a0820152611b2960c08301611936565b60c082015260e082015167ffffffffffffffff80821115611b4957600080fd5b611b5585838601611965565b60e084015261010091508184015181811115611b7057600080fd5b611b7c86828701611965565b8385015250505092915050565b600060208284031215611b9a578081fd5b8151611356816120a3565b600080600060608486031215611bb9578182fd5b8335611bc4816120a3565b9250602084013591506040840135611bdb816120a3565b809150509250925092565b60006020808385031215611bf8578182fd5b825167ffffffffffffffff80821115611c0f578384fd5b818501915085601f830112611c22578384fd5b815181811115611c3457611c3461208d565b8060051b9150611c45848301611fba565b8181528481019084860184860187018a1015611c5f578788fd5b8795505b83861015611c8d5780519450611c78856120a3565b84835260019590950194918601918601611c63565b5098975050505050505050565b600060208284031215611cab578081fd5b61135682611946565b6000806000806000610140808789031215611ccd578384fd5b8635611cd8816120a3565b9550602087810135611ce9816120a3565b95506040880135611cf9816120a3565b945060608801359350609f88018913611d10578283fd5b611d18611f74565b8060808a018b858c011115611d2b578586fd5b8594505b6006851015611d4e578035835260019490940193918301918301611d2f565b50809450505050509295509295909350565b600080600060608486031215611d74578081fd5b8335611d7f816120a3565b92506020840135611d8f816120a3565b929592945050506040919091013590565b600080600060608486031215611bb9578081fd5b60008060008060008060008789036101e0811215611dd0578586fd5b6080811215611ddd578586fd5b50611de6611f97565b8851611df1816120a3565b8082525060208901516020820152604089015160408201526060890151611e17816120a3565b60608201529650611e2b8960808a016119ed565b955061012088015167ffffffffffffffff811115611e47578586fd5b611e538a828b01611ac4565b955050611e64896101408a01611a76565b9350611e736101808901611936565b92506101a08801519150611e8a6101c08901611956565b905092959891949750929550565b600060208284031215611ea9578081fd5b81516fffffffffffffffffffffffffffffffff81168114611356578182fd5b600060208284031215611ed9578081fd5b5051919050565b6000608082016001600160a01b0380881684526020878186015281871660408601526080606086015282865180855260a0870191508288019450855b81811015611f3a578551851683529483019491830191600101611f1c565b50909a9950505050505050505050565b604051610120810167ffffffffffffffff81118282101715611f6e57611f6e61208d565b60405290565b60405160c0810167ffffffffffffffff81118282101715611f6e57611f6e61208d565b6040516080810167ffffffffffffffff81118282101715611f6e57611f6e61208d565b604051601f8201601f1916810167ffffffffffffffff81118282101715611fe357611fe361208d565b604052919050565b60008219821115611ffe57611ffe612077565b500190565b60008261201e57634e487b7160e01b81526012600452602481fd5b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561205b5761205b612077565b500290565b60008282101561207257612072612077565b500390565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146120b857600080fd5b5056fea2646970667358221220286cd937a8f325e64bb9d0608afd15ceeef56e559854caf0dd78558e18b57c9d64736f6c63430008040033";

type CollectiveAllocationAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CollectiveAllocationAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CollectiveAllocationAdapterContract__factory extends ContractFactory {
  constructor(...args: CollectiveAllocationAdapterContractConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CollectiveAllocationAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<CollectiveAllocationAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CollectiveAllocationAdapterContract {
    return super.attach(address) as CollectiveAllocationAdapterContract;
  }
  override connect(
    signer: Signer
  ): CollectiveAllocationAdapterContract__factory {
    return super.connect(
      signer
    ) as CollectiveAllocationAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CollectiveAllocationAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as CollectiveAllocationAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CollectiveAllocationAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CollectiveAllocationAdapterContract;
  }
}
