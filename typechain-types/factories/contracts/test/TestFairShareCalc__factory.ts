/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  TestFairShareCalc,
  TestFairShareCalcInterface,
} from "../../../contracts/test/TestFairShareCalc";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "units",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalUnits",
        type: "uint256",
      },
    ],
    name: "calculate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506102bc806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063e97cf88314610030575b600080fd5b61004361003e3660046101c0565b610055565b60405190815260200160405180910390f35b600061006284848461006c565b90505b9392505050565b6000808211610102576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f746f74616c556e697473206d7573742062652067726561746572207468616e2060448201527f300000000000000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b81831115610192576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602e60248201527f756e697473206d757374206265206c657373207468616e206f7220657175616c60448201527f20746f20746f74616c556e69747300000000000000000000000000000000000060648201526084016100f9565b8361019f57506000610065565b60006101ab8486610224565b90506101b783826101eb565b95945050505050565b6000806000606084860312156101d4578283fd5b505081359360208301359350604090920135919050565b60008261021f577f4e487b710000000000000000000000000000000000000000000000000000000081526012600452602481fd5b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610281577f4e487b710000000000000000000000000000000000000000000000000000000081526011600452602481fd5b50029056fea2646970667358221220edef61a5407796bd02666dad4080cbd5e1eb5ae14659522251d9242d837de14864736f6c63430008040033";

type TestFairShareCalcConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestFairShareCalcConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestFairShareCalc__factory extends ContractFactory {
  constructor(...args: TestFairShareCalcConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TestFairShareCalc> {
    return super.deploy(overrides || {}) as Promise<TestFairShareCalc>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TestFairShareCalc {
    return super.attach(address) as TestFairShareCalc;
  }
  override connect(signer: Signer): TestFairShareCalc__factory {
    return super.connect(signer) as TestFairShareCalc__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestFairShareCalcInterface {
    return new utils.Interface(_abi) as TestFairShareCalcInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestFairShareCalc {
    return new Contract(address, _abi, signerOrProvider) as TestFairShareCalc;
  }
}