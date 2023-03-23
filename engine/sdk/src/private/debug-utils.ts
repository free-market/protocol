import type { ContractReceipt } from '@ethersproject/contracts'
import { StargateBridgeAction__factory } from '@freemarket/stargate-bridge'

export function getStargateBridgeParamsEvent(txReceipt: ContractReceipt): any {
  const iface = StargateBridgeAction__factory.createInterface()
  const eventTopic = iface.getEventTopic(
    iface.events['StargateBridgeParamsEvent(uint256,uint256,address,uint16,uint256,uint256,uint256,uint256,uint256,bytes)']
  )
  for (const log of txReceipt.logs) {
    if (log.topics[0] === eventTopic) {
      try {
        return iface.parseLog(log)
      } catch (e) {
        // ignore error
      }
    }
  }
  return null
}
