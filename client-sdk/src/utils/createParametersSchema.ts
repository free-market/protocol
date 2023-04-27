import z, { ZodTypeAny } from 'zod'
import type { Workflow } from '../model'
import type { ReadonlyDeep } from 'type-fest'
import rootLogger from 'loglevel'
import { getParameterSchema } from '@freemarket/core'

const log = rootLogger.getLogger('createParametersSchema')

export function createParametersSchema(workflow: ReadonlyDeep<Workflow>, excludeRemittances = true) {
  const params = excludeRemittances ? workflow.parameters?.filter(it => !it.name.startsWith('remittances.')) : workflow.parameters
  if (!params || params.length === 0) {
    log.debug(`workflow doesn't declare any parameters`)
    return null
  }

  const workflowArgsSchema: Record<string, ZodTypeAny> = {}
  for (const param of params) {
    const schema = getParameterSchema(param.type)
    workflowArgsSchema[param.name] = schema.describe(schema._def.description)
  }

  return z.object(workflowArgsSchema)
}
