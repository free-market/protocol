import { NumberSpinner } from '@component/StepView/NumberSpinner'
import { AssetBalance, formatMoney, getAssetInfo, getChainInfo } from '@fmp/sdk'
import { Box, CssBaseline, Typography } from '@mui/material'

interface Props {
  balances?: AssetBalance[]
}

const nonZeroDigitsExpr = /[1-9]+/

function isNonZero(s: string) {
  return nonZeroDigitsExpr.test(s)
}

/**
 * Primary UI component for user interaction
 */
export const Balances = (props: Props): JSX.Element => {
  if (!props.balances) {
    return <></>
  }
  const nonZeroBalances = props.balances?.filter((it) => isNonZero(it.balance))
  if (nonZeroBalances.length === 0) {
    return <> </>
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 10,
        top: 0,
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CssBaseline />
      <Typography variant="h6" sx={{ marginLeft: 1 }}>
        Balances
      </Typography>
      {nonZeroBalances.map((assetBalance) => {
        const assetInfo = getAssetInfo(assetBalance.asset)
        const chainInfo = getChainInfo(assetBalance.asset.chain)
        const numbers = formatMoney(assetBalance.balance, assetInfo.decimals, 3)
        console.log('numberz ' + numbers)
        return (
          <Box
            sx={{
              padding: 1,
              borderRadius: 2,
              // backgroundColor: '#333',
              minWidth: 150,
            }}
          >
            <div style={{ display: 'flex' }}>
              <img src={chainInfo.iconUrl} width="16px" height="16px" />
              <img src={assetInfo.iconUrl} width="16px" height="16px" />
              <span style={{ fontSize: '12px', marginLeft: 5 }}>
                {assetInfo.symbol} <NumberSpinner numbers={numbers} />
              </span>
            </div>
          </Box>
        )
      })}
    </Box>
  )
}
