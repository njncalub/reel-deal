import { Head } from "$fresh/runtime.ts";

import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_URL,
} from "../constants/site.ts";
import DocumentHead from "../components/document/DocumentHead.tsx";

export default function Home() {
  const pageTitle = DEFAULT_SITE_NAME;
  const pageDescription = DEFAULT_SITE_DESCRIPTION;
  const siteUrl = DEFAULT_SITE_URL;

  return (
    <>
      <DocumentHead />

      <Head>
        <title>{pageTitle}</title>
        <meta property="description" content={pageDescription} />

        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={siteUrl} />
      </Head>

      <div class="px-4 py-8 mx-auto bg-gray-200">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <picture class="block mt-8 md:mt-0 mx-auto">
            <img
              src="/logo.png"
              width={200}
              height={100}
              alt="Reel Deal logo"
            />
          </picture>
        </div>
      </div>
    </>
  );
}
