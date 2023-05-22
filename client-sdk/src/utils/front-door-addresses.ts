import { Chain } from '@freemarket/core'
import frontDoorAddressesJson from '@freemarket/runner/deployments/front-doors.json'

export function getFrontDoorAddress(chain: Chain): string {
  return (frontDoorAddressesJson as any)[chain]
}
