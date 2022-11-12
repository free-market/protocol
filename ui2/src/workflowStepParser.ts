import {
  wethWrap,
  curveTriCryptoSwap,
  curveThreePoolSwap,
  wormholeTokenTransfer,
  serumSwap,
  mangoDeposit,
  mangoWithdrawal,
  marinadeStake,
  marinadeUnstake,
  Workflow,
  WorkflowBuilder,
  WorkflowStep,
} from '@fmp/sdk'

// eslint-disable-next-line
const windowAsAny: any = window
windowAsAny.wethWrap = wethWrap
windowAsAny.curveTriCryptoSwap = curveTriCryptoSwap
windowAsAny.curveThreePoolSwap = curveThreePoolSwap
windowAsAny.wormholeTokenTransfer = wormholeTokenTransfer
windowAsAny.serumSwap = serumSwap
windowAsAny.mangoDeposit = mangoDeposit
windowAsAny.mangoWithdrawal = mangoWithdrawal
windowAsAny.marinadeStake = marinadeStake
windowAsAny.marinadeUnstake = marinadeUnstake
function executeScriptDynamic(scriptId: string, scriptText: string) {
  const scriptTags = window.document.head.getElementsByTagName('script')
  if (scriptTags) {
    for (const elem of scriptTags) {
      const scriptElem = elem as HTMLScriptElement
      if (scriptElem.id === scriptId) {
        console.log('found script tag')
        window.document.head.removeChild(scriptElem)
      }
    }
  }
  const theScriptTag = document.createElement('script')
  theScriptTag.id = scriptId

  window.document.head.appendChild(theScriptTag)
  const rand = Math.random() * 100000
  // theScriptTag.text = `window.foo = ()=>   console.log(wethWrap({ amount: '1000000000000000000' }))`
  theScriptTag.text = `window.${scriptId} = ()=>  ${scriptText} `
  // theScriptTag.text = `window.foo = ()=>   console.log(asdf)`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return windowAsAny[scriptId]()
}

export function createWorkflowFromString(scriptText: string): Workflow {
  const workflowSteps = executeScriptDynamic('theWorkflowScript', scriptText) as WorkflowStep[]
  return new WorkflowBuilder().addSteps(...workflowSteps).build()
}
