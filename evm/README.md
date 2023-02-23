<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/free-market">
    <img src="../images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Free Market Protocol EVM</h3>

  <p align="center">
    FMP's EVM implementation of the Workflow Engine.
    <br />
    <a href="https://github.com/free-market/platform/issues">Report Bug</a>
    ·
    <a href="https://github.com/free-market/platform/issues">Request Feature</a>
  </p>
</div>

<details>

<summary>Table of Contents</summary>

<!-- toc -->

- [About This Module](#about-this-module)
- [Overview](#overview)
- [Data Model](#data-model)
  - [AssetType](#assettype)
  - [Asset](#asset)
  - [AssetAmount](#assetamount)
  - [WorkflowStepInputAsset](#workflowstepinputasset)
  - [WorkflowStep](#workflowstep)
  - [Workflow](#workflow)
- [Contracts](#contracts)
  - [FrontDoor](#frontdoor)
  - [WorkflowRunner](#workflowrunner)
  - [Actions](#actions)

* [Freezing Workflows](#freezing-workflows)
  - [Roadmap](#roadmap)
  - [License](#license)
  - [Contact](#contact)
  <!-- tocstop -->

</details>

## About This Module

FMP-EVM is the EVM implementation of the Workflow Engine. It provides a modular on-chain execution environment to enable
execution of workflows defined by FMP-SDK. It consist of a set of EVM contracts authored in Solidity, and a library of
helper code implement in Typescript.

This is a low level module and is not intended to be consumed directly by those whishing to develop and execute workflows.
It may be of interest to those whishing to extend the workflow engine, or understand the underlying EVM implementation of the engine.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Overview

The Workflow Engine provided by this module is responsible for executing workflows. The entire workflow executes on-chain, within a single transaction. Our definition of 'workflow' aligns closely with the traditional meaning, for example, Wikipedia's [ Workflow](https://en.wikipedia.org/wiki/Workflow). More specifically, a workflow is modeled as a directed graph of steps. Steps can be divided into two broad categories:

- Branches: evaluate conditions at runtime and causing different paths through the workflow to follow depending on the outcome of the evaluation
- Actions: interact with 'De-Fi Primitives' to accomplish fine-grained tasks. Examples are using Curve 3pool to swap Dai for USDC, or using Stargate Bridge to move assets from Avalanche to Optimism.

It is important to note that a single _logical_ FMP workflow as defined in our SDK layer can span many blockchains. The workflows implemented here would just be a single segment of such a cross-chain workflow.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Data Model

The following is the workflow engine data model, presented in a bottom up fashion. This structure is the primary input parameter when the engine is called to execute a workflow.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
### AssetType

An enum specifying the type of asset. This will be expanded as needed to allow for other types of assets.

```solidity
enum AssetType {
  Native,
  ERC20,
  ERC721
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Asset

Represents any kind of asset that can exist on an EVM blockchain. Note that native assets (`AssetType.Native`) do not have an address, so `assetAddress` is irrelevant. By convention we use address(0) to represent the native asset.

```solidity
struct Asset {
  AssetType assetType;
  address assetAddress;
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### AssetAmount

An asset paired with an amount

```solidity
struct AssetAmount {
  Asset asset;
  uint256 amount;
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### WorkflowStepInputAsset

WorkflowSteps (described next) have 0 or more _input assets_. Because asset amounts are often not precisely known ahead of time,
input assets can be expressed as percentages, relative to the amount of that asset present in the workflow at the point of execution.

```solidity
struct WorkflowStepInputAsset {
  // the input asset
  Asset asset;
  // the amount of the input asset
  uint256 amount;
  // if true 'amount' is treated as a percent, with 4 decimals of precision (1000000 represents 100%)
  bool amountIsPercent;
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### WorkflowStep

The configuration of a single workflow step.

```solidity
// Parameters for a workflow step
struct WorkflowStep {

  // The logical identifer of the step (e.g., 10 represents WrapEtherStep).
  uint16 stepId;

  // The contract address of a specific version of the action.
  // Individual step contracts may be upgraded over time, and this allows
  // workflows 'freeze' the version of contract for this step
  // A value of address(0) means use the latest and greatest version  of
  // this step based only on stepId.
  address stepAddress;

  // The input assets to this step.
  WorkflowStepInputAsset[] inputAssets;

  // The output assets for this step.
  Asset[] outputAssets;

  // Additional step-specific parameters for this step, typically serialized in standard abi encoding.
  bytes data;

  // The index of the next step in the directed graph of steps. (see the Workflow.steps array)
  int16 nextStepIndex;
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Workflow

A workflow currently consists simply as an array of steps. The steps represent the nodes of a directed graph. The starting step that executes first during a workflow execution is `Workflow.steps[0]`, but steps do not necessarily execute sequentially. We can think of the index of the step within `Workflow.steps` simply as the node's identifier.

```solidity
struct Workflow {
  WorkflowStep[] steps;
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contracts

To facilitate modularity, the EVM workflow engine is implemented as many small contracts that are developed and deployed independently.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### FrontDoor

This is our "forever" contract, providing a permanent entry point that can be used to access the engine. It simply proxies to the current (latest and greatest) WorkflowRunner described below.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### WorkflowRunner

This implements the main loop of the engine. It is responsible for traversing the directed graph of nodes in the flow, keeping
track of asset amounts as Actions are executed. At the end of the flow, `WorkflowRunner` transferrers whatever assets are
present back to the user.

Currently, the runner also implements a registry of Actions, but we plan to split this functionality into a separate contract some time in the near future.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Actions

Actions are the parts of the engine that interface with 3rd party contracts, a.k.a. _De-Fi Primitives_. Examples are `WrapEtherAction`, `AaveSupplyAction`, and `StargateSwapAction`.
We expect the number of actions to grow greatly over time.

The single point of interaction between WorkflowRunner and each step is the `execute` method of the `IWorkflowStep` interface. All actions must implement this interface.

```solidity
interface IWorkflowStep {
  function execute(
    // input assets paired with amounts of each
    AssetAmount[] calldata inputAssetAmounts,
    // expected output assets (amounts not known yet)
    Asset[] calldata outputAssets,
    // additional arguments specific to this step
    bytes calldata data
  ) external payable returns (WorkflowStepResult memory);
}
```

This interface aligns closely with the `WorkflowStep` structure of the data model. The primary difference is at the point of step execution, relative amounts from the `WorkflowStep` (when `amountIsPercent` is true) are converted into absolute amounts to be fed to the Action.

The return value of a step execution is `WorkflowStepResult`:

```solidity
struct WorkflowStepResult {
  // The amounts of each output asset that resulted from the step execution.
  AssetAmount[] outputAssetAmounts;
  // The index of the next step in a workflow.
  // This value allows the step to override the default nextStepIndex
  // statically defined
  // -1 means terminate the workflow
  // -2 means do not override the statically defined nextStepIndex in WorkflowStep
  int16 nextStepIndex;
}
```

`outputAssetAmounts` informs `WorkflowRunner` of the actual output assets produced by the Action. `nextStepIndex` allows the Action to optionally specify an alternate next step in the flow, or terminate the workflow.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

# Freezing Workflows

As mentioned above, the deployment model of the engine emphasizes modularity. It allows the engine to be extended simply by deploying more actions. It also facilitates potentially
frequent upgrades of existing actions or WorkflowRunner. This may not an ideal scenario for all users of the engine. In a decentralized, trustless world, it is important to
be able to verify that the code being executed is not malicious or otherwise exploitable. We plan to do everything within reason to facilitate code verification, for example via etherscan and sourcify, as well as formal audits.

However, with frequent code changes in the engine, it may become exceedingly difficult or impossible to verify that the contract code that executes in the engine is trustworthy. To alleviate this problem, we provide a means to "feeeze" a workflow. Once frozen, it is guaranteed to use the exact same set of contracts.

To freeze a workflow:

1. Instead of using FrontDoor as the entry point, take note of the WorkflowRunner currently pointed to by FrontDoor (`FrontDoor.upstream`). Use that address as the entry point.
2. For each WorkflowStep, provide the Action's current contract address in WorkflowStep.stepAddress

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [ ] Migrate from truffle to hardhat
- [ ] Split each action into its own module
- [ ] Split action registration into a separate contract
- [ ] Support sourcify and etherscan code verification
- [ ] Add Branch nodes (e.g., ChainComparisonBranch, AssetValueBranch)
- [ ] Add many many more Actions

See the [open issues](https://github.com/free-market/platform/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Marty Saxton - marty@fmprotocol.com

Project Link: [https://github.com/free-market/platform/](https://github.com/free-market/platform/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
