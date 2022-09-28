[@fmp/sdk](../README.md) / [Exports](../modules.md) / WorkflowBuilder

# Class: WorkflowBuilder

A high level interface to concisely define workflows.

**`Example`**

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

## Table of contents

### Methods

- [addSteps](WorkflowBuilder.md#addsteps)
- [build](WorkflowBuilder.md#build)
- [doWhile](WorkflowBuilder.md#dowhile)

## Methods

### addSteps

▸ **addSteps**(...`steps`): [`WorkflowBuilder`](WorkflowBuilder.md)

Add a sequence of steps to the workflow.

#### Parameters

| Name       | Type                                              | Description                                                                                                                                                             |
| :--------- | :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `...steps` | [`WorkflowStep`](../interfaces/WorkflowStep.md)[] | one or more [WorkflowStep](../interfaces/WorkflowStep.md) instances. Use factory functions such as [wethWrap](../modules.md#wethwrap) to create WorkflowStep instances. |

#### Returns

[`WorkflowBuilder`](WorkflowBuilder.md)

`this` instance to allow chaining of method calls

#### Defined in

sdk/src/builder/WorkflowBuilder.ts:43

---

### build

▸ **build**(): [`Workflow`](../interfaces/Workflow.md)

Finalize the construction of a [Workflow](../interfaces/Workflow.md).

#### Returns

[`Workflow`](../interfaces/Workflow.md)

a [Workflow](../interfaces/Workflow.md) instance.

#### Defined in

sdk/src/builder/WorkflowBuilder.ts:53

---

### doWhile

▸ **doWhile**(`steps`, `callback`): [`WorkflowBuilder`](WorkflowBuilder.md)

Loops over a sequence of [WorkflowStep](../interfaces/WorkflowStep.md) until a condition is met as determined the callback function.

#### Parameters

| Name       | Type                                               | Description                                                                                                                                                                |
| :--------- | :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `steps`    | [`WorkflowStep`](../interfaces/WorkflowStep.md)[]  | the sequence of steps to loop over. Use factory functions such as [wethWrap](../modules.md#wethwrap) to create WorkflowStep instances.                                     |
| `callback` | [`DoWhileCallback`](../modules.md#dowhilecallback) | A function matching the [DoWhileCallback](../modules.md#dowhilecallback) signature that decides if `steps` should be executed again based on the output of the final step. |

#### Returns

[`WorkflowBuilder`](WorkflowBuilder.md)

`this` instance to allow chaining of method calls

#### Defined in

sdk/src/builder/WorkflowBuilder.ts:63
