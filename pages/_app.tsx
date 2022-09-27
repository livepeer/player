import type { AppProps } from 'next/app'

import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react'

const isStaging =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('monster')
const livepeer = createReactClient({
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
