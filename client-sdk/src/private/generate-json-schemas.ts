/* eslint-disable no-console */
import fs from 'fs'
import zodToJsonSchema from 'zod-to-json-schema'
import { workflowSchema } from '../model'
import { argumentsSchema } from '../model/Arguments'

fs.mkdirSync('build', { recursive: true })

const workflowJsonSchema = zodToJsonSchema(workflowSchema)
fs.writeFileSync('build/workflow.schema.json', JSON.stringify(workflowJsonSchema, null, 4))
console.log('✔ workflow json schema written to build/workflow.schema.json')

const argumentJsonSchema = zodToJsonSchema(argumentsSchema)
fs.writeFileSync('build/workflow.arguments.schema.json', JSON.stringify(argumentJsonSchema, null, 4))
console.log('✔ argument json schema written to build/workflow.arguments.schema.json')
