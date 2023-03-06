/* eslint-disable no-console */

import { createArgumentsSchema, validateWorkflow } from './common'
import fs from 'fs'
import chalk from 'chalk'
if (process.argv.length != 4) {
  console.log('usage: node validate-arguments.js <workflow-filename> <arguments.filename>')
}

const workflowFileName = process.argv[2]
const argumentsFileName = process.argv[3]

const workflow = validateWorkflow(workflowFileName, false).getWorkflow()

const zodType = createArgumentsSchema(workflow)
if (!zodType) {
  process.exit(1)
}

const args = JSON.parse(fs.readFileSync(argumentsFileName).toString())

const parseResult = zodType.safeParse(args)
if (parseResult.success) {
  console.log(`\nArguments in ${chalk.yellow(argumentsFileName)} are valid for the workflow ${chalk.yellow(workflowFileName)}!  🚀\n`)
} else {
  console.log(`\nArguments in ${chalk.yellow(argumentsFileName)} are not valid for the workflow ${chalk.yellow(workflowFileName)}:\n`)
  console.log(JSON.stringify(parseResult.error, null, 4))
  process.exit(1)
}
