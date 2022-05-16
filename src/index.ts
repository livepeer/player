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

const query: Record<string, string> = {}
new URLSearchParams(location.search).forEach(
  (value, name) => (query[name] = value)
)
const {
  autoplay = '1',
  theme = 'forest',
  live,
  recording,
  vod,
  path: pathQs,
  url,
  monster,
} = query

const isTrue = (b: string) =>
  b === '' || b === '1' || b?.toLowerCase() === 'true'
const withIndex = (p: string) =>
  p.endsWith('/index.m3u8') ? p : pathJoin(p, 'index.m3u8')

const path = pathQs
  ? withIndex(pathQs)
  : live
  ? `/hls/${live}/index.m3u8`
  : recording
  ? `/recordings/${recording}/index.m3u8`
  : vod
  ? `/asset/${vod}/video` // TODO: HLS playback here once we support VOD playbackId
  : null
const tld = isTrue(monster) ? 'monster' : 'com'
const src = url || pathJoin(`https://livepeercdn.${tld}`, path)

const video = document.getElementById('video')
if (/^(city|fantasy|forest|sea)$/.test(theme ?? '')) {
  addClass(video, `vjs-theme-${theme}`)
}
// @ts-ignore
const player = videojs(
  video,
  !isTrue(autoplay) ? {} : { autoplay: true, muted: true }
)

player.volume(1)
player.controls(true)

if (src) {
  player.src({
    src,
    type: 'application/x-mpegURL',
    withCredentials: false,
  })
  player.hlsQualitySelector({
    displayCurrentQuality: true,
  })
}
