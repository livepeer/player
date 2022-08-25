const { body } = document
import * as metrics from './lib/reportGenericVideoMetrics';
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

const fetchPlaybackUrl = async (playbackId: string, tld: string) => {
  const res = await fetch(`https://livepeer.${tld}/api/playback/${playbackId}`)
  console.log("fetchPlaybackUrl res", res);
  if (res.status !== 200) { 
    throw new Error(`${res.status} ${res.statusText}`)
  }
  const playback: PlaybackInfo = await res.json()
  console.log("fetchPlaybackUrl pla")
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
    : null
  return pathJoin(`https://livepeercdn.${tld}`, path)
}

const query: Record<string, string> = {}
new URLSearchParams(location.search).forEach(
  (value, name) => (query[name] = value)
)

const { autoplay = '1', muted = autoplay, loop, theme } = query
const video = document.getElementById('video')
if (/^(city|fantasy|forest|sea)$/.test(theme ?? '')) {
  addClass(video, `vjs-theme-${theme}`)
}

const createReportingUrl = function(src: string, query: Record<string, string>) {
  console.log("createReportingUrl: query", query);
  let { v: playbackId } = query;
  if (playbackId) {
    let url = "wss://sao-canary-catalyst-0.livepeer.fun/json_video+" + playbackId + ".js";
    console.log("createReportingUrl: playbackId not null url is: ", url);
    url = encodeURI(url)
    console.log("createReportingUrl: playbackId not null url is: ", url);
    return url
  }
  //for this example's sake, re-construct the info ws url so there's somewhere to report to
  console.log("createReportingUrl: video src is", encodeURI(src));
  let url = "wss://sao-canary-catalyst-0.livepeer.fun/";
  let filename: string[] = src.split("/");
  let video_name = filename[filename.length-2];
  console.log("createReportingUrl video name", video_name);
  url += "json_"+video_name.split(".")[0]+".js";
  url = encodeURI(url)
  console.log("createReportingUrl: reporting url is ", url);
  return url;
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
  console.log("getVideoSrc query", query);
  player.src({
    src,
    type: 'application/x-mpegURL',
    withCredentials: false,
  })
  player.hlsQualitySelector({
    displayCurrentQuality: true,
  })
  const reportingUrl = createReportingUrl(src, query)
  document.body.addEventListener("loadstart",function(e){
    metrics.reportGenericVideoMetrics(e.target, reportingUrl);
  },true);
})
