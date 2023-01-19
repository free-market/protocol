import fs from 'fs'

function go() {
  const buildOutputPath = './build/contracts'
  const archivePath = './migrations/archive'
  const stat = fs.lstatSync(buildOutputPath)
  if (!stat.isDirectory) {
    console.error(`${buildOutputPath} does not exist`)
    process.exit(1)
  }
  const dirEnts = fs.readdirSync(buildOutputPath, { withFileTypes: true })
  for (const dirEnt of dirEnts) {
    if (dirEnt.isFile() && dirEnt.name.endsWith('.json')) {
      // console.log('reading ' + dirEnt.name)
      const sourcePath = `${buildOutputPath}/${dirEnt.name}`
      const content = fs.readFileSync(sourcePath)
      const json = JSON.parse(content.toString())
      // console.log(json.networks)
      if (json.networks && Object.keys(json.networks).length > 0) {
        fs.mkdirSync(archivePath, { recursive: true })
        const destPath = `${archivePath}/${dirEnt.name}`
        fs.writeFileSync(destPath, JSON.stringify(json.networks, null, 2))
        console.log(`exporting from ${sourcePath} to ${destPath}`)
      } else {
        // console.log(`${sourcePath} has no network data`)
      }
    }
  }
}

go()
