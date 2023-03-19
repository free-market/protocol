import z, { ZodTypeAny } from 'zod'
import chalk from 'chalk'
import { WorkflowInstance } from '../runner/WorkflowInstance'
import fs from 'fs'
import { WorkflowValidationError } from '../runner/WorkflowValidationError'
import type { Workflow } from '../model'
import { getParameterSchema } from '../model/Parameter'
import type { ReadonlyDeep } from 'type-fest'

/* eslint-disable no-console */
export function validateWorkflow(fileName: string, verbose: boolean) {
  const fileContent = fs.readFileSync(fileName).toString()

  try {
    const rv = new WorkflowInstance(fileContent)
    if (verbose) {
      console.log(`\nWorkflow file ${chalk.yellow(fileName)} is valid!  🚀\n`)
    }
    return rv
  } catch (e) {
    if (e instanceof WorkflowValidationError) {
      const problems = e.problems.map(prob => prob.message)
      console.log('\nThe following problems were found in the workflow:')
      for (const problem of problems) {
        console.log('  ❌ ' + problem)
      }
      console.log()
    } else {
      console.log('\nAn unknown error occurred:\n\n')
      if (e instanceof Error) {
        console.log(e.stack)
      } else {
        console.log(e)
      }
    }
    process.exit(1)
  }
}
