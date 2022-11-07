import { NumberSpinner } from '@component/StepView/NumberSpinner'
import { AssetBalance, formatMoney, getAssetInfo } from '@fmp/sdk'
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
      }}
    >
      <CssBaseline />
      {nonZeroBalances.map((assetBalance) => {
        const assetInfo = getAssetInfo(assetBalance.asset)
        const numbers = formatMoney(assetBalance.balance, assetInfo.decimals, 3)
        return (
          <Box
            sx={{
              padding: 1,
              borderRadius: 2,
              // backgroundColor: '#333',
              minWidth: 150,
            }}
          >
            <Typography variant="h6">
              {assetInfo.symbol} <NumberSpinner numbers={numbers} />
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
