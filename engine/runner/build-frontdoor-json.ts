import fs from 'fs'
import path from 'path'

const addresses: Record<string, string> = {}

const deployments = path.resolve('deployments')
const dirs = fs.readdirSync(deployments)
for (const depDirName of dirs) {
  const depDir = path.resolve(deployments, depDirName)
  const stat = fs.statSync(depDir)
  if (stat.isDirectory()) {
    const fname = path.resolve(depDir, 'FrontDoor.json')
    const fdContent = fs.readFileSync(fname).toString()
    const fdObj = JSON.parse(fdContent)
    addresses[depDirName] = fdObj.address
  }
}
const outputPath = path.resolve(deployments, 'front-doors.json')
console.log(`writing front door json to ${outputPath}`)
fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2))
