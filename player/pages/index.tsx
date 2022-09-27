import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
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

export function toStringValues(obj: Record<string, any>) {
  const strObj: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    strObj[key] = value.toString()
  }
  return strObj
}

const Player: NextPage = () => {
  const { query: rawQuery } = useRouter()
  const query = toStringValues(rawQuery)
  const videoRef = useRef<HTMLElement>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    const { autoplay = '1', muted = autoplay, loop, theme } = query
    if (/^(city|fantasy|forest|sea)$/.test(theme ?? '')) {
      addClass(video, `vjs-theme-${theme}`)
    }
    // @ts-ignore
    const player = videojs(video, {
      autoplay: isTrue(autoplay),
      muted: isTrue(muted),
      loop: isTrue(loop),
    })

    player.volume(1)
    player.controls(true)

    getVideoSrc(query).then((src) => {
      player.src({
        src,
        type: 'application/x-mpegURL',
        withCredentials: false,
      })
      player.hlsQualitySelector({
        displayCurrentQuality: true,
      })
    })
  }, [query])

  return (
    <div className={styles.container}>
      <video id='video' className={styles.player} controls preload='auto'>
        <p className='vjs-no-js'>
          To view this video please enable JavaScript, and consider upgrading to
          a web browser that
          <a
            href='https://videojs.com/html5-video-support/'
            target='_blank'
            rel='noreferrer'
          >
            supports HTML5 video
          </a>
        </p>
      </video>
    </div>
  )
}

export default Player
