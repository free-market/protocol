import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
// import 'hardhat-deploy-ethers'

const config: HardhatUserConfig = {
  solidity: '0.8.18',

  // for hardhat-deployer
  namedAccounts: {
    deployer: 0,
    otherUser: 1,
  },
}

export default config
