import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
// import 'hardhat-deploy-ethers'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'

const config: HardhatUserConfig = {
  solidity: '0.8.18',

  // for hardhat-deployer
  namedAccounts: {
    deployer: 0,
    otherUser: 1,
  },
  external: {
    contracts: [
      {
        artifacts: 'node_modules/@freemarket/runner/artifacts',
        deploy: 'node_modules/@freemarket/runner/deploy',
      },
    ],
  },
}

export default config
