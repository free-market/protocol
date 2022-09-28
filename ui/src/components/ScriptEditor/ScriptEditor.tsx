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

        <div className="bg-sky-800 p-5 max-w-lg basis-64 flex flex-col">
          <p className="grow text-sky-400">
            Welcome! To get started, click "Prepare."
          </p>

          <div className="bg-sky-600 w-full px-5 py-3 flex justify-center items-center cursor-pointer rounded-2xl font-bold text-lg text-sky-300 active:bg-sky-700 active:text-sky-500 select-none">
            Prepare
          </div>
        </div>
      </div>
      {props.children}
    </>
  )
}
