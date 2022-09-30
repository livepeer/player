import type { AppProps } from 'next/app'
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react'
import memoryLocalStorage from 'localstorage-memory'
import '../styles/globals.css'

const isStaging =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('monster')
const livepeer = createReactClient({
  storage: memoryLocalStorage,
  provider: studioProvider(
    !isStaging
      ? undefined
      : {
          baseUrl: 'https://livepeer.monster/api',
          apiKey: '',
        }
  ),
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LivepeerConfig client={livepeer}>
      <Component {...pageProps} />
    </LivepeerConfig>
  )
}

export default MyApp
