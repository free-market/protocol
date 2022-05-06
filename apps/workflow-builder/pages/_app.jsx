import '../styles/globals.css'
import { MotionConfig } from 'framer-motion'

function MyApp({ Component, pageProps }) {
  return (
    <MotionConfig reducedMotion="user">
      <Component {...pageProps} />
    </MotionConfig>
  )
}

export default MyApp
