# Free Market Protocol SDK Documentation

## Overview

FMP-SDK is a TypeScript library that allows developers to integrate with FMP programattically. The SDK is intended to be run in NodeJS or in the browser.

## Components

The high level compoents provided by FMP-SDK are:

### Workflow

A Workflow is a simple data structure that captures the static configuration of a Workflow. Additionally it contains purely informational aspects of the workflow that may be of interest to end users. Workflows are _plain old JavaScript objects_ thus are easily serialized to JSON.

### WorkflowBuilder

WorkflowBuilder providers integraters with a high level interface to define Workflows. The output is a Workflow data structure.

### WorkflowEngine

A WorkflowEngine executes a Workflow. WorkflowEngine is provided as two variants:

`SignEveryStepWorkflowEngine` Each step of the workflow is executed in a separate blockchain transaction.  
This engine requires a separate signature from the user for each workflow step.  
`OneClickWorkflowEngine` Multiple steps of the workflow are executed within the same transaction. Only one one signature is required to run the entire workflow.  
This style of integration is more suited for web3 use cases, as the end user only has to approve one transaction from their browser wallet.

## Workflow Builder

WorkflowBuilder provides a means to define the steps of a workflow using a high level API. Here's an example:

```TypeScript
  import { StepFactories, WorkflowBuilder } from '@fmp/sdk'
  const { weth, curve, wormhole, saber, mango } = StepFactories

  const workflow = new WorkflowBuilder()
    .addSteps(
      weth.wrap({ amount: '1000000000000000000' }),
      curve.triCrypto.swap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormhole.transfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
      saber.swap({ from: 'USDTet', to: 'USDC', amount: '100%' })
    )
    .build()
```

This example defines a workflow that performs the following sequence of steps:

1. Starting with ETH, it wraps 1000000000000000000 of it (in wei) creating WETH
2. Uses Curve's TriCrypto pool to swap 100% of the WETH from the previus step into USDT
3. Uses Wormhole to bridge 100% of the USDT from the previous step from Ethereum blochchain to Solana blockchain, resulting in USDTet on Solana
4. Uses Saber AMM to swap USDTet for USDT

The full workflow object produced by the above code snipit can be viewed below:

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
                  name: Wrap Etherium
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
                  description: TriCrypto does swapping between the 3 most popular tokens on Etherium: WBTC, WETH and USDT
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
              stepId: saber.swap
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
                  stepId: saber.swap
                </blockquote>
                <blockquote>
                  name: Saber AMM
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

TODO link to TSDoc

## WorkflowEngine

WorkflowEngine is an abstract interface for different implementations. The only implementation currently available is `SignEveryStepWorkflowEngine`.  
We plan to make `OneClickWorkflowEngine` available in the near future.

## SignEveryStepWorkflowEngine

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
