# Free Market Protocol / step-sdk

`@freemarket/runner` contains 3 main components:

- FrontDoor: the on-chain entry point for the protocol. This contract implements a simple proxy that delegatecall's to the WorkflowRunner contract. This contract is non-upgradable, providing a permanent address as the entry point for the protocol.
- WorkflowRunner: The central component of the Engine, responsible for managing the execution of a workflow. Its primary responsibilities include keeping track of the assets that are currently in the workflow, as well as the current step in the workflow. The WorkflowRunner carries out each step in the workflow by delegating to an Action contract.
- EternalStorage: Implements all storage for the system. While the Workflow Engine is stateless as it is executing workflows, it does use storage for configuration data.

This module is structured as a conventional Hardhat project.
