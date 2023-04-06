import z, { ZodTypeAny } from 'zod'
import type { Workflow } from '../model'
import type { ReadonlyDeep } from 'type-fest'
import rootLogger from 'loglevel'
import { getParameterSchema } from '@freemarket/core'

const log = rootLogger.getLogger('createParametersSchema')

export function createParametersSchema(workflow: ReadonlyDeep<Workflow>) {
  if (!workflow.parameters) {
    log.debug(`workflow doesn't declare any parameters`)
    return null
  }

  const workflowArgsSchema: Record<string, ZodTypeAny> = {}
  for (const param of workflow.parameters) {
    const schema = getParameterSchema(param.type)
    workflowArgsSchema[param.name] = schema.describe(schema._def.description)
  }

  return z.object(workflowArgsSchema)
}
