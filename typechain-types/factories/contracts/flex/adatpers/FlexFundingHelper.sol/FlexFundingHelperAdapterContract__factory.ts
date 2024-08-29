/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  FlexFundingHelperAdapterContract,
  FlexFundingHelperAdapterContractInterface,
} from "../../../../../contracts/flex/adatpers/FlexFundingHelper.sol/FlexFundingHelperAdapterContract";

const _abi = [
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
    name: "getDepositAmountLimit",
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
    name: "getFundRaiseTimes",
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
    name: "getInvestmentState",
    outputs: [
      {
        internalType: "enum IFlexFunding.ProposalStatus",
        name: "",
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
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "getInvestmentToken",
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
    ],
    name: "getMaxInvestmentAmount",
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
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
    ],
    name: "getfundRaiseType",
    outputs: [
      {
        internalType: "enum IFlexFunding.FundRaiseType",
        name: "",
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
        internalType: "bytes32",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isPriorityDepositer",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061188d806100206000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80636d3cc0401161005b5780636d3cc040146100fa57806380dc31411461011d578063b39f0a7914610130578063c3a8f0031461015157600080fd5b80630c8c9a5c146100825780631ebf58f9146100b25780636666c9bd146100d2575b600080fd5b610095610090366004611610565b610171565b6040516001600160a01b0390911681526020015b60405180910390f35b6100c56100c0366004611610565b6102aa565b6040516100a991906116ae565b6100e56100e0366004611610565b6103e1565b604080519283526020830191909152016100a9565b61010d61010836600461163b565b61052a565b60405190151581526020016100a9565b6100e561012b366004611610565b610a10565b61014361013e366004611610565b610b59565b6040519081526020016100a9565b61016461015f366004611610565b61100c565b6040516100a99190611694565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda600482015260009081906001600160a01b038516906317ba7d859060240160206040518083038186803b1580156101d557600080fd5b505afa1580156101e9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061020d9190611471565b604051632fd2666560e21b81526001600160a01b0386811660048301526024820186905291925060009183169063bf4999949060440160006040518083038186803b15801561025b57600080fd5b505afa15801561026f573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610297919081019061148d565b505094519b9a5050505050505050505050565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda600482015260009081906001600160a01b038516906317ba7d859060240160206040518083038186803b15801561030e57600080fd5b505afa158015610322573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103469190611471565b604051632fd2666560e21b81526001600160a01b0386811660048301526024820186905291925060009183169063bf4999949060440160006040518083038186803b15801561039457600080fd5b505afa1580156103a8573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526103d0919081019061148d565b509c9b505050505050505050505050565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda6004820152600090819081906001600160a01b038616906317ba7d859060240160206040518083038186803b15801561044757600080fd5b505afa15801561045b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061047f9190611471565b604051632fd2666560e21b81526001600160a01b0387811660048301526024820187905291925060009183169063bf4999949060440160006040518083038186803b1580156104cd57600080fd5b505afa1580156104e1573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610509919081019061148d565b50505050509350505050806060015181608001519350935050509250929050565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda600482015260009081906001600160a01b038616906317ba7d859060240160206040518083038186803b15801561058e57600080fd5b505afa1580156105a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105c69190611471565b604051632fd2666560e21b81526001600160a01b0387811660048301526024820187905291925060009183169063bf4999949060440160006040518083038186803b15801561061457600080fd5b505afa158015610628573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610650919081019061148d565b505050505093505050508060e00151600001511515600115151415610a025760e08101516020810151604082015160808301516060909301519192909160008460038111156106af57634e487b7160e01b600052602160045260246000fd5b14801561074f57506040517f70a082310000000000000000000000000000000000000000000000000000000081526001600160a01b0389811660048301528391908516906370a082319060240160206040518083038186803b15801561071457600080fd5b505afa158015610728573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061074c919061167c565b10155b156107635760019650505050505050610a09565b600184600381111561078557634e487b7160e01b600052602160045260246000fd5b14801561082557506040517f70a082310000000000000000000000000000000000000000000000000000000081526001600160a01b0389811660048301528391908516906370a082319060240160206040518083038186803b1580156107ea57600080fd5b505afa1580156107fe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610822919061167c565b10155b156108395760019650505050505050610a09565b600284600381111561085b57634e487b7160e01b600052602160045260246000fd5b14801561090057506040517efdd58e0000000000000000000000000000000000000000000000000000000081526001600160a01b0389811660048301526024820183905283919085169062fdd58e9060440160206040518083038186803b1580156108c557600080fd5b505afa1580156108d9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108fd919061167c565b10155b156109145760019650505050505050610a09565b600384600381111561093657634e487b7160e01b600052602160045260246000fd5b1480156109df57506040517fc56e1c3c0000000000000000000000000000000000000000000000000000000081526001600160a01b038b81166004830152602482018b9052898116604483015287169063c56e1c3c9060640160206040518083038186803b1580156109a757600080fd5b505afa1580156109bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109df91906115f6565b156109f35760019650505050505050610a09565b60009650505050505050610a09565b6000925050505b9392505050565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda6004820152600090819081906001600160a01b038616906317ba7d859060240160206040518083038186803b158015610a7657600080fd5b505afa158015610a8a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aae9190611471565b604051632fd2666560e21b81526001600160a01b0387811660048301526024820187905291925060009183169063bf4999949060440160006040518083038186803b158015610afc57600080fd5b505afa158015610b10573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610b38919081019061148d565b50505050509350505050806020015181604001519350935050509250929050565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda600482015260009081906001600160a01b038516906317ba7d859060240160206040518083038186803b158015610bbd57600080fd5b505afa158015610bd1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bf59190611471565b604051632fd2666560e21b81526001600160a01b0386811660048301526024820186905291925060009182919084169063bf4999949060440160006040518083038186803b158015610c4657600080fd5b505afa158015610c5a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610c82919081019061148d565b505050509450505092505060008083604001519050876001600160a01b0316639283ae3a7fda34ff95e06cbf2c9c32a559cd8aadd1a10104596417d62c03db2c1258df83d36040518263ffffffff1660e01b8152600401610ce591815260200190565b60206040518083038186803b158015610cfd57600080fd5b505afa158015610d11573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d35919061167c565b610ea8578260200151856001600160a01b031663b0e21e8a6040518163ffffffff1660e01b815260040160206040518083038186803b158015610d7757600080fd5b505afa158015610d8b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610daf919061167c565b6040517f9283ae3a0000000000000000000000000000000000000000000000000000000081527f64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a8760048201526001600160a01b038b1690639283ae3a9060240160206040518083038186803b158015610e2757600080fd5b505afa158015610e3b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e5f919061167c565b610e7190670de0b6b3a76400006117d9565b610e7b91906117d9565b610e8591906117d9565b610e9782670de0b6b3a764000061179c565b610ea1919061177c565b9150611001565b8260200151856001600160a01b031663b0e21e8a6040518163ffffffff1660e01b815260040160206040518083038186803b158015610ee657600080fd5b505afa158015610efa573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f1e919061167c565b610f2891906117d9565b6040517f9283ae3a0000000000000000000000000000000000000000000000000000000081527f64c49ee5084f4940c312104c41603e43791b03dad28152afd6eadb5b960a8a8760048201526001600160a01b038a1690639283ae3a9060240160206040518083038186803b158015610fa057600080fd5b505afa158015610fb4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fd8919061167c565b610fe29083611764565b610ff490670de0b6b3a764000061179c565b610ffe919061177c565b91505b509695505050505050565b6040516317ba7d8560e01b81527f7a8526bca00f0726b2fab8c3bfd5b00bfa84d07f111e48263b13de605eefcdda600482015260009081906001600160a01b038516906317ba7d859060240160206040518083038186803b15801561107057600080fd5b505afa158015611084573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110a89190611471565b604051632fd2666560e21b81526001600160a01b0386811660048301526024820186905291925060009183169063bf4999949060440160006040518083038186803b1580156110f657600080fd5b505afa15801561110a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052611132919081019061148d565b505092519b9a5050505050505050505050565b805161115081611832565b919050565b8051801515811461115057600080fd5b80516002811061115057600080fd5b80516005811061115057600080fd5b600082601f830112611193578081fd5b815167ffffffffffffffff8111156111ad576111ad61181c565b60206111c181601f19601f85011601611733565b82815285828487010111156111d4578384fd5b835b838110156111f15785810183015182820184015282016111d6565b8381111561120157848385840101525b5095945050505050565b6000610200828403121561121d578081fd5b604051610100810181811067ffffffffffffffff821117156112415761124161181c565b60405290508061125083611165565b81526020830151602082015260408301516040820152606083015160608201526080830151608082015261128660a08401611155565b60a08201526112988460c085016112b7565b60c08201526112ab84610160850161132a565b60e08201525092915050565b600060a082840312156112c8578081fd5b6112d06116c2565b905081516112dd8161184a565b8152602082015163ffffffff811681146112f657600080fd5b6020820152604082015161130981611832565b80604083015250606082015160608201526080820151608082015292915050565b600060a0828403121561133b578081fd5b6113436116c2565b905061134e82611155565b815260208201516112f68161184a565b60006040828403121561136f578081fd5b6040516040810181811067ffffffffffffffff821117156113925761139261181c565b604052825181526020928301519281019290925250919050565b600061012082840312156113be578081fd5b6113c66116eb565b9050815181526020820151602082015260408201516040820152606082015160608201526080820151608082015261140060a08301611155565b60a082015261141160c08301611145565b60c082015260e082015167ffffffffffffffff8082111561143157600080fd5b61143d85838601611183565b60e08401526101009150818401518181111561145857600080fd5b61146486828701611183565b8385015250505092915050565b600060208284031215611482578081fd5b8151610a0981611832565b6000806000806000806000806000898b036104808112156114ac578586fd5b8a516114b781611832565b9950610180601f1982018113156114cc578687fd5b6114d461170f565b91506114e260208d01611145565b825260408c0151602083015260608c0151604083015260808c0151606083015261150e60a08d01611155565b608083015261151f60c08d01611145565b60a083015260e08c015160c0830152610100808d015160e0840152610120808e0151828501526101409150818e01518185015250610160611561818f01611145565b82850152611570838f01611145565b9084015250506101a08b015190985067ffffffffffffffff811115611593578586fd5b61159f8c828d016113ac565b9750506115b08b6101c08c0161120b565b95506115c08b6103c08c0161135e565b94506104008a015193506104208a015192506115df6104408b01611174565b91506104608a015190509295985092959850929598565b600060208284031215611607578081fd5b610a0982611155565b60008060408385031215611622578182fd5b823561162d81611832565b946020939093013593505050565b60008060006060848603121561164f578081fd5b833561165a81611832565b925060208401359150604084013561167181611832565b809150509250925092565b60006020828403121561168d578081fd5b5051919050565b60208101600283106116a8576116a8611806565b91905290565b60208101600583106116a8576116a8611806565b60405160a0810167ffffffffffffffff811182821017156116e5576116e561181c565b60405290565b604051610120810167ffffffffffffffff811182821017156116e5576116e561181c565b604051610180810167ffffffffffffffff811182821017156116e5576116e561181c565b604051601f8201601f1916810167ffffffffffffffff8111828210171561175c5761175c61181c565b604052919050565b60008219821115611777576117776117f0565b500190565b60008261179757634e487b7160e01b81526012600452602481fd5b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156117d4576117d46117f0565b500290565b6000828210156117eb576117eb6117f0565b500390565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b038116811461184757600080fd5b50565b6004811061184757600080fdfea26469706673582212200f19e24255cab4d719aef276cefc735cdc7de00805452959bc0e3780f9d3cf3b64736f6c63430008040033";

type FlexFundingHelperAdapterContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlexFundingHelperAdapterContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlexFundingHelperAdapterContract__factory extends ContractFactory {
  constructor(...args: FlexFundingHelperAdapterContractConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlexFundingHelperAdapterContract> {
    return super.deploy(
      overrides || {}
    ) as Promise<FlexFundingHelperAdapterContract>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FlexFundingHelperAdapterContract {
    return super.attach(address) as FlexFundingHelperAdapterContract;
  }
  override connect(signer: Signer): FlexFundingHelperAdapterContract__factory {
    return super.connect(signer) as FlexFundingHelperAdapterContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlexFundingHelperAdapterContractInterface {
    return new utils.Interface(
      _abi
    ) as FlexFundingHelperAdapterContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlexFundingHelperAdapterContract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as FlexFundingHelperAdapterContract;
  }
}
