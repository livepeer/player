import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo } from "react";
import { Player } from "@livepeer/react";
import mux from "mux-embed";

const isTrue = (b: string) =>
  b === "" || b === "1" || b?.toLowerCase() === "true";

function toStringValues(obj: Record<string, any>) {
  const strObj: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    strObj[key] = value.toString();
  }
  return strObj;
}

function isIframe() {
  try {
    return window.self !== window.top;
  } catch {}
  try {
    return window.self !== window.parent;
  } catch {}
  // default to true as this is only used to set a transparent background
  return true;
}

export async function getStaticProps(context: any) {
  return { props: {} };
}

const PlayerPage: NextPage = () => {
  const { query: rawQuery } = useRouter();
  const query = useMemo(() => toStringValues(rawQuery), [rawQuery]);
  let { autoplay, muted, loop, objectFit = "contain", v, url } = query;
  if (autoplay === undefined && (muted === undefined || isTrue(muted))) {
    autoplay = muted = "1";
  }

  useEffect(() => {
    if (!isIframe()) {
      document.body.style.backgroundColor = "black";
    }
  }, []);

  const mediaElementRef = useCallback((element: HTMLMediaElement) => {
    mux.monitor(element, {
      debug: false,
      data: {
        env_key: "8oj27fenun6v4ffvrgn6ehc7m",
        player_name: "Livepeer.TV Player",
        player_env: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
      },
    });
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <Player
        src={url}
        playbackId={v}
        muted={isTrue(muted)}
        autoPlay={isTrue(autoplay)}
        loop={isTrue(loop)}
        objectFit={objectFit as any}
        showPipButton
        theme={{
          radii: {
            containerBorderRadius: "0px",
          },
        }}
        mediaElementRef={mediaElementRef}
      />
    </div>
  );
};

export default PlayerPage;
