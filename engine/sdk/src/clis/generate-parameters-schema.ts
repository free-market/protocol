/* eslint-disable no-console */
import zodToJsonSchema from 'zod-to-json-schema'
import { createParametersSchema } from '../utils'
import { validateWorkflow } from './common'
if (process.argv.length != 3) {
  console.log('invalid command line, please provide the filename of the workflow')
}

const fileName = process.argv[2]
const workflow = validateWorkflow(fileName, false).getWorkflow()

const zodType = createParametersSchema(workflow)
if (!zodType) {
  process.exit(1)
}

const jsonSchema = zodToJsonSchema(zodType)
console.log(JSON.stringify(jsonSchema, null, 4))
