<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/free-market">
    <img src="../../images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Free Market Protocol SDK</h3>

  <p align="center">
    Build multi-step De-Fi workflows that work across blockchains.
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

FMP-SDK is a TypeScript library for programmatic integrate with Free Market Protocol. It works with NodeJS and modern web browsers.
It provides:

- A `Workflow` data structure that provides a strongly typed workflows data model in Typescript.
- A JSON Schema for defining workflows as a JSON file.
- Classes and method for validating and executing workflows.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

To use this package you'll need a recent version of NodeJS, and NPM or an equivalent package manager. Examples shown here assume you're using NPM.

### Installation

FMP-SDK is currently in an early pre-release state it very likely to undergo breaking changes as we approach the first official public release. We recommend you pin your dependency to a specific version.

To install:

```
npm install --save @freemarket/sdk@0.1.1
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Components

The high level components provided by FreeMarket SDK are:

<!-- ### WorkflowBuilder

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
4. Uses Serum AMM to swap USDTet for USDT -->

### Workflow

`Workflow` is a strongly typed Typescript interface used to represent the static configuration of a Workflow. Workflows are also _plain old JavaScript objects_ thus are easily serialized to JSON. The SDK also provides a JSON Schema for validating such JSONs.

Below is a complete workflow in Typescript that simply wraps ETH into WETH:

```TypeScript
import { Workflow } from '@freemarket/sdk'

const wrapEtherWorkflow: Workflow = {
  parameters: [
    {
      name: 'inputAmount',                    // 1. Declare a runtime parameter
      type: 'amount',
    },
  ],
  steps: [
    {
      type: 'add-asset',                     // 2. Add an asset to the workflow
      asset: {
        type: 'native',
      },
      amount: '{{ inputAmount }}',
    },
    {
      type: 'wrap-native',                   // 3. Wrap the (native) asset from #2
      amount: '100%',
    },
  ],
}
```

Let's look a bit closer at the top level properties of a Workflow.

#### Parameters

The `parameters` property defines the runtime parameters of the workflow. In the step definitions, parameters are referenced using the `{{ parameterName }}` syntax. The `type` of the parameter must match the expected type where it is used in a `step` or there will be a runtime validation error.

### Steps

Steps are the building blocks of a workflow. Each step is an object with a `type` property that defines the type of step. In the example above, the `type` property of the first step is `add-asset`, which has the effect of transferring ETH from the caller into the workflow engine. The `type` of then second step is `wrap-native`, which wraps the ETH from step one, producing WETH. Note that after the workflow is complete, the WETH is trans to the caller.

### FungibleTokens and AssetReferences

The third top level attribute of a workflow is `fungibleTokens` which provide details about a custom tokens that appears in a workflow.

Within a step definition, assets are _referenced_ by defining a type property (either `native` or `fungible-token`) and if the asset reference is a fungible token, also a `symbol` property. The Engine is pre-configured to know about all _native_ assets on supported blockchains (e.g., ETH, AVAX, BNB, etc.), as well as the most common fungible tokens (e.g., 'USDT', 'WETH', 'LINK', etc.). Consider the following workflow that first withdrawals from Aave, and then swaps the resulting USDT for WETH:

```TypeScript
const wrapEtherWorkflow: Workflow = {
  steps: [
    {
      type: 'add-asset',            // add aUSDT to the workflow, referencing aUSDT by symbol
      asset: {
        type: 'fungible-token',
        symbol: 'aUSDT',
      },
      amount: '100%',
    },
    {
      type: 'aave-withdrawal',     // withdraw aUSDT from Aave, producing USDT
      inputAsset: {
        asset: {
          type: 'fungible-token',
          symbol: 'aUSDT',
        },

        amount: '100%',
      },
    },
    {
      type: 'uniswap-exact-in',    // swap USDT for WETH
      inputSymbol: 'USDT',
      outputSymbol: 'WETH',
      amount: '100%',
    },
  ],
  fungibleTokens: [
    {
      type: 'fungible-token',     // define aUSDT as a fungible token, because it is not pre-configured
      symbol: 'aUSDT',
      chains: {
        ethereum: {
          address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
          decimals: 6,
        },
      },
    },
  ],
}
```

In the example above, aUSDT is not pre-configured by the Engine and thus must be defined in the `assets` property of the workflow.
Once defined, it can be referenced by symbol as needed in the step definitions.

The full list of pre-configured assets can be found at: [https://metadata.fmprotocol.com/tokens.json](https://metadata.fmprotocol.com/tokens.json). These asset definitions are provided for the most common assets so workflow authors do not have to manually define common tokens like WETH and USDT in every workflow. However the pre-configured token list is a _best effort_ non-authoritative list and far from complete and not necessarily guaranteed to be correct. If you need to reference an asset that is not pre-configured or if an error is found, you can define it in the `assets` property of the workflow.

### WorkflowInstance

A `WorkflowInstance` is a runtime instance of a Workflow. It's main responsibility is workflow validation. It is created by passing a Workflow to the `WorkflowInstance` constructor. The constructor will validate the workflow and throw an error if it is invalid. The `WorkflowInstance` class also provides a `validate` method that can be used to validate a workflow instance against a set of runtime parameters.

Once a Workflow is valid has been fed into a WorkflowInstance, it can be used to create a WorkflowRunner:

```Typescript
// given a valid workflow in the variable `workflow`:
// and the caller's address in the variable `userAddress`

const workflowInstance = new WorkflowInstance(workflow)

// set providers for the workflow (they must be EIP-1193 compliant)
// a provider must be provided for each blockchain that is referenced in the workflow
// 'start-chain' used as the name of the blockchain that the workflow starts on (in this case, Avalanche)
instance.setProvider('start-chain', stdAvalancheProvider)

// the workflow will bridge and continue on Arbitrum
instance.setProvider('arbitrum', stdArbitrumProvider)

// acquire the runner
const runner = await instance.getRunner(userAddress)
```

### WorkflowRunner

A `WorkflowRunner` is used to bind arguments to parameters and execute the workflow. You can provide a callback to receive status updates as the workflow progresses:

```Typescript
import { ExecutionEvent } from '@freemarket/sdk'

function workflowEventListener(event ExecutionEvent) {
  console.log('workflow event:', event.message)
}

const runner.addEventHandler(workflowEventListener)
const workflowArguments = {
  inputAmount: '1.0'
}
await runner.run(workflowArguments)
```

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Marty Saxton - marty@fmprotocol.com

Project Link: [https://github.com/free-market/protocol/](https://github.com/free-market/protocol/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
