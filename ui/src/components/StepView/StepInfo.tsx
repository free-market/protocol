import React from 'react'
import Box from '@mui/system/Box'
import Typography from '@mui/material/Typography'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { WorkflowStep } from '@fmp/sdk'

// import '../../magic-box.css'
import Popup from 'Popup'
import Paper from '@mui/material/Paper'
import Link from '@mui/material/Link'

export const StepInfo = (props: { step: WorkflowStep; active: boolean; children?: React.ReactNode }): JSX.Element => {
  const activeClass = props.active ? 'magicbox ' : ''
  // const activeClass = 'magicbox'
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
          <div>{props.step.info.description}</div>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ paddingRight: 1 }}>Web&nbsp;site: </Typography>
            <Link href={props.step.info.webSiteUrl} rel="noreferrer" target="_blank">
              {props.step.info.webSiteUrl}
              <OpenInNewIcon sx={{ marginLeft: 1, width: 10, height: 10 }} />
            </Link>
          </Box>
        </Paper>
      }
    >
      <Box>
        <Box
          className={activeClass}
          sx={{
            borderRadius: 55,
            minWidth: 250,
            backgroundColor: '#282828',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            //   zIndex: 10,
          }}
        >
          <img style={{ width: 24, height: 24 }} src={props.step.info.iconUrl} />
          <Box sx={{ paddingLeft: 1 }}>
            <Typography>{props.step.info.name}</Typography>
          </Box>
        </Box>
      </Box>
    </Popup>
  )
}
