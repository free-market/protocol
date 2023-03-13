import type { PartialDeep } from 'type-fest'
import lodashMerge from 'lodash.merge'

interface FreeMarketConfig {
  bridgeTimeoutSeconds: number
}

const defaultConfig = {
  bridgeTimeoutSeconds: 60 * 3,
}

let activeConfig = defaultConfig

export function getFreeMarketConfig(): FreeMarketConfig {
  return activeConfig
}

export function updateFreeMarketConfig(newConfigValues: PartialDeep<FreeMarketConfig>) {
  activeConfig = lodashMerge(activeConfig, newConfigValues)
}
