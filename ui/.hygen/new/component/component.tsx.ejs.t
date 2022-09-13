---
to: src/components/<%= component_name %>/<%= component_name %>.tsx
---
import React from 'react'

export const <%= component_name %> = (props: { children: React.ReactNode }): JSX.Element => {
  return (
    <>
      <p>Hello World</p>
      {props.children}
    </>
  )
}
