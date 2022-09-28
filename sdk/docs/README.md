@fmp/sdk / [Exports](modules.md)

<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/free-market">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Free Market Protocol SDK</h3>

  <p align="center">
    Build multi-step DEFI workflows that work accross blockchains.
    <br />
    <a href="https://github.com/free-market/platform/blob/main/sdk/docs/modules.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/free-market/platform/issues">Report Bug</a>
    ·
    <a href="https://github.com/free-market/platform/issues">Request Feature</a>
  </p>
</div>

<details>

<summary>Table of Contents</summary>

<!-- toc -->

- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Components](#components)
  - [WorkflowBuilder](#workflowbuilder)
  - [Workflow](#workflow)
  - [WorkflowEngine](#workflowengine)
    - [SignEveryStepWorkflowEngine](#signeverystepworkflowengine)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

<!-- tocstop -->

</details>

<!-- ABOUT THE PROJECT -->

## About The Project

FMP-SDK is a TypeScript library for programattic integrate with Free Market Protocol. It works with NodeJS and modern web browsers.
It provides:

- A rich `Workflow` data structure that can be executed by WorkflowEngines, and is well suited as a source of information for user interfaces
- A `WorkflowBuilder` that enables consise construction of workflows
- Several WorkflowEngine implementations that execute `Workflows`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

To use this package you'll need a recent version of NodeJS, and NPM or an equivalent package manager. Examples shown here assume you're using NPM.

### Installation

FMP-SDK is currently in an early pre-release state and is not generally available. It can be installed using npm from our private registry. First, authenticate your npm client with our private registry by following [these instructions](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

Then:

```
npm install --save @fmp/sdk
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Components

The high level compoents provided by FMP-SDK are:

### WorkflowBuilder

[WorkflowBuilder](docs/classes/WorkflowBuilder.md) provides a means to define the steps of a [Workflow](docs/interfaces/Workflow.md) using a high level API. Here's an example:

```TypeScript
  const workflow = new WorkflowBuilder()
    .addSteps(
      wethWrap({ amount: '1000000000000000000' }),
      curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
      serumSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
    )
    .build()
```

This example defines a workflow that performs the following sequence of steps:

1. Starting with ETH, it wraps 1000000000000000000 of it (in wei) creating WETH
2. Uses Curve's TriCrypto pool to swap 100% of the WETH from the previus step into USDT
3. Uses Wormhole to bridge 100% of the USDT from the previous step from Ethereum blochchain to Solana blockchain, resulting in USDTet on Solana
4. Uses Serum AMM to swap USDTet for USDT

### Workflow

A Workflow is a simple data structure that captures the static configuration of a Workflow. Additionally it contains purely informational aspects of the workflow that may be of interest to end users. Workflows are _plain old JavaScript objects_ thus are easily serialized to JSON.

The full workflow object produced by the above code `WorkflowBuilder` snipit can be viewed below:

<blockquote>
  <details>
    <summary>
      Workflow
    </summary>
    <blockquote>
      <details>
        <summary>
          steps
        </summary>
        <blockquote>
          <details>
            <summary>
              0
            </summary>
            <blockquote>
              stepId: weth.wrap
            </blockquote>
            <blockquote>
              inputAmount: 1000000000000000000
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  inputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Ethereum
                </blockquote>
                <blockquote>
                  symbol: ETH
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: Ethereum
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  outputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Ethereum
                </blockquote>
                <blockquote>
                  symbol: WETH
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: Wrapped Ethereum
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  info
                </summary>
                <blockquote>
                  stepId: weth.wrap
                </blockquote>
                <blockquote>
                  name: Wrap Ethereum
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      blockchains
                    </summary>
                    <blockquote>
                      0: Ethereum
                    </blockquote>
                  </details>
                </blockquote>
                <blockquote>
                  gasEstimate: 1
                </blockquote>
                <blockquote>
                  exchangeFee: 0
                </blockquote>
                <blockquote>
                  description: Convert native ETH to WETH tokens.
                </blockquote>
              </details>
            </blockquote>
          </details>
        </blockquote>
        <blockquote>
          <details>
            <summary>
              1
            </summary>
            <blockquote>
              stepId: curve.tricrypto.swap
            </blockquote>
            <blockquote>
              inputAmount: 100%
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  inputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Ethereum
                </blockquote>
                <blockquote>
                  symbol: WETH
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: Wrapped Ethereum
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  outputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Ethereum
                </blockquote>
                <blockquote>
                  symbol: USDT
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: Tether USD
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              inputIndex: 0
            </blockquote>
            <blockquote>
              outputIndex: 0
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  info
                </summary>
                <blockquote>
                  stepId: curve.tricrypto.swap
                </blockquote>
                <blockquote>
                  name: Curve TriCrypto
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      blockchains
                    </summary>
                    <blockquote>
                      0: Ethereum
                    </blockquote>
                  </details>
                </blockquote>
                <blockquote>
                  gasEstimate: 40
                </blockquote>
                <blockquote>
                  exchangeFee: 1
                </blockquote>
                <blockquote>
                  description: TriCrypto does swapping between the 3 most popular tokens on Ethereum: WBTC, WETH and USDT
                </blockquote>
              </details>
            </blockquote>
          </details>
        </blockquote>
        <blockquote>
          <details>
            <summary>
              2
            </summary>
            <blockquote>
              stepId: wormhole.transfer
            </blockquote>
            <blockquote>
              inputAmount: 100%
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  inputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Ethereum
                </blockquote>
                <blockquote>
                  symbol: USDT
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: Tether USD
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  outputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Solana
                </blockquote>
                <blockquote>
                  symbol: USDTet
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: USDTet (USDT via wormhole from Ethereum)
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  info
                </summary>
                <blockquote>
                  stepId: wormhole.transfer
                </blockquote>
                <blockquote>
                  name: Wormhole Token Portal
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      blockchains
                    </summary>
                    <blockquote>
                      0: Ethereum
                    </blockquote>
                  </details>
                </blockquote>
                <blockquote>
                  gasEstimate: 400000
                </blockquote>
                <blockquote>
                  exchangeFee: 1
                </blockquote>
                <blockquote>
                  description: Enables transfering tokens to different blockchains.
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              sourceChain: Ethereum
            </blockquote>
            <blockquote>
              targetChain: Solana
            </blockquote>
          </details>
        </blockquote>
        <blockquote>
          <details>
            <summary>
              3
            </summary>
            <blockquote>
              stepId: serum.swap
            </blockquote>
            <blockquote>
              inputAmount: 100%
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  inputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Solana
                </blockquote>
                <blockquote>
                  symbol: USDTet
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: USDTet (USDT via wormhole from Ethereum)
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  outputAsset
                </summary>
                <blockquote>
                  type: token
                </blockquote>
                <blockquote>
                  blockChain: Solana
                </blockquote>
                <blockquote>
                  symbol: USDT
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      info
                    </summary>
                    <blockquote>
                      fullName: USDT (solana)
                    </blockquote>
                    <blockquote>
                      decimals: 18
                    </blockquote>
                  </details>
                </blockquote>
              </details>
            </blockquote>
            <blockquote>
              <details>
                <summary>
                  info
                </summary>
                <blockquote>
                  stepId: serum.swap
                </blockquote>
                <blockquote>
                  name: Serum AMM
                </blockquote>
                <blockquote>
                  <details>
                    <summary>
                      blockchains
                    </summary>
                    <blockquote>
                      0: Ethereum
                    </blockquote>
                  </details>
                </blockquote>
                <blockquote>
                  gasEstimate: 1
                </blockquote>
                <blockquote>
                  exchangeFee: 1
                </blockquote>
                <blockquote>
                  description: Automated market maker for swapping SPL Tokens.
                </blockquote>
              </details>
            </blockquote>
          </details>
        </blockquote>
      </details>
    </blockquote>
  </details>
</blockquote>

### WorkflowEngine

A WorkflowEngine executes a Workflow. WorkflowEngine is provided as two variants:

`SignEveryStepWorkflowEngine` Each step of the workflow is executed in a separate blockchain transaction.
This engine requires a separate signature from the user for each workflow step.
`OneClickWorkflowEngine` Multiple steps of the workflow are executed within the same transaction. Only one one signature is required to run the entire workflow.
This style of integration is more suited for web3 use cases, as the end user only has to approve one transaction from their browser wallet.

#### SignEveryStepWorkflowEngine

This engine executes each step of the workflow as a separate blockchain transaction. As a consequence of this, the user signs a transaction
imediately before it is submitted to the blockchain. This works well for programattic integrations (e.g., NodeJS) but leads to a disappointing
user experience when executed from the browser as the end user is prompted many times to sign transactions.

Below is a example of executing a workflow using SignEveryStepWorkflowEngine.

```TypeScript
import treeify from 'treeify'
import Eth, { TransactionConfig } from 'web3-eth'
import { SignEveryStepWorkflowEngineMode } from './engine/SignEveryStepWorkflowEngine'
import { WorkflowEvent } from './engine/WorkflowEngine'

// initialize the ethereum web3 provider
const eth = new Eth.Eth('ws://some.local-or-remote.node:8546')

// callback invoked by the engine whenever there is a transaction to sign
async function mySignTransactionEth(transactionConfig: TransactionConfig) {
  await eth.signTransaction(transactionConfig)
}

// callback invoked by the engine whenever there is a progress event
function myWorkflowEventHandler(event: WorkflowEvent) {
  console.log(treeify.asTree(event as any, true, true))
}

async function main() {
  const engine = new SignEveryStepWorkflowEngine({
    signTransactionHandler: mySignTransactionEth,
    eventHandler: myWorkflowEventHandler,
  })
}
```

TODO link to TSDoc for SignEveryStepWorkflowEngine

_For more examples, please refer to the [Documentation](docs/modules.md)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] WorflowBuilder: define workflows with a high level API
- [x] SignEveryStepWorkflowEngine: execute each step of the workflow as a separate blockchain transaction
- [ ] OneClickWorkflowEngine: execute workflows with only 1 signature required to execute the entire workflow

See the [open issues](https://github.com/free-market/platform/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Marty Saxton - marty@fmprotocol.com

Project Link: [https://github.com/free-market/platform/](https://github.com/free-market/platform/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
