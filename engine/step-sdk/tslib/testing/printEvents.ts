import { Log } from '@ethersproject/providers'
import { Interface } from '@ethersproject/abi'
import { getLogger } from '@freemarket/core'

const logger = getLogger('testing')

export function printEvents(logs: Log[], interfaces: Interface[]) {
  for (const log of logs) {
    for (const iface of interfaces) {
      try {
        const event = iface.parseLog(log)
        const args: string[] = []
        for (const key of Object.keys(event.args)) {
          if (Number.isNaN(parseInt(key))) {
            args.push(`${key}: ${event.args[key].toString()}`)
          }
        }
        logger.debug(`event ${event.name}(${args.join(', ')})`)
      } catch (e) {
        // ignore
      }
    }
  }
}
