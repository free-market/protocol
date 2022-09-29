import React from 'react'
import Editor from 'react-simple-code-editor'

import highlight from '../../highlight'
import '../../solarized-dark-atom.css'

export const ScriptEditor = (props: {
  snippet: string
  children: React.ReactNode
}): JSX.Element => {
  const [text, setText] = React.useState(props.snippet)

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
          className="grow font-mono caret-sky-50 text-sm basis-0"
        />

        <div className="p-5 max-w-lg basis-64 flex flex-col">
          <p className="grow text-s-base0 dark:text-s-base00">
            Welcome! To get started, click "Prepare."
          </p>

          <div className="bg-s-base2 dark:bg-s-base02 w-full px-5 py-3 flex justify-center items-center cursor-pointer rounded-2xl font-bold text-lg text-s-base1 dark:text-s-base01 hover:bg-s-base2 dark:hover:bg-s-base02 active:bg-s-base2/50 dark:active:bg-s-base02/50 active:text-s-base1/50 dark:active:text-s-base01/50 select-none">
            Prepare
          </div>
        </div>
      </div>
      {props.children}
    </>
  )
}
