import type { AppProps } from 'next/app'
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react'

import '../styles/globals.css'

const isStaging =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('monster')
const _storage: Record<string, any> = {}
const livepeer = createReactClient({
  storage: {
    getItem: (k, d) => _storage[k] ?? d,
    removeItem: (k) => delete _storage[k],
    setItem: (k, v) => (_storage[k] = v),
  },
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
