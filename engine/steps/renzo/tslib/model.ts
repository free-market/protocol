
import { BigNumberish } from 'ethers';
import { AbiCoder } from 'ethers/lib/utils';

const defaultAbiCoder: AbiCoder = new AbiCoder();

function encodeDepositEthForEzEthParams(minEzEthToReceive: BigNumberish): string {
  return defaultAbiCoder.encode(["uint256"], [minEzEthToReceive])
}

export { encodeDepositEthForEzEthParams }
