import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { VideoPlayer } from '@livepeer/react'

import styles from '../styles/Player.module.css'

const pathJoin = (p1: string, p2: string) => {
  if (!p1 || !p2) {
    return p1 || p2
  }
  if (p1.slice(-1) === '/') {
    p1 = p1.slice(0, -1)
  }
  if (p2[0] === '/') {
    p2 = p2.slice(1)
  }
  return `${p1}/${p2}`
}

const addClass = (elm: HTMLElement, class_: string) => {
  if (elm.classList?.add) {
    return elm.classList.add(class_)
  }
  elm.className += ` ${class_}`
}

type PlaybackInfo = {
  type: string
  meta: {
    live?: 0 | 1
    source: {
      hrn: string
      type: string
      url: string
    }[]
  }
}

const hlsPlaybackType = 'html5/application/vnd.apple.mpegurl'

const fetchPlaybackUrl = async (playbackId: string, tld: string) => {
  const res = await fetch(`https://livepeer.${tld}/api/playback/${playbackId}`)
  if (res.status !== 200) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  const playback: PlaybackInfo = await res.json()
  const hlsInfo = playback?.meta?.source?.find(
    (s) => s.type === hlsPlaybackType
  )
  if (!hlsInfo) {
    throw new Error('No HLS source found')
  }
  return hlsInfo.url
}

const isTrue = (b: string) =>
  b === '' || b === '1' || b?.toLowerCase() === 'true'
const withIndex = (p: string) =>
  p.endsWith('/index.m3u8') ? p : pathJoin(p, 'index.m3u8')

const getVideoSrc = async (query: Record<string, string>) => {
  let { v: playbackId, live, recording, path: pathQs, url, monster } = query
  if (url) {
    return url
  }

  const tld = isTrue(monster) ? 'monster' : 'com'
  if (playbackId) {
    try {
      return await fetchPlaybackUrl(playbackId, tld)
    } catch (err) {
      console.error('WARN: Failed to fetch playback URL for', playbackId, err)
      live = playbackId
    }
  }

  const path = pathQs
    ? withIndex(pathQs)
    : live
    ? `/hls/${live}/index.m3u8`
    : recording
    ? `/recordings/${recording}/index.m3u8`
    : ''
  return pathJoin(`https://livepeercdn.${tld}`, path)
}

function toStringValues(obj: Record<string, any>) {
  const strObj: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    strObj[key] = value.toString()
  }
  return strObj
}

function toBoolean(val: string) {
  val = val?.toLowerCase()
  return val === 'true' || val === '1'
}

const Player: NextPage = () => {
  const { query: rawQuery } = useRouter()
  const query = useMemo(() => toStringValues(rawQuery), [rawQuery])
  const { autoplay = '1', muted = autoplay, loop } = query
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    getVideoSrc(query).then((src) => {
      setSrc(src)
    })
  }, [query])

  return (
    <div className={styles.container}>
      <VideoPlayer
        src={src}
        muted={toBoolean(muted)}
        autoPlay={toBoolean(autoplay)}
        loop={toBoolean(loop)}
      />
    </div>
  )
}

export default Player
