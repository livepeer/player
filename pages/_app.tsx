import type { AppProps } from "next/app";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
  noopStorage,
  createStorage,
} from "@livepeer/react";
import "../styles/globals.css";

const isStaging =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("monster");
const livepeer = createReactClient({
  storage: createStorage({
    storage: noopStorage
  }),
  provider: studioProvider(
    !isStaging
      ? undefined
      : {
          baseUrl: "https://livepeer.monster/api",
          apiKey: "",
        }
  ),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LivepeerConfig client={livepeer}>
      <Component {...pageProps} />
    </LivepeerConfig>
  );
}

export default MyApp;
