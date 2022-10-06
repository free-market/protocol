import React from 'react'
import Typography from '@mui/material/Typography'
import { motion, AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import { InformationCircleIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Asset, MoneyAmount, WorkflowStep, BLOCKCHAIN_INFO } from '@fmp/sdk'

import '../../magic-box.css'
import Box from '@mui/system/Box'
// import '../../magic-box2.css'

export const StepInfo = (props: { step: WorkflowStep; active: boolean; children?: React.ReactNode }): JSX.Element => {
  const activeClass = props.active ? 'magicbox ' : ''
  // const activeClass = 'magicbox'
  return (
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
    // <div className="magicbox" style={{ position: 'relative', width: 300, height: 200 }}>

    // </div>
    // <div
    //   className={`${activeClass} rounded-full p-2 bg-s-base2 dark:bg-s-base02 text-s-base0 dark:text-s-base00 font-bold flex items-center space-x-2 transition group-hover:bg-s-base2 dark:group-hover:bg-s-base02 min-w-[240px]`}
    // >
    //   <img className="inline w-6 h-6 rounded-full" src={props.step.info.iconUrl} />
    //   <div className="inline">{props.step.info.name}</div>
    // </div>
  )
}
