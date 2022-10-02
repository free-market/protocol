import react from 'react'

export const Connector = (props: { active: boolean }): JSX.Element => {
  // return props.active ? (
  //   <div className="magicbox  flex grow shrink ml-5" style={{ paddingLeft: 17 }}></div>
  // ) : (
  return (
    <div className="border-t-4 border-dashed border-s-base2 dark:border-s-base02 flex grow shrink mx-5 group-hover:border-s-base1/25" />
  )
  // )
}
