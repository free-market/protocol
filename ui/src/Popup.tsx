import React, { PropsWithChildren } from 'react'
// import PropTypes from 'prop-types'
import { withStyles } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import HoverPopover from 'material-ui-popup-state/HoverPopover'
import PopupState, { bindHover, bindPopover } from 'material-ui-popup-state'

// const styles = (theme) => ({
//   popover: {
//     pointerEvents: 'none',
//   },
//   paper: {
//     padding: theme.spacing.unit,
//   },
// })

interface Props {
  popup: JSX.Element
}

const HoverPopoverPopupState = (props: PropsWithChildren<Props>) => (
  <PopupState variant="popover" popupId="demoPopover">
    {(popupState) => (
      <div>
        <div {...bindHover(popupState)}>{props.children && props.children}</div>
        <HoverPopover
          {...bindPopover(popupState)}
          // className={classes.popover}
          // classes={{
          //   paper: classes.paper,
          // }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          {props.popup}
        </HoverPopover>
      </div>
    )}
  </PopupState>
)

// HoverPopoverPopupState.propTypes = {
//   classes: PropTypes.object.isRequired,
// }

// export default withStyles(styles)(HoverPopoverPopupState)
export default HoverPopoverPopupState
