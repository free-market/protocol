import fs from 'fs'

function go() {
  const buildOutputPath = './build/contracts'
  const archivePath = './migrations/archive'
  // const stat = fs.lstatSync(buildOutputPath)
  // if (!stat.isDirectory) {
  //   console.error(`${buildOutputPath} does not exist`)
  //   process.exit(1)
  // }
  const dirEnts = fs.readdirSync(archivePath, { withFileTypes: true })
  for (const dirEnt of dirEnts) {
    if (dirEnt.isFile() && dirEnt.name.endsWith('.json')) {
      const dstPath = `${buildOutputPath}/${dirEnt.name}`
      if (!fs.existsSync(dstPath)) {
        console.warn('WARN: dest does not exist: ' + dstPath)
      } else {
        const srcPath = `${archivePath}/${dirEnt.name}`
        const srcJson = JSON.parse(fs.readFileSync(srcPath).toString())
        const dstJson = JSON.parse(fs.readFileSync(dstPath).toString())
        console.log(`overwriting networks: src=${srcPath} dest=${dstPath}`)
        dstJson.networks = srcJson
        fs.writeFileSync(dstPath, JSON.stringify(dstJson, null, 2))
      }
    }
  }
}

go()
