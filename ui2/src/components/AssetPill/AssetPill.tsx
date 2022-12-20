import cx from 'classnames'
import { CatalogAsset } from 'config'

export const AssetPill = (
  props: {
    asset: CatalogAsset
    shadow?: boolean
    network?: 'not-included' | 'included' | 'included-with-tooltip'
    groupHover?: boolean
  } & React.HTMLProps<HTMLDivElement>,
): JSX.Element => {
  const {
    asset,
    shadow = false,
    network = 'included',
    groupHover = false,
    ...remaining
  } = props
  return (
    <div
      className={cx(
        'inline-flex flex-col items-start rounded-xl bg-stone-600 text-stone-300 py-1 px-2',
        {
          'shadow-md': shadow,
          'group-hover:bg-stone-500 group-force-hover:bg-stone-500': groupHover,
        },
      )}
      {...remaining}
    >
      <div className="inline-flex items-center space-x-2 font-medium text-lg">
        <div className="relative w-5 h-5">
          <div className="rounded-full overflow-hidden w-5 h-5 bg-stone-500">
            <img className="w-full h-full" src={asset.icon.url} />
          </div>
          <div className="absolute rounded-full overflow-hidden w-3 h-3 bg-stone-500 -bottom-1 -right-1">
            <img className="w-full h-full" src={asset.network.chain.icon.url} />
          </div>
        </div>
        <span className="inline-flex flex-col items-start font-medium">
          <span>{asset.label}</span>
        </span>
      </div>

      {network !== 'not-included' && (
        <span className="text-xs text-stone-400 flex items-center gap-1">
          <span>on {asset.network.chain.label}</span>
          {network === 'included-with-tooltip' && (
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          )}
        </span>
      )}
    </div>
  )
}
