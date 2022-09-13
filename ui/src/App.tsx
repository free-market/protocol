import { MotionConfig, LazyMotion, domMax } from 'framer-motion'

import ExampleWorkflow from './components/ExampleWorkflow'

function App(): JSX.Element {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig transition={{ duration: 0.2 }}>
        <ExampleWorkflow children={null} stageNumber={0} />
      </MotionConfig>
    </LazyMotion>
  )
}

export default App
