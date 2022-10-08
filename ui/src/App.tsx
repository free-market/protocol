import * as React from 'react'
import Box from '@mui/system/Box'
import Container from '@mui/system/Container'
import CachedIcon from '@mui/icons-material/Cached'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { WorkflowView } from '@component/VisualizerLayout/WorkflowView'
import { useState } from 'react'
import { INITIAL_WORKFLOW_TEXT, SnipitSelector } from 'SnipitSelector'
import { createWorkflowFromString } from 'workflowStepParser'
import './magic-box.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Workflow } from '@fmp/sdk'
import Editor from 'react-simple-code-editor'
import highlight from './highlight'
import './material-dark.css'
import './solarized-dark-atom.css'
import './fonts.css'
import Button from '@mui/material/Button'
import { StepInfo } from '@component/StepView/StepInfo'
import Popup from 'Popup'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: 'rgb(66, 89, 96)' },
    background: {
      default: 'transparent',
    },
  },
})

function createWorkflow() {
  return createWorkflowFromString(INITIAL_WORKFLOW_TEXT)
}

function App(): JSX.Element {
  const [workflowText, setWorkflowText] = useState<string>(INITIAL_WORKFLOW_TEXT)
  const [workflow, setWorkflow] = useState<Workflow>(createWorkflow())
  const [workflowRunning, setWorkflowRunning] = useState(false)

  console.log('app', workflowText)

  const onUpdateWorkflow = () => {
    const newWorkflow = createWorkflowFromString(workflowText)
    setWorkflow(newWorkflow)
  }

  const onSniptChanged = (workflowText: string) => {
    console.log('onSnipitChanged', workflowText)
    const newWorkflow = createWorkflowFromString(workflowText)
    console.log('newWorkflow', newWorkflow)
    setWorkflowText(workflowText)
    setWorkflow(newWorkflow)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="xl">
        <Box
          mx="auto"
          sx={{
            position: 'relative',
            // height: '100vh',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1,
            backgroundImage: 'none',
          }}

          // sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Popup popup={<span>The content of the Popover.</span>} />
          <Box minHeight={10} />
          <SnipitSelector onChange={onSniptChanged} />

          <Box sx={{ padding: 1, borderRadius: 4 }}>
            <Editor
              value={workflowText}
              highlight={highlight}
              onValueChange={setWorkflowText}
              preClassName="language-js"
              padding="1em"
              style={{ width: 900 }}
              className="grow font-mono caret-sky-50 text-sm basis-0"
            />
          </Box>
          {/* buttons */}
          <Box sx={{ display: 'flex', zIndex: 1 }}>
            <Box m={1}>
              <Button
                variant="contained"
                onClick={() => onUpdateWorkflow()}
                disabled={workflowRunning}
                startIcon={<CachedIcon />}
              >
                Update Workflow
              </Button>
            </Box>
            <Box m={1}>
              <Button
                variant="contained"
                onClick={() => setWorkflowRunning(true)}
                disabled={workflowRunning}
                startIcon={<PlayArrowIcon />}
              >
                Run Workflow
              </Button>
            </Box>
          </Box>
          <WorkflowView
            workflow={workflow}
            run={workflowRunning}
            onWorkflowCompleted={() => setWorkflowRunning(false)}
          />
          {/* <StepInfo step={workflow.steps[0]} active={true} /> */}
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
/*
import { WorkflowProvider } from './components/WorkflowProvider'
import VisualizerLayout from './components/VisualizerLayout'
import ScriptEditor from './components/ScriptEditor'
import ActionView from './components/ActionView'
import { buildWorkflow } from './utils'

const workflow = buildWorkflow()

const snippet = `module.exports = [
  wethWrap({ amount: '1000000000000000000' }),
  curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
  wormholeTokenTransfer({
    fromChain: 'Ethereum',
    fromToken: 'USDT',
    toChain: 'Solana',
    amount: '100%'
  }),
  saberSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
]`

function App(): JSX.Element {
  const editor = <ScriptEditor snippet={snippet} children={null} />

  return (
    <WorkflowProvider>
      <VisualizerLayout editor={editor}>
        {workflow.steps.map((it, index) => (
          <ActionView step={it} stepIndex={index} />
        ))}
      </VisualizerLayout>
    </WorkflowProvider>
  )
}

export default App
 */
