import './magic-box.css'
import './material-dark.css'
import './solarized-dark-atom.css'
import './fonts.css'
import './magic-box.css'
import Layout from '@component/Layout'
import CoreProvider from '@component/CoreProvider'

function App(): JSX.Element {
  return (
    <CoreProvider>
      <Layout />
    </CoreProvider>
  )
}

export default App
