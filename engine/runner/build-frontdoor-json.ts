import fs from 'fs'
import path from 'path'

const frontDoorAddresses: Record<string, string> = {}
const configManagerAddresses: Record<string, string> = {}

const deployments = path.resolve('deployments')
const dirs = fs.readdirSync(deployments)
for (const depDirName of dirs) {
  const depDir = path.resolve(deployments, depDirName)
  const stat = fs.statSync(depDir)
  if (stat.isDirectory()) {
    const fdName = path.resolve(depDir, 'FrontDoor.json')
    const fdObj = JSON.parse(fs.readFileSync(fdName).toString())
    frontDoorAddresses[depDirName] = fdObj.address
    const cmName = path.resolve(depDir, 'ConfigManager.json')
    const cmObj = JSON.parse(fs.readFileSync(cmName).toString())
    configManagerAddresses[depDirName] = cmObj.address
  }
}
const outputPath = path.resolve(deployments, 'front-doors.json')
console.log(`writing front door json to ${outputPath}`)
fs.writeFileSync(outputPath, JSON.stringify(frontDoorAddresses, null, 2))
const cmOutputPath = path.resolve(deployments, 'config-managers.json')
fs.writeFileSync(cmOutputPath, JSON.stringify(configManagerAddresses, null, 2))
