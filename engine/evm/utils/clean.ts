import fs from 'fs'
import rimraf from 'rimraf'

const DEPLOYED_CONTRACTS = 'deployed-contracts'
const CONTRACTS_TO_SAVE = ['FrontDoor', 'Migrations', 'WorkflowRunner']

// save a copy of contracts that might have a deployment address
if (!fs.existsSync(DEPLOYED_CONTRACTS)) {
  fs.mkdirSync(DEPLOYED_CONTRACTS)
}
for (const f of CONTRACTS_TO_SAVE) {
  fs.copyFileSync(`build/contracts/${f}.json`, `${DEPLOYED_CONTRACTS}/${f}.json`)
}

// nuke the build dir
rimraf.sync('build')

// restore contratcs that might have a deployment address
fs.mkdirSync('build/contracts', { recursive: true })
for (const f of CONTRACTS_TO_SAVE) {
  fs.copyFileSync(`${DEPLOYED_CONTRACTS}/${f}.json`, `build/contracts/${f}.json`)
}
