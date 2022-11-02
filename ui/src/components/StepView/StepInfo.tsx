import React from 'react'
import cx from 'classnames'
import Box from '@mui/system/Box'
import Typography from '@mui/material/Typography'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { getStepInfo, WorkflowStep, WorkflowStepInput } from '@fmp/sdk'

import '../../magic-box.css'
import Popup from 'Popup'
import Paper from '@mui/material/Paper'
import Link from '@mui/material/Link'

export const StepInfo = (props: { step: WorkflowStepInput; active: boolean; children?: React.ReactNode }): JSX.Element => {
  const stepInfo = getStepInfo(props.step)
  return (
    <Popup
      popup={
        <Paper
          sx={{
            padding: 2,
            display: 'flex',
            alignSelf: 'flex-end',
            flexDirection: 'column',
            maxWidth: 300,
          }}
        >
          <div>{stepInfo.description}</div>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ paddingRight: 1 }}>Web&nbsp;site: </Typography>
            <Link href={stepInfo.webSiteUrl} rel="noreferrer" target="_blank">
              {stepInfo.webSiteUrl}
              <OpenInNewIcon sx={{ marginLeft: 1, width: 10, height: 10 }} />
            </Link>
          </Box>
        </Paper>
      }
    >
      <Box>
        <div
          className={cx(
            'p-1 rounded-full w-72 flex items-center bg-s-base2/75 text-s-base01 dark:bg-s-base01/50 dark:text-s-base1 poppy:bg-zinc-800 poppy:text-zinc-400 overflow-hidden',
            { magicbox: props.active },
          )}
        >
          <div className="p-2 z-10 bg-s-base2 dark:bg-s-base02 poppy:bg-zinc-700 rounded-full w-full flex items-center">
            <img style={{ width: 24, height: 24 }} src={stepInfo.iconUrl} />
            <Box sx={{ paddingLeft: 1 }}>
              <Typography>{stepInfo.name}</Typography>
            </Box>
          </div>
        </div>
      </Box>
    </Popup>
  )
}
