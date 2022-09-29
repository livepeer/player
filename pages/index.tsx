import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { Player } from '@livepeer/react'

import styles from '../styles/Player.module.css'

const isTrue = (b: string) =>
  b === '' || b === '1' || b?.toLowerCase() === 'true'

function toStringValues(obj: Record<string, any>) {
  const strObj: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    strObj[key] = value.toString()
  }
  return strObj
}

const EmbeddablePlayer: NextPage = () => {
  const { query: rawQuery } = useRouter()
  const query = useMemo(() => toStringValues(rawQuery), [rawQuery])
  const { autoplay = '1', muted = autoplay, loop, v, url } = query

  const srcProps = url ? { src: url } : { playbackId: v }
  return (
    <div className={styles.container}>
      <Player
        muted={isTrue(muted)}
        autoPlay={isTrue(autoplay) as any}
        loop={isTrue(loop)}
        {...srcProps}
      />
    </div>
  )
}

export default EmbeddablePlayer
