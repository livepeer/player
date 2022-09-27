import type { AppProps } from 'next/app'

import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const {
    query: { monster },
  } = useRouter()
  const isStaging = !!monster
  const livepeer = useMemo(
    () =>
      createReactClient({
        provider: studioProvider(
          !isStaging
            ? undefined
            : {
                baseUrl: 'https://livepeer.monster/api',
              }
        ),
      }),
    [isStaging]
  )

  return (
    <LivepeerConfig client={livepeer}>
      <Component {...pageProps} />
    </LivepeerConfig>
  )
}

export default MyApp
