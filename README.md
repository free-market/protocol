<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/free-market">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Free Market Protocol</h3>

  <p align="center">
    Cross-chain De-Fi Workflow Engine
    <br />
    <a href="https://github.com/free-market/platform/issues">Report Bug</a>
    ·
    <a href="https://github.com/free-market/platform/issues">Request Feature</a>
  </p>
</div>

Free Market is a protocol designed to extend arbitrary message passing protocols with a ruleset that ensures requisite conditions are sequentially met throughout complex transactions that involve multiple blockchains. The protocol is anchored by a workflow engine that follows paths through onchain branch nodes.
Interoperability remains in its nascent stage and presents difficulties for builders in planning and execution. This results in a cumbersome user experience, where end-users are faced with significant challenges in determining the appropriate steps and sequence of actions to reach a desired outcome.

This monoreop consists of 3 components:

- [evm](/evm) The EVM implementation of the protocol (a.k.a. Workflow Engine, or just Engine)
- [sdk](/sdk) A typescript layer that abstracts the low level details of the Engine and enables easy authoring of workflows
- [ui2](/ui2) Reusable React web components

## Road Map
- SDK: Author workflows using a high-level DSL
- More integrations, for example swapping via Uniswap/Sushiswap or 1inch
- Gelato Relay support:  pay for transaction gas using any asset, not just native
- Branch nodes:  enable on-chain decisions at transaction time to take different paths through your workflows
- Action Developer Kit:  extend the protocol by adding new actions

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact

Marty Saxton - marty@fmprotocol.com

Project Link: [https://github.com/free-market/platform/](https://github.com/free-market/platform/)
