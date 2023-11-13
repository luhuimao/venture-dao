/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  FlexInvestmentPaybackTokenAdapterContract,
  FlexInvestmentPaybackTokenAdapterContractInterface,
} from "../../../../../contracts/flex/adatpers/FlexFundingReturnTokenAdapter.sol/FlexInvestmentPaybackTokenAdapterContract";

const _abi = [
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
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "approvedInfos",
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
        name: "escrowAmount",
        type: "uint256",
      },
      {
        internalType: "contract DaoRegistry",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
      {
        internalType: "address",
        name: "erc20",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "escrowInvestmentPaybackToken",
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
    name: "escrowedReturnTokens",
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
        name: "erc20",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "setFundingApprove",
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
        name: "erc20",
        type: "address",
      },
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
      {
        internalType: "enum IFlexFunding.ProposalStatus",
        name: "state",
        type: "uint8",
      },
    ],
    name: "withdrawInvestmentPaybackToken",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610dda806100206000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c806373204f371161005057806373204f37146100db578063c9877e0f146100ee578063d705e0cd1461011f57600080fd5b8063416c5ddd1461006c5780637132e8a1146100b8575b600080fd5b6100a561007a366004610b99565b6000602081815294815260408082208652938152838120855291825282822090935291825290205481565b6040519081526020015b60405180910390f35b6100cb6100c6366004610c52565b610132565b60405190151581526020016100af565b6100cb6100e9366004610beb565b6104eb565b6100a56100fc366004610b58565b600160209081526000938452604080852082529284528284209052825290205481565b6100cb61012d366004610cd4565b610542565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda60048201526000906001600160a01b038716906317ba7d859060240160206040518083038186803b15801561019457600080fd5b505afa1580156101a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101cc9190610b35565b6001600160a01b0316336001600160a01b0316146102315760405162461bcd60e51b815260206004820152600760248201527f216163636573730000000000000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6001600160a01b038087166000908152600160209081526040808320898452825280832093871683529290522054806102ac5760405162461bcd60e51b815260206004820152600960248201527f21657363726f77656400000000000000000000000000000000000000000000006044820152606401610228565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015281906001600160a01b038716906370a082319060240160206040518083038186803b15801561030657600080fd5b505afa15801561031a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061033e9190610cbc565b101561038c5760405162461bcd60e51b815260206004820152600560248201527f2166756e640000000000000000000000000000000000000000000000000000006044820152606401610228565b60048360048111156103c7577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b146104145760405162461bcd60e51b815260206004820152600a60248201527f21736174697366696564000000000000000000000000000000000000000000006044820152606401610228565b6001600160a01b0387811660009081526001602090815260408083208a8452825280832088851680855292528083209290925590517fa9059cbb0000000000000000000000000000000000000000000000000000000081526004810191909152602481018390529086169063a9059cbb906044015b602060405180830381600087803b1580156104a357600080fd5b505af11580156104b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104db9190610c32565b5060019150505b95945050505050565b6001600160a01b0380851660009081526020818152604080832087845282528083203384528252808320938616835292905290812080548391908390610532908490610d2e565b9091555060019695505050505050565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda60048201526000906001600160a01b038616906317ba7d859060240160206040518083038186803b1580156105a457600080fd5b505afa1580156105b8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105dc9190610b35565b6001600160a01b0316336001600160a01b03161461063c5760405162461bcd60e51b815260206004820152600760248201527f21616363657373000000000000000000000000000000000000000000000000006044820152606401610228565b6040517f70a082310000000000000000000000000000000000000000000000000000000081526001600160a01b0385811660048301528791908516906370a082319060240160206040518083038186803b15801561069957600080fd5b505afa1580156106ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106d19190610cbc565b108061077557506040517fdd62ed3e0000000000000000000000000000000000000000000000000000000081526001600160a01b03858116600483015230602483015287919085169063dd62ed3e9060440160206040518083038186803b15801561073b57600080fd5b505afa15801561074f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107739190610cbc565b105b806107b457506001600160a01b038086166000908152602081815260408083208684528252808320888516845282528083209387168352929052205486115b156107c1575060006104e2565b6040517f23b872dd0000000000000000000000000000000000000000000000000000000081526001600160a01b038581166004830152306024830152604482018890528416906323b872dd90606401602060405180830381600087803b15801561082a57600080fd5b505af115801561083e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108629190610c32565b506001600160a01b03808616600090815260208181526040808320868452825280832088851684528252808320938716835292905290812080548892906108aa908490610d46565b90915550506001600160a01b0380861660009081526001602090815260408083208684528252808320938816835292905290812080548892906108ee908490610d2e565b92505081905550600086846001600160a01b031663dd62ed3e30896001600160a01b03166317ba7d857fb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc86040518263ffffffff1660e01b815260040161095691815260200190565b60206040518083038186803b15801561096e57600080fd5b505afa158015610982573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109a69190610b35565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b1681526001600160a01b0392831660048201529116602482015260440160206040518083038186803b158015610a0457600080fd5b505afa158015610a18573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a3c9190610cbc565b610a469190610d2e565b6040516317ba7d8560e01b81527fb0326f8dfc913f537596953a938551c86ac8fe0da74c9a8cd0ee660e627dccc860048201529091506001600160a01b038086169163095ea7b3918916906317ba7d859060240160206040518083038186803b158015610ab257600080fd5b505afa158015610ac6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aea9190610b35565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e084901b1681526001600160a01b03909116600482015260248101849052604401610489565b600060208284031215610b46578081fd5b8151610b5181610d8c565b9392505050565b600080600060608486031215610b6c578182fd5b8335610b7781610d8c565b9250602084013591506040840135610b8e81610d8c565b809150509250925092565b60008060008060808587031215610bae578081fd5b8435610bb981610d8c565b9350602085013592506040850135610bd081610d8c565b91506060850135610be081610d8c565b939692955090935050565b60008060008060808587031215610c00578384fd5b8435610c0b81610d8c565b9350602085013592506040850135610c2281610d8c565b9396929550929360600135925050565b600060208284031215610c43578081fd5b81518015158114610b51578182fd5b600080600080600060a08688031215610c69578081fd5b8535610c7481610d8c565b9450602086013593506040860135610c8b81610d8c565b92506060860135610c9b81610d8c565b9150608086013560058110610cae578182fd5b809150509295509295909350565b600060208284031215610ccd578081fd5b5051919050565b600080600080600060a08688031215610ceb578081fd5b853594506020860135610cfd81610d8c565b93506040860135610d0d81610d8c565b92506060860135610d1d81610d8c565b949793965091946080013592915050565b60008219821115610d4157610d41610d5d565b500190565b600082821015610d5857610d58610d5d565b500390565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6001600160a01b0381168114610da157600080fd5b5056fea26469706673582212208a9249d0004d9e351ab36a056cb75df5547424cc14047fcf4302f069722decbb64736f6c63430008040033";

type FlexInvestmentPaybackTokenAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlexInvestmentPaybackTokenAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlexInvestmentPaybackTokenAdapterContract__factory extends ContractFactory {
  constructor(
    ...args: FlexInvestmentPaybackTokenAdapterContractConstructorParams
  ) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlexInvestmentPaybackTokenAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<FlexInvestmentPaybackTokenAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FlexInvestmentPaybackTokenAdapterContract {
    return super.attach(address) as FlexInvestmentPaybackTokenAdapterContract;
  }
  override connect(
    signer: Signer
  ): FlexInvestmentPaybackTokenAdapterContract__factory {
    return super.connect(
      signer
    ) as FlexInvestmentPaybackTokenAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlexInvestmentPaybackTokenAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as FlexInvestmentPaybackTokenAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlexInvestmentPaybackTokenAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as FlexInvestmentPaybackTokenAdapterContract;
  }
}
