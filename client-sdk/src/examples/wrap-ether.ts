import { Workflow } from '../model'

const wrapEtherWorkflow: Workflow = {
  parameters: [
    {
      name: 'inputAmount', // 1. Declare a runtime parameter
      type: 'amount',
    },
  ],
  steps: [
    {
      type: 'add-asset', // 2. Add an asset to the workflow
      asset: {
        type: 'native',
      },
      amount: '{{ inputAmount }}',
    },
    {
      type: 'wrap-native', // 3. Wrap the (native) asset from #2
      amount: '100%',
      source: 'workflow',
    },
  ],
}
