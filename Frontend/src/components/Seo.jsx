/**
 * Per-route <title>, meta and JSON-LD.
 *
 * HOW THIS WORKS WITHOUT react-helmet
 * -----------------------------------
 * React 19 hoists <title>, <meta> and <link> into document.head no matter how
 * deep in the tree they are rendered, and removes them when the component
 * unmounts. So a page can just render <Seo …/> and get correct head tags on
 * navigation, with no extra dependency and no manual DOM cleanup.
 *
 * WHAT THIS DOES AND DOES NOT FIX
 * The site is a client-rendered SPA served as one static index.html, so:
 *
 *   - Googlebot renders JS, sees these tags, and indexes each route correctly.
 *   - Crawlers that do NOT render JS (Facebook, LinkedIn, WhatsApp, Slack)
 *     only ever see the static tags in index.html. Link previews for deep
 *     routes therefore show the homepage card. Fixing that properly needs
 *     prerendering or SSR — see IMAGE-PIPELINE.md's sibling notes in SEO.md.
 *
 * Because index.html already carries a full default set, every tag here is an
 * OVERRIDE. React keeps the last one rendered for a given <meta name>, so the
 * route-level values win while the component is mounted.
 */

import { SITE_NAME, DEFAULT_IMAGE, absolute } from "../lib/seoConfig";

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  /** Set true on thin or duplicate pages that should stay out of the index. */
  noindex = false,
  /** Any extra schema.org object(s) to emit for this route. */
  schema,
  /** [{ name, path }] — rendered as BreadcrumbList, which Google shows in results. */
  breadcrumbs,
}) {
  const url = absolute(path);

  const breadcrumbSchema = breadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: absolute(crumb.path),
        })),
      }
    : null;

  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />

      {/* Overrides index.html's index,follow for pages that must not rank. */}
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {/* `schema` accepts one object or an array — a page like the podcast one
          needs both Service and FAQPage, and Google reads multiple ld+json
          blocks on a page perfectly well. */}
      {schema &&
        (Array.isArray(schema) ? schema : [schema]).map((entry, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(entry)}
          </script>
        ))}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </>
  );
}

