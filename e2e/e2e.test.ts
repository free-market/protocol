import { ActionIds } from "@fmp/evm/utils/actionIds";
import { AssetType } from "@fmp/evm/utils/AssetType";
import {
  ADDRESS_ZERO,
  FrontDoor__factory,
  StargateBridgeAction__factory,
  WorkflowRunner__factory,
} from "@fmp/evm";
import * as ethers from "ethers";

interface StargateBridgeActionArgs {
  dstActionAddress: string;
  dstUserAddress: string;
  dstChainId: string;
  srcPoolId: string;
  dstPoolId: string;
  dstGasForCall: string;
  dstNativeAmount: string;
  minAmountOut: string;
  minAmountOutIsPercent: boolean;
  dstWorkflow: string;
}
export function remove0x(s: string) {
  if (s.startsWith("0x")) {
    return s.slice(2);
  }
  return s;
}

export function hexByteLength(hex: string): number {
  return remove0x(hex).length / 2;
}

export function concatHex(hex1: string, hex2: string): string {
  return "0x" + remove0x(hex1) + remove0x(hex2);
}

function encodeStargateBridgeParams(params: StargateBridgeActionArgs) {
  const stargateSwapParams = ethers.utils.defaultAbiCoder.encode(
    [
      "address",
      "address",
      "uint16",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "bool",
    ],
    [
      params.dstActionAddress,
      params.dstUserAddress,
      params.dstChainId,
      params.srcPoolId,
      params.dstPoolId,
      params.dstGasForCall,
      params.dstNativeAmount,
      params.minAmountOut,
      params.minAmountOutIsPercent,
    ]
  );

  const lengthPrefix = ethers.utils.defaultAbiCoder.encode(
    ["uint256"],
    [hexByteLength(stargateSwapParams)]
  );
  return concatHex(
    lengthPrefix,
    concatHex(stargateSwapParams, params.dstWorkflow)
  );
}

jest.setTimeout(5 * 60 * 1000);

const fujiProvider = new ethers.providers.JsonRpcProvider(
  "https://api.avax-test.network/ext/bc/C/rpc",
  { name: "Avalanche Fuji C-Chain", chainId: 43113 }
);

if (process.env.FMP_TEST_PRIVATE_KEY == null) {
  throw new Error("e2e: FMP_TEST_PRIVATE_KEY required");
}

const fujiWallet = new ethers.Wallet(
  process.env.FMP_TEST_PRIVATE_KEY,
  fujiProvider
);

describe("WorkflowRunner", () => {
  it("runs a cross-chain workflow", async () => {
    const frontDoor = await new FrontDoor__factory(fujiWallet).deploy();
    await frontDoor.deployTransaction.wait();
    console.log("deployed front door");
    const runner = await new WorkflowRunner__factory(fujiWallet).deploy(
      frontDoor.address
    );
    await runner.deployTransaction.wait();
    console.log("deployed runner");
    expect(runner.address).toMatchSnapshot();

    const stargateBridgeAction = await new StargateBridgeAction__factory(
      fujiWallet
    ).deploy(
      // Stargate Fuji Router address
      // https://testnet.snowtrace.io/address/0x13093E05Eb890dfA6DacecBdE51d24DabAb2Faa1
      "0x13093E05Eb890dfA6DacecBdE51d24DabAb2Faa1"
    );

    await stargateBridgeAction.deployTransaction.wait();

    const setActionAddressTx = await runner.setActionAddress(
      ActionIds.stargateBridge,
      stargateBridgeAction.address
    );

    await setActionAddressTx.wait();

    // TODO: grab pool contract, then feeLibrary, etc.
    const minAmountOut = 4000000;

    const txResponse = await runner.executeWorkflow(
      {
        steps: [
          {
            actionId: ActionIds.stargateBridge,
            actionAddress: ADDRESS_ZERO,
            inputAssets: [
              {
                asset: {
                  assetType: AssetType.ERC20,
                  assetAddress: "0x4A0D1092E9df255cf95D72834Ea9255132782318",
                },
                amount: "5000000",
                amountIsPercent: false,
              },
            ],
            outputAssets: [
              {
                assetType: AssetType.ERC20,
                assetAddress: "0xDf0360Ad8C5ccf25095Aa97ee5F2785c8d848620",
              },
            ],
            args: encodeStargateBridgeParams({
              dstActionAddress: fujiWallet.address,
              dstUserAddress: "0x0",
              dstChainId: "10121",
              srcPoolId: "1",
              dstPoolId: "1",
              dstGasForCall: "0",
              dstNativeAmount: "0",
              minAmountOut: `${minAmountOut}`,
              minAmountOutIsPercent: false,
              dstWorkflow: "0xdeadbeef",
            }),
            nextStepIndex: 0,
          },
        ],
      },
      []
    );

    await txResponse.wait();

    console.log(txResponse.hash);

    // TODO: executeWorkflow
    // TODO: watch for sgReceive event on Ethereum Goerli
  });
});
