/* eslint-disable no-console */
import { validateWorkflow } from './common'
if (process.argv.length != 3) {
  console.log('invalid command line, please provide the filename of the workflow')
}

const fileName = process.argv[2]
validateWorkflow(fileName, true)
