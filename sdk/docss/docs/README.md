@fmp/sdk / [Exports](../modules.md)

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
    <a href="https://github.com/free-market/platform/blob/main/sdk/docs/README.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/free-market/platform/blob/main/sdk/docs/example.md">View Example</a>
    ·
    <a href="https://github.com/free-market/platform/issues">Report Bug</a>
    ·
    <a href="https://github.com/free-market/platform/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

FMP-SDK is a Typescript library for programattic integrate with Free Market Protocol. It works with NodeJS and modern web browsers.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

To use this package you'll need a recent version of NodeJS, and NPM or an equivalent package manager.  Examples shown here assume you're using NPM.
### Installation

FMP-SDK is currently in an early pre-release state and is not generally available. It can be installed using npm from our private registry. First, authenticate your npm client with our private registry by following [these instructions](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

Then:

```
npm install --save @fmp/sdk
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Use `WorkflowBuilder` to define a workflow:

```TypeScript
  const workflow = new WorkflowBuilder()
    .addSteps(
      weth.wrap({ amount: '1000000000000000000' }),
      curve.triCrypto.swap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormhole.transfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
      saber.swap({ from: 'USDTet', to: 'USDC', amount: '100%' })
    )
    .build()
```

Then execute the workflow using a `WorkflowEngine`:

```TypeScript
  const workflowEngine = new SignEveryStepWorkflowEngine({
    ethereumKeyPair: proccess.env['FMP_ETH_KEYPAIR'],
    solanaPrivateKey: proccess.env['FMP_SOL_PRIVATEKEY']
  })

  await workflowEngine.execute(workflow)

```

_For more examples, please refer to the [Documentation](https://github.com/free-market/platform/blob/main/sdk/docs/README.md)_

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
