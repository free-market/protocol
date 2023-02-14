import './magic-box.css'
import './material-dark.css'
import './solarized-dark-atom.css'
import './fonts.css'
import './magic-box.css'
import AppLanding from '@component/AppLanding'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App(): JSX.Element {
  return <AppLanding />
}

function AppWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  )
}

export default AppWrapper
