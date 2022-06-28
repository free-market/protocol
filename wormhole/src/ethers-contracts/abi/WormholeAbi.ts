/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace Wormhole {
  export type GuardianSetStruct = {
    keys: string[];
    expiration_time: BigNumberish;
  };

  export type GuardianSetStructOutput = [string[], number] & {
    keys: string[];
    expiration_time: number;
  };

  export type ParsedVAAStruct = {
    version: BigNumberish;
    hash: BytesLike;
    guardian_set_index: BigNumberish;
    timestamp: BigNumberish;
    action: BigNumberish;
    payload: BytesLike;
  };

  export type ParsedVAAStructOutput = [
    number,
    string,
    number,
    number,
    number,
    string
  ] & {
    version: number;
    hash: string;
    guardian_set_index: number;
    timestamp: number;
    action: number;
    payload: string;
  };
}

export interface WormholeAbiInterface extends utils.Interface {
  functions: {
    "consumedVAAs(bytes32)": FunctionFragment;
    "getGuardianSet(uint32)": FunctionFragment;
    "guardian_set_expirity()": FunctionFragment;
    "guardian_set_index()": FunctionFragment;
    "guardian_sets(uint32)": FunctionFragment;
    "isWrappedAsset(address)": FunctionFragment;
    "lockAssets(address,uint256,bytes32,uint8,uint32,bool)": FunctionFragment;
    "lockETH(bytes32,uint8,uint32)": FunctionFragment;
    "parseAndVerifyVAA(bytes)": FunctionFragment;
    "submitVAA(bytes)": FunctionFragment;
    "wrappedAssetMaster()": FunctionFragment;
    "wrappedAssets(bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "consumedVAAs"
      | "getGuardianSet"
      | "guardian_set_expirity"
      | "guardian_set_index"
      | "guardian_sets"
      | "isWrappedAsset"
      | "lockAssets"
      | "lockETH"
      | "parseAndVerifyVAA"
      | "submitVAA"
      | "wrappedAssetMaster"
      | "wrappedAssets"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "consumedVAAs",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getGuardianSet",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "guardian_set_expirity",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "guardian_set_index",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "guardian_sets",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isWrappedAsset",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "lockAssets",
    values: [
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish,
      boolean
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "lockETH",
    values: [BytesLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "parseAndVerifyVAA",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "submitVAA",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "wrappedAssetMaster",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "wrappedAssets",
    values: [BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "consumedVAAs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getGuardianSet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "guardian_set_expirity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "guardian_set_index",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "guardian_sets",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isWrappedAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lockAssets", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "lockETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "parseAndVerifyVAA",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "submitVAA", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "wrappedAssetMaster",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "wrappedAssets",
    data: BytesLike
  ): Result;

  events: {
    "LogGuardianSetChanged(uint32,uint32)": EventFragment;
    "LogTokensLocked(uint8,uint8,uint8,bytes32,bytes32,bytes32,uint256,uint32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "LogGuardianSetChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LogTokensLocked"): EventFragment;
}

export interface LogGuardianSetChangedEventObject {
  oldGuardianIndex: number;
  newGuardianIndex: number;
}
export type LogGuardianSetChangedEvent = TypedEvent<
  [number, number],
  LogGuardianSetChangedEventObject
>;

export type LogGuardianSetChangedEventFilter =
  TypedEventFilter<LogGuardianSetChangedEvent>;

export interface LogTokensLockedEventObject {
  target_chain: number;
  token_chain: number;
  token_decimals: number;
  token: string;
  sender: string;
  recipient: string;
  amount: BigNumber;
  nonce: number;
}
export type LogTokensLockedEvent = TypedEvent<
  [number, number, number, string, string, string, BigNumber, number],
  LogTokensLockedEventObject
>;

export type LogTokensLockedEventFilter = TypedEventFilter<LogTokensLockedEvent>;

export interface WormholeAbi extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: WormholeAbiInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    consumedVAAs(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getGuardianSet(
      idx: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [Wormhole.GuardianSetStructOutput] & {
        gs: Wormhole.GuardianSetStructOutput;
      }
    >;

    guardian_set_expirity(overrides?: CallOverrides): Promise<[number]>;

    guardian_set_index(overrides?: CallOverrides): Promise<[number]>;

    guardian_sets(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[number] & { expiration_time: number }>;

    isWrappedAsset(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;

    lockAssets(
      asset: string,
      amount: BigNumberish,
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      refund_dust: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lockETH(
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    parseAndVerifyVAA(
      vaa: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [Wormhole.ParsedVAAStructOutput] & {
        parsed_vaa: Wormhole.ParsedVAAStructOutput;
      }
    >;

    submitVAA(
      vaa: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    wrappedAssetMaster(overrides?: CallOverrides): Promise<[string]>;

    wrappedAssets(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  consumedVAAs(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

  getGuardianSet(
    idx: BigNumberish,
    overrides?: CallOverrides
  ): Promise<Wormhole.GuardianSetStructOutput>;

  guardian_set_expirity(overrides?: CallOverrides): Promise<number>;

  guardian_set_index(overrides?: CallOverrides): Promise<number>;

  guardian_sets(arg0: BigNumberish, overrides?: CallOverrides): Promise<number>;

  isWrappedAsset(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  lockAssets(
    asset: string,
    amount: BigNumberish,
    recipient: BytesLike,
    target_chain: BigNumberish,
    nonce: BigNumberish,
    refund_dust: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lockETH(
    recipient: BytesLike,
    target_chain: BigNumberish,
    nonce: BigNumberish,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  parseAndVerifyVAA(
    vaa: BytesLike,
    overrides?: CallOverrides
  ): Promise<Wormhole.ParsedVAAStructOutput>;

  submitVAA(
    vaa: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  wrappedAssetMaster(overrides?: CallOverrides): Promise<string>;

  wrappedAssets(arg0: BytesLike, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    consumedVAAs(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    getGuardianSet(
      idx: BigNumberish,
      overrides?: CallOverrides
    ): Promise<Wormhole.GuardianSetStructOutput>;

    guardian_set_expirity(overrides?: CallOverrides): Promise<number>;

    guardian_set_index(overrides?: CallOverrides): Promise<number>;

    guardian_sets(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<number>;

    isWrappedAsset(arg0: string, overrides?: CallOverrides): Promise<boolean>;

    lockAssets(
      asset: string,
      amount: BigNumberish,
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      refund_dust: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    lockETH(
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    parseAndVerifyVAA(
      vaa: BytesLike,
      overrides?: CallOverrides
    ): Promise<Wormhole.ParsedVAAStructOutput>;

    submitVAA(vaa: BytesLike, overrides?: CallOverrides): Promise<void>;

    wrappedAssetMaster(overrides?: CallOverrides): Promise<string>;

    wrappedAssets(arg0: BytesLike, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "LogGuardianSetChanged(uint32,uint32)"(
      oldGuardianIndex?: null,
      newGuardianIndex?: null
    ): LogGuardianSetChangedEventFilter;
    LogGuardianSetChanged(
      oldGuardianIndex?: null,
      newGuardianIndex?: null
    ): LogGuardianSetChangedEventFilter;

    "LogTokensLocked(uint8,uint8,uint8,bytes32,bytes32,bytes32,uint256,uint32)"(
      target_chain?: null,
      token_chain?: null,
      token_decimals?: null,
      token?: BytesLike | null,
      sender?: BytesLike | null,
      recipient?: null,
      amount?: null,
      nonce?: null
    ): LogTokensLockedEventFilter;
    LogTokensLocked(
      target_chain?: null,
      token_chain?: null,
      token_decimals?: null,
      token?: BytesLike | null,
      sender?: BytesLike | null,
      recipient?: null,
      amount?: null,
      nonce?: null
    ): LogTokensLockedEventFilter;
  };

  estimateGas: {
    consumedVAAs(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getGuardianSet(
      idx: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    guardian_set_expirity(overrides?: CallOverrides): Promise<BigNumber>;

    guardian_set_index(overrides?: CallOverrides): Promise<BigNumber>;

    guardian_sets(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isWrappedAsset(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    lockAssets(
      asset: string,
      amount: BigNumberish,
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      refund_dust: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lockETH(
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    parseAndVerifyVAA(
      vaa: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    submitVAA(
      vaa: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    wrappedAssetMaster(overrides?: CallOverrides): Promise<BigNumber>;

    wrappedAssets(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    consumedVAAs(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getGuardianSet(
      idx: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    guardian_set_expirity(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    guardian_set_index(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    guardian_sets(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isWrappedAsset(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lockAssets(
      asset: string,
      amount: BigNumberish,
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      refund_dust: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lockETH(
      recipient: BytesLike,
      target_chain: BigNumberish,
      nonce: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    parseAndVerifyVAA(
      vaa: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    submitVAA(
      vaa: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    wrappedAssetMaster(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    wrappedAssets(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
