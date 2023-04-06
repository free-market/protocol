import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  namedAccounts: {
    deployer: 0,
    otherUser: 1,
  },
}

export default config
