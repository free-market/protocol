import fs from 'fs'
import zodToJsonSchema from 'zod-to-json-schema'
import { workflowSchema } from '../model'

const jsonSchema = zodToJsonSchema(workflowSchema)
fs.mkdirSync('build', { recursive: true })
fs.writeFileSync('build/workflow.schema.json', JSON.stringify(jsonSchema, null, 4))

// eslint-disable-next-line no-console
console.log('✔ json schema written to build/workflow.schema.json')
