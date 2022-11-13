import cx from 'classnames'

export type AssetDescription = { label: string; icon: { url: string } }

export const AssetPill = (props: { asset: AssetDescription; shadow?: boolean } & React.HTMLProps<HTMLDivElement>): JSX.Element => {
  const { asset, shadow = false, ...remaining } = props
  return (
    <div
      className={cx('inline-flex items-center rounded-full bg-zinc-600 text-zinc-300 py-1 px-2 space-x-2 font-medium text-lg', {
        'shadow-md': shadow,
      })}
      {...remaining}
    >
      <div className="rounded-full overflow-hidden w-5 h-5">
        <img src={asset.icon.url} />
      </div>
      <span>{asset.label}</span>
    </div>
  )
}
