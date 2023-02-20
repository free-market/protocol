import { Provider, Web3Provider } from '@ethersproject/providers'
import BN from 'bn.js'
import { EIP1193Provider } from 'eip1193-provider'
import Web3 from 'web3'
import { AaveSupplyAction__factory, IAaveV3Pool__factory, WorkflowRunner__factory } from '../types/ethers-contracts'
import { ActionIds } from './actionIds'
export interface AaveSupplyActionArgs {
  onBehalfOf: string
}

export async function getATokenAddress(frontDoorAddress: string, reserveTokenAddress: string, provider: EIP1193Provider): Promise<string> {
  const ethersProvider = new Web3Provider(provider)
  const dstRunner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
  const dstAaveSupplyActionAddr = await dstRunner.getActionAddress(ActionIds.aaveSupply)
  const dstAaveSupplyAction = AaveSupplyAction__factory.connect(dstAaveSupplyActionAddr, ethersProvider)
  const dstAavePoolAddr = await dstAaveSupplyAction.poolAddress()
  const dstAavePool = IAaveV3Pool__factory.connect(dstAavePoolAddr, ethersProvider)
  const reserveData = await dstAavePool.getReserveData(reserveTokenAddress)
  return reserveData.aTokenAddress
}
