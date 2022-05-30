const { body } = document

// set background to transparent when inside iframe
// if (window.location !== window.parent.location) {
//   body.style.background = 'none transparent'
// }

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
  video.className += ` ${class_}`
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

const fetchPlaybackUrl = async (pid: string, tld: string) => {
  try {
    const res = await fetch(`https://livepeer.${tld}/api/playback/${pid}`)
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
  } catch (err) {
    console.error('WARN: Failed to fetch playback URL', err)
    return `https://livepeercdn.${tld}/hls/${pid}/index.m3u8`
  }
}

const isTrue = (b: string) =>
  b === '' || b === '1' || b?.toLowerCase() === 'true'
const withIndex = (p: string) =>
  p.endsWith('/index.m3u8') ? p : pathJoin(p, 'index.m3u8')

const getVideoSrc = async (query: Record<string, string>) => {
  const {
    p, // short for playbackId
    playbackId = p,
    live,
    recording,
    path: pathQs,
    url,
    monster,
  } = query
  if (url) {
    return url
  }

  const tld = isTrue(monster) ? 'monster' : 'com'
  if (playbackId) {
    return fetchPlaybackUrl(playbackId, tld)
  }

  const path = pathQs
    ? withIndex(pathQs)
    : live
    ? `/hls/${live}/index.m3u8`
    : recording
    ? `/recordings/${recording}/index.m3u8`
    : null
  return pathJoin(`https://livepeercdn.${tld}`, path)
}

const query: Record<string, string> = {}
new URLSearchParams(location.search).forEach(
  (value, name) => (query[name] = value)
)

const { autoplay = '1', muted = autoplay, loop, theme = 'fantasy' } = query
const video = document.getElementById('video')
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
