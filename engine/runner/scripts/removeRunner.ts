import hre from 'hardhat'
import { ConfigManager } from '../typechain-types'

async function main() {
  console.log(process.argv.length)
  process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`)
  })

  console.log('omg')
  // const {  ethers } = hre
  // const configManager = <ConfigManager>await ethers.getContract('ConfigManager')
  // aw
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
