/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  VintageVesting,
  VintageVestingInterface,
} from "../../../../contracts/vintage/adapters/VintageVesting";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "NotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "NotVestReceiver",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "ownerAmount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "recipientAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "toBentoBox",
        type: "bool",
      },
    ],
    name: "CancelVesting",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vestId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "start",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "cliffDuration",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "stepDuration",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "steps",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "cliffShares",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "stepShares",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "CreateVesting",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "LogUpdateOwner",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "toBentoBox",
        type: "bool",
      },
    ],
    name: "Withdraw",
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
        name: "recipientAddr",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "createVesting",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getRemainingPercentage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
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
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getVestIdByTokenId",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tokenIdToVestId",
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
        name: "vestId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "updateOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "vestId",
        type: "uint256",
      },
    ],
    name: "vestBalance",
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
    name: "vestIds",
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
    name: "vests",
    outputs: [
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "uint128",
        name: "claimed",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint32",
            name: "steps",
            type: "uint32",
          },
          {
            internalType: "uint128",
            name: "cliffShares",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "stepShares",
            type: "uint128",
          },
        ],
        internalType: "struct IVesting.StepInfo",
        name: "stepInfo",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint32",
            name: "start",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "end",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "cliffDuration",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "stepDuration",
            type: "uint32",
          },
        ],
        internalType: "struct IVesting.TimeInfo",
        name: "timeInfo",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "nftToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        internalType: "struct IVesting.VestNFTInfo",
        name: "nftInfo",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
        ],
        internalType: "struct IVesting.VestInfo",
        name: "vestInfo",
        type: "tuple",
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
        name: "vestId",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506001600255612c25806100256000396000f3fe6080604052600436106100b15760003560e01c806351def556116100695780637a4334e21161004e5780637a4334e2146101e2578063e256888f1461021d578063f3fef3a31461023957600080fd5b806351def5561461018f5780637192711f146101c257600080fd5b80632c29e1961161009a5780632c29e196146100ff5780633427dd67146101425780633ae9bc031461017a57600080fd5b806319f77171146100b65780632bcea736146100e9575b600080fd5b3480156100c257600080fd5b506100d66100d1366004612800565b610259565b6040519081526020015b60405180910390f35b3480156100f557600080fd5b506100d660025481565b34801561010b57600080fd5b506100d661011a366004612699565b6001600160a01b03919091166000908152600160209081526040808320938352929052205490565b34801561014e57600080fd5b506100d661015d366004612699565b600160209081526000928352604080842090915290825290205481565b61018d6101883660046127ae565b6104d6565b005b34801561019b57600080fd5b506101af6101aa366004612800565b610f9f565b6040516100e09796959493929190612943565b3480156101ce57600080fd5b5061018d6101dd366004612830565b6111d6565b3480156101ee57600080fd5b506102026101fd366004612699565b611287565b604080519384526020840192909252908201526060016100e0565b34801561022957600080fd5b506100d6670de0b6b3a764000081565b34801561024557600080fd5b5061018d6102543660046127ee565b611385565b600081815260208181526040808320815160e0810183528154815260018201546001600160801b0390811682860152600283015482850152835160608181018652600385015463ffffffff8082168452640100000000918290048516848a015260048701549094168388015281850192909252855160808181018852600587015480861683529384048516828a01526801000000000000000084048516828901526c01000000000000000000000000909304909316908301528201528251808401845260068301546001600160a01b0316815260078301549481019490945260a0808201949094528251938401909252600881018054859460c085019290918290829061036590612b2b565b80601f016020809104026020016040519081016040528092919081815260200182805461039190612b2b565b80156103de5780601f106103b3576101008083540402835291602001916103de565b820191906000526020600020905b8154815290600101906020018083116103c157829003601f168201915b505050505081526020016001820180546103f790612b2b565b80601f016020809104026020016040519081016040528092919081815260200182805461042390612b2b565b80156104705780601f1061044557610100808354040283529160200191610470565b820191906000526020600020905b81548152906001019060200180831161045357829003601f168201915b505050918352505060028201546001600160a01b03908116602080840191909152600384015482166040840152600490930154166060909101529152820151919250506001600160801b03166104c5826117f3565b6104cf9190612ae4565b9392505050565b6104de61229b565b6040516317ba7d8560e01b81527f99d271900d627893bad1d8649a7d7eb3501c339595ec52be94d222433d75560360048201526001600160a01b038516906317ba7d859060240160206040518083038186803b15801561053d57600080fd5b505afa158015610551573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610575919061267d565b6001600160a01b039081166101408301819052608083018190526040517f7d15e7b9000000000000000000000000000000000000000000000000000000008152868316600482015291851660248301526044820184905290637d15e7b99060640160206040518083038186803b1580156105ee57600080fd5b505afa158015610602573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106269190612794565b6106c35760405162461bcd60e51b815260206004820152604160248201527f56657374696e673a3a63726561746556657374696e673a3a526563697069656e60448201527f74206e6f7420656c696769626c65206f6620746869732070726f706f73616c4960648201527f6400000000000000000000000000000000000000000000000000000000000000608482015260a4015b60405180910390fd5b60808101516040517f6cb4e9eb0000000000000000000000000000000000000000000000000000000081526001600160a01b03868116600483015260248201859052858116604483015290911690636cb4e9eb9060640160206040518083038186803b15801561073257600080fd5b505afa158015610746573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061076a9190612794565b156107dd5760405162461bcd60e51b815260206004820152602760248201527f56657374696e673a3a63726561746556657374696e673a3a416c72656164792060448201527f637265617465640000000000000000000000000000000000000000000000000060648201526084016106ba565b6040516317ba7d8560e01b81527f0fd8cce4ef00a7a8c0c5f91194bc80f122deefe664dd2a2384687da62ab117d160048201526001600160a01b038516906317ba7d859060240160206040518083038186803b15801561083c57600080fd5b505afa158015610850573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610874919061267d565b6001600160a01b0390811660a083015260808201516040517f1190b0a60000000000000000000000000000000000000000000000000000000081528683166004820152602481018590528583166044820152911690631190b0a690606401604080518083038186803b1580156108e957600080fd5b505afa1580156108fd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610921919061285f565b5060e082015260a08101516040517f5cb752760000000000000000000000000000000000000000000000000000000081526001600160a01b0386811660048301526024820185905290911690635cb752769060440160006040518083038186803b15801561098e57600080fd5b505afa1580156109a2573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109ca91908101906126c4565b506101808a01526101608901819052604001511596508695506109fa945050505050575061016081015160800151155b80610a0c575061016081015160600151155b80610a1e575061016081015160c00151155b15610a6b5760405162461bcd60e51b815260206004820152601c60248201527f496e76616c69642056657374696e672054696d652053657474696e670000000060448201526064016106ba565b610a8c8482610180015160200151836101400151308560e001516000611923565b81526101608101516080810151606090910151610aa99190612ae4565b60c08083018290526101608301510151610ac291612a85565b61012082015261016081015160c0908101519082015111610ae65760016101208201525b80610160015160c001518160c001511115610b88578060c0015181610160015160c00151610b149190612b81565b610b385780610160015160c001518160c00151610b319190612a85565b6101208201525b8060c0015181610160015160c00151826101200151610b579190612a99565b1015610b885780610160015160c001518160c00151610b769190612a85565b610b81906001612a4e565b6101208201525b670de0b6b3a764000081610160015160a001518260e00151610baa9190612a99565b610bb49190612a85565b6001600160801b03166060820181905261012082015182519091610bd791612ae4565b610be19190612a85565b6001600160801b0316604082015260028054906000610bff83612b66565b9091555060208201526101808101516080015115610cef5761018081015160a001516040517f40d097c30000000000000000000000000000000000000000000000000000000081526001600160a01b038581166004830152909116906340d097c390602401602060405180830381600087803b158015610c7e57600080fd5b505af1158015610c92573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cb69190612818565b6101a0820181905261018082015160a001516001600160a01b031660009081526001602090815260408083208286015184529091529020555b60208181015160408051608080820183523382526001600160a01b03888116838701526101808701805190960151169282019290925292510151610e1392859160608201901515600114610d44576000610d4f565b85610180015160a001515b6001600160a01b03166001600160a01b0316815250604051806101200160405280866101200151815260200186606001516001600160801b0316815260200186604001516001600160801b031681526020018660e00151815260200186610160015160400151815260200186610160015160600151815260200186610160015160800151815260200186610160015160c001518152602001866101a00151815250856101800151608001518661016001516000015187610160015160200151611bd9565b60808101516040517f560dbdd70000000000000000000000000000000000000000000000000000000081526001600160a01b0386811660048301526024820185905285811660448301529091169063560dbdd790606401602060405180830381600087803b158015610e8457600080fd5b505af1158015610e98573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ebc9190612794565b50826001600160a01b031681602001517f4c51f0095be9553b8e5eadbc42f96ab0b0c6526566307069cfcbecc63ea41c5283610180015160200151846101600151604001518561016001516040015186610160015160800151610f1f9190612ae4565b61016087015160c0908101516101208901516060808b01516040808d015181516001600160a01b03909a168a5263ffffffff98891660208b015296881690890152928616908701529390931660808501526001600160801b0392831660a085015291169082015260e081018690526101000160405180910390a350505050565b60006020818152918152604090819020805460018201546002830154845160608082018752600386015463ffffffff80821684526001600160801b03640100000000928390048116858c015260048901548116858b01528951608081018b5260058a015480841682529384048316818d01526801000000000000000084048316818c01526c01000000000000000000000000909304909116928201929092528751808901895260068801546001600160a01b03168152600788015499810199909952875160a0810190985260088701805496999290951697939692959094919391908290829061108e90612b2b565b80601f01602080910402602001604051908101604052809291908181526020018280546110ba90612b2b565b80156111075780601f106110dc57610100808354040283529160200191611107565b820191906000526020600020905b8154815290600101906020018083116110ea57829003601f168201915b5050505050815260200160018201805461112090612b2b565b80601f016020809104026020016040519081016040528092919081815260200182805461114c90612b2b565b80156111995780601f1061116e57610100808354040283529160200191611199565b820191906000526020600020905b81548152906001019060200180831161117c57829003601f168201915b505050918352505060028201546001600160a01b039081166020830152600383015481166040830152600490920154909116606090910152905087565b6000828152602081905260409020600a8101546001600160a01b0316331461122a576040517f30cd747100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600a8101805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b03841690811790915560405184907fca0251ba80971adc7e92434b097ca40450b2a317013c51c5c5cb6ae74500bb0090600090a3505050565b60008080808080806112bc89896001600160a01b03919091166000908152600160209081526040808320938352929052205490565b905080156113765760008181526020819052604090206001810154600290910154670de0b6b3a7640000916112fc916001600160801b0390911690612ae4565b6113069190612a85565b60008281526020819052604090206002015490935061132e90670de0b6b3a764000090612a85565b600082815260208190526040902060028101546001909101549193509061135e906001600160801b031682612ae4565b611369906064612a99565b6113739190612a85565b93505b50919450925090509250925092565b6000818152602081905260409020600b81015460068201546001600160a01b0391821691161561149157600682015460078301546040517f6352211e000000000000000000000000000000000000000000000000000000008152600481019190915233916001600160a01b031690636352211e9060240160206040518083038186803b15801561141457600080fd5b505afa158015611428573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061144c919061267d565b6001600160a01b03161461148c576040517fe1c6117100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6114d3565b6001600160a01b03811633146114d3576040517fe1c6117100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60018201546040805160e081018252845481526001600160801b039283166020808301829052600287015483850152835160608181018652600389015463ffffffff80821684526401000000009182900489168486015260048b0154909816838801528186019290925285516080818101885260058b0154808a1683529384048916828601526801000000000000000084048916828901526c01000000000000000000000000909304909716908701528301949094528251808401845260068701546001600160a01b0316815260078701549481019490945260a080830194909452825193840190925260088501805460009461172c9392889260c08501929190829082906115e190612b2b565b80601f016020809104026020016040519081016040528092919081815260200182805461160d90612b2b565b801561165a5780601f1061162f5761010080835404028352916020019161165a565b820191906000526020600020905b81548152906001019060200180831161163d57829003601f168201915b5050505050815260200160018201805461167390612b2b565b80601f016020809104026020016040519081016040528092919081815260200182805461169f90612b2b565b80156116ec5780601f106116c1576101008083540402835291602001916116ec565b820191906000526020600020905b8154815290600101906020018083116116cf57829003601f168201915b505050918352505060028201546001600160a01b0390811660208301526003830154811660408301526004909201549091166060909101529052506117f3565b6117369190612ae4565b905080611744575050505050565b6001830180548291906000906117649084906001600160801b0316612a23565b82546001600160801b039182166101009390930a928302919092021990911617905550600c8301546117a59086906001600160a01b03163085856000612096565b600c8301546040516000815282916001600160a01b03169086907fff942d249898505febb2a9a00118e27567c084b9497d0aa3ba5e332c235b4f389060200160405180910390a45050505050565b608081015160408101519051600091829161180e9190612a66565b63ffffffff169050804210156118245750919050565b60006118308242612ae4565b9050600061186585606001516000015163ffffffff1686608001516060015163ffffffff16846118609190612a85565b612285565b60808601516020810151606091820151918801515192935063ffffffff169161188e9190612ab8565b6080870151604081015190516118a49190612a66565b6118ae9190612a66565b63ffffffff161180156118ce575084608001516020015163ffffffff1642115b156118e1575060608401515163ffffffff165b808560600151604001516001600160801b03166118fe9190612a99565b8560600151602001516001600160801b031661191a9190612a4e565b95945050505050565b6040516317ba7d8560e01b81527fdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a600482015260009081906001600160a01b038916906317ba7d859060240160206040518083038186803b15801561198757600080fd5b505afa15801561199b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119bf919061267d565b90508215611afb576040517fda5139ca0000000000000000000000000000000000000000000000000000000081526001600160a01b038881166004830152602482018690526000604483015282169063da5139ca9060640160206040518083038186803b158015611a2f57600080fd5b505afa158015611a43573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a679190612818565b6040517ff18d03cc0000000000000000000000000000000000000000000000000000000081526001600160a01b03898116600483015288811660248301528781166044830152606482018390529193509082169063f18d03cc90608401600060405180830381600087803b158015611ade57600080fd5b505af1158015611af2573d6000803e3d6000fd5b50505050611bce565b6001600160a01b03808216906302b9446c90891615611b1b576000611b1d565b855b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e084901b1681526001600160a01b03808c166004830152808b16602483015289166044820152606481018890526000608482015260a40160408051808303818588803b158015611b9157600080fd5b505af1158015611ba5573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190611bca919061288a565b9250505b509695505050505050565b6040805160e0810182528781526000602082015290810185600360200201518152602001604051806060016040528087600060098110611c2957634e487b7160e01b600052603260045260246000fd5b602002015163ffffffff16815260200187600160098110611c5a57634e487b7160e01b600052603260045260246000fd5b60200201516001600160801b0316815260200187600260098110611c8e57634e487b7160e01b600052603260045260246000fd5b60200201516001600160801b03168152508152602001604051806080016040528087600460098110611cd057634e487b7160e01b600052603260045260246000fd5b602002015163ffffffff16815260200187600560098110611d0157634e487b7160e01b600052603260045260246000fd5b602002015163ffffffff16815260200187600460098110611d3257634e487b7160e01b600052603260045260246000fd5b602002015160c0890151611d469190612ae4565b63ffffffff168152602001876007602002015163ffffffff16815250815260200160405180604001604052808615156001151514611d85576000611d8b565b60608901515b6001600160a01b03168152602001876008602002015181525081526020016040518060a0016040528085815260200184815260200188600060048110611de157634e487b7160e01b600052603260045260246000fd5b60200201516001600160a01b0316815260200188600160048110611e1557634e487b7160e01b600052603260045260246000fd5b60200201516001600160a01b0316815260200188600260048110611e4957634e487b7160e01b600052603260045260246000fd5b602090810291909101516001600160a01b039081169092529190925260008a815280825260409081902084518155848301516001820180546001600160801b039283167fffffffffffffffffffffffffffffffff00000000000000000000000000000000918216179091558684015160028401556060808801518051600386018054838a0151871664010000000090810273ffffffffffffffffffffffffffffffffffffffff1992831663ffffffff9586161717909255928801516004880180549190971695169490941790945560808901518051600587018054838b015199840151939095015187166c01000000000000000000000000027fffffffffffffffffffffffffffffffff00000000ffffffffffffffffffffffff9388166801000000000000000002939093167fffffffffffffffffffffffffffffffff0000000000000000ffffffffffffffff9988169096027fffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000909516919096161792909217959095169190911717905560a0850151805160068301805491909616931692909217909355810151600783015560c0830151805180519192600885019261201392849201906123a3565b50602082810151805161202c92600185019201906123a3565b50604082015160028201805473ffffffffffffffffffffffffffffffffffffffff199081166001600160a01b039384161790915560608401516003840180548316918416919091179055608090930151600490920180549093169116179055505050505050505050565b6040516317ba7d8560e01b81527fdfea78be99560632cc4c199ca1b0d68ffe0bbbb07b685976cefc8820374ac73a60048201526000906001600160a01b038816906317ba7d859060240160206040518083038186803b1580156120f857600080fd5b505afa15801561210c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612130919061267d565b905081156121c8576040517ff18d03cc0000000000000000000000000000000000000000000000000000000081526001600160a01b038781166004830152868116602483015285811660448301526064820185905282169063f18d03cc90608401600060405180830381600087803b1580156121ab57600080fd5b505af11580156121bf573d6000803e3d6000fd5b5050505061227c565b6040517f97da6d300000000000000000000000000000000000000000000000000000000081526001600160a01b0387811660048301528681166024830152858116604483015260006064830152608482018590528216906397da6d309060a4016040805180830381600087803b15801561224157600080fd5b505af1158015612255573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612279919061288a565b50505b50505050505050565b600081831061229457816104cf565b5090919050565b604051806101c00160405280600081526020016000815260200160006001600160801b0316815260200160006001600160801b0316815260200160006001600160a01b0316815260200160006001600160a01b031681526020016000815260200160008152602001600081526020016000815260200160006001600160a01b031681526020016123616040518060e00160405280606081526020016060815260200160008152602001600081526020016000815260200160008152602001600081525090565b81526040805160c08101825260008082526020828101829052928201819052606082018190526080820181905260a08201529101908152602001600081525090565b8280546123af90612b2b565b90600052602060002090601f0160209004810192826123d15760008555612417565b82601f106123ea57805160ff1916838001178555612417565b82800160010185558215612417579182015b828111156124175782518255916020019190600101906123fc565b50612423929150612427565b5090565b5b808211156124235760008155600101612428565b8051801515811461244c57600080fd5b919050565b600082601f830112612461578081fd5b815167ffffffffffffffff8082111561247c5761247c612bc1565b604051601f8301601f19908116603f011681019082821181831017156124a4576124a4612bc1565b816040528381528660208588010111156124bc578485fd5b6124cd846020830160208901612afb565b9695505050505050565b600060c082840312156124e8578081fd5b60405160c0810181811067ffffffffffffffff8211171561250b5761250b612bc1565b60405290508061251a8361243c565b8152602083015161252a81612bd7565b602082015260408381015190820152606083015161254781612bd7565b60608201526125586080840161243c565b608082015260a083015161256b81612bd7565b60a0919091015292915050565b600060808284031215612589578081fd5b6040516080810181811067ffffffffffffffff821117156125ac576125ac612bc1565b8060405250809150825181526020830151602082015260408301516040820152606083015160608201525092915050565b600060e082840312156125ee578081fd5b6125f66129fa565b9050815167ffffffffffffffff8082111561261057600080fd5b61261c85838601612451565b8352602084015191508082111561263257600080fd5b5061263f84828501612451565b60208301525060408201516040820152606082015160608201526080820151608082015260a082015160a082015260c082015160c082015292915050565b60006020828403121561268e578081fd5b81516104cf81612bd7565b600080604083850312156126ab578081fd5b82356126b681612bd7565b946020939093013593505050565b6000806000806000806000806000806102408b8d0312156126e3578586fd5b8a516126ee81612bd7565b809a505060208b0151985060408b0151975060608b0151965060808b015161271581612bd7565b60a08c015190965061272681612bd7565b60c08c01519095506005811061273a578485fd5b60e08c015190945067ffffffffffffffff811115612756578384fd5b6127628d828e016125dd565b9350506127738c6101008d016124d7565b91506127838c6101c08d01612578565b90509295989b9194979a5092959850565b6000602082840312156127a5578081fd5b6104cf8261243c565b6000806000606084860312156127c2578283fd5b83356127cd81612bd7565b925060208401356127dd81612bd7565b929592945050506040919091013590565b600080604083850312156126ab578182fd5b600060208284031215612811578081fd5b5035919050565b600060208284031215612829578081fd5b5051919050565b60008060408385031215612842578182fd5b82359150602083013561285481612bd7565b809150509250929050565b60008060408385031215612871578182fd5b825191506128816020840161243c565b90509250929050565b6000806040838503121561289c578182fd5b505080516020909101519092909150565b600081518084526128c5816020860160208601612afb565b601f01601f19169290920160200192915050565b6000815160a084526128ee60a08501826128ad565b90506020830151848203602086015261290782826128ad565b91505060408301516001600160a01b03808216604087015280606086015116606087015280608086015116608087015250508091505092915050565b60006101a08983526001600160801b03808a16602085015288604085015263ffffffff8089511660608601528160208a01511660808601528160408a01511660a08601528088511660c08601528060208901511660e0860152806040890151166101008601528060608901511661012086015250506129d961014084018680516001600160a01b03168252602090810151910152565b806101808401526129ec818401856128d9565b9a9950505050505050505050565b60405160e0810167ffffffffffffffff81118282101715612a1d57612a1d612bc1565b60405290565b60006001600160801b03808316818516808303821115612a4557612a45612b95565b01949350505050565b60008219821115612a6157612a61612b95565b500190565b600063ffffffff808316818516808303821115612a4557612a45612b95565b600082612a9457612a94612bab565b500490565b6000816000190483118215151615612ab357612ab3612b95565b500290565b600063ffffffff80831681851681830481118215151615612adb57612adb612b95565b02949350505050565b600082821015612af657612af6612b95565b500390565b60005b83811015612b16578181015183820152602001612afe565b83811115612b25576000848401525b50505050565b600181811c90821680612b3f57607f821691505b60208210811415612b6057634e487b7160e01b600052602260045260246000fd5b50919050565b6000600019821415612b7a57612b7a612b95565b5060010190565b600082612b9057612b90612bab565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612bec57600080fd5b5056fea26469706673582212204ee013246333dc90a338ab2a687ec7e8ea85ff63f6a2466987917bc0d83110e164736f6c63430008040033";

type VintageVestingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VintageVestingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VintageVesting__factory extends ContractFactory {
  constructor(...args: VintageVestingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<VintageVesting> {
    return super.deploy(overrides || {}) as Promise<VintageVesting>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): VintageVesting {
    return super.attach(address) as VintageVesting;
  }
  override connect(signer: Signer): VintageVesting__factory {
    return super.connect(signer) as VintageVesting__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VintageVestingInterface {
    return new utils.Interface(_abi) as VintageVestingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VintageVesting {
    return new Contract(address, _abi, signerOrProvider) as VintageVesting;
  }
}
