import React, { useRef } from 'react'
import Editor from 'react-simple-code-editor'

import highlight from '../../highlight'
// import '../../solarized-dark-atom.css'
import '../../material-dark.css'
import {
  wethWrap,
  curveTriCryptoSwap,
  wormholeTokenTransfer,
  serumSwap,
  Workflow,
  WorkflowBuilder,
  WorkflowStep,
} from '@fmp/sdk'
import { createWorkflowFromString } from 'workflowStepParser'

type WorkflowChangedHandler = (workflowText: string) => void | Promise<void>

export const ScriptEditor = (props: {
  snippet: string
  onWorkflowChanged?: WorkflowChangedHandler
  children?: React.ReactNode
}): JSX.Element => {
  const [text, setText] = React.useState(props.snippet)

  // const parent = React.createRef<HTMLDivElement>()
  function onParseSnipit() {
    const fullScript = '' + text
    // console.log(fullScript)
    // const workflow = createWorkflowFromString(fullScript)
    // console.log('tada', workflow)
    if (props.onWorkflowChanged) {
      props.onWorkflowChanged(fullScript)
    }

    // if (!parent.current) {
    //   return
    // }
    // const scriptTags = parent.current.getElementsByTagName('script')
    // if (scriptTags) {
    //   for (const elem of scriptTags) {
    //     const scriptElem = elem as HTMLScriptElement
    //     if (scriptElem.id === 'theScriptParserScriptTag') {
    //       console.log('found script tag')
    //       parent.current.removeChild(scriptElem)
    //     }
    //   }
    // }
    // const theScriptTag = document.createElement('script')
    // theScriptTag.id = 'theScriptParserScriptTag'
    // parent.current.appendChild(theScriptTag)
    // const rand = Math.random() * 100000
    // // theScriptTag.text = `window.foo = ()=>   console.log(wethWrap({ amount: '1000000000000000000' }))`
    // theScriptTag.text = `window.foo = ()=>   console.log(wethWrap({ amount: '${rand}' }))`
    // // theScriptTag.text = `window.foo = ()=>   console.log(asdf)`
    // theScriptTag.onload = () => {
    //   console.log('loaded')
    // }

    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // ;(window as any).foo()
    console.log('script text', text)
  }

  return (
    <>
      <div className="flex items-stretch max-w-4xl rounded-2xl overflow-hidden">
        <Editor
          value={text}
          highlight={highlight}
          onValueChange={setText}
          preClassName="language-js"
          padding="1em"
          style={{}}
          className="dark grow font-mono caret-sky-50 text-sm basis-0"
        />

        <div className="p-5 max-w-lg basis-64 flex flex-col">
          <p className="grow text-s-base0 dark:text-s-base00">Welcome! To get started, click "Prepare."</p>

          <div
            className="bg-s-base2 dark:bg-s-base02 w-full px-5 py-3 flex justify-center items-center cursor-pointer rounded-2xl font-bold text-lg text-s-base1 dark:text-s-base01 hover:bg-s-base2 dark:hover:bg-s-base02 active:bg-s-base2/50 dark:active:bg-s-base02/50 active:text-s-base1/50 dark:active:text-s-base01/50 select-none"
            onClick={onParseSnipit}
          >
            Prepare
          </div>
        </div>
      </div>
      {props.children}
    </>
  )
}
