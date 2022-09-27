import type { AppProps } from 'next/app'

import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react'

const livepeer = createReactClient({ provider: studioProvider() })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LivepeerConfig client={livepeer}>
      <Component {...pageProps} />
    </LivepeerConfig>
  )
}

export default MyApp
