/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  GovernanceHelper,
  GovernanceHelperInterface,
} from "../../../contracts/helpers/GovernanceHelper";

const _abi = [
  {
    inputs: [],
    name: "DEFAULT_GOV_TOKEN_CFG",
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
    inputs: [],
    name: "ROLE_PREFIX",
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
] as const;

const _bytecode =
  "0x61020061003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100405760003560e01c80632a74e01f14610045578063ff91d7b914610060575b600080fd5b61004d6100a9565b6040519081526020015b60405180910390f35b61009c6040518060400160405280601081526020017f676f7665726e616e63652e726f6c652e0000000000000000000000000000000081525081565b6040516100579190610149565b6040518060400160405280601081526020017f676f7665726e616e63652e726f6c652e000000000000000000000000000000008152506040516020016100ef9190610108565b6040516020818303038152906040528051906020012081565b6000825161011a81846020870161019a565b7f64656661756c7400000000000000000000000000000000000000000000000000920191825250600701919050565b602081526000825180602084015261016881604085016020870161019a565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b60005b838110156101b557818101518382015260200161019d565b838111156101c4576000848401525b5050505056fea2646970667358221220e5afefe9b258745fe346f9643258788698e6f29e9a797f2dbfedae5724d7a40864736f6c63430008040033";

type GovernanceHelperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GovernanceHelperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GovernanceHelper__factory extends ContractFactory {
  constructor(...args: GovernanceHelperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<GovernanceHelper> {
    return super.deploy(overrides || {}) as Promise<GovernanceHelper>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): GovernanceHelper {
    return super.attach(address) as GovernanceHelper;
  }
  override connect(signer: Signer): GovernanceHelper__factory {
    return super.connect(signer) as GovernanceHelper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GovernanceHelperInterface {
    return new utils.Interface(_abi) as GovernanceHelperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GovernanceHelper {
    return new Contract(address, _abi, signerOrProvider) as GovernanceHelper;
  }
}
