
import { ADDRESS_ZERO } from '@freemarket/core';
import { ADDRCONFIG } from 'dns';
import { BigNumberish } from 'ethers';
import { AbiCoder } from 'ethers/lib/utils';

const defaultAbiCoder: AbiCoder = new AbiCoder();

function encodeDepositEthForStEthParams(minStEthToReceive: BigNumberish, referral : string = ADDRESS_ZERO): string {
  return defaultAbiCoder.encode(["uint256", "address"], [minStEthToReceive, referral])
}

export { encodeDepositEthForStEthParams }
