import { Head } from "$fresh/runtime.ts";

export default function DocumentHead() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta
          property="keywords"
          content="movies, rental"
        />
        <meta property="author" content="Nap Joseph Calub" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <meta property="og:site_name" content="Reel Deal" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://reel-deal.napjose.ph/ogp.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://reel-deal.napjose.ph/ogp.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="878" />
        <meta property="og:image:height" content="500" />
        <meta
          property="og:image:alt"
          content="The logo of Reel Deal."
        />
      </Head>
    </>
  );
}
