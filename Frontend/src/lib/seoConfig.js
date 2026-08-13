/**
 * One place for every route's search metadata.
 *
 * Titles and descriptions live here rather than inline in each page so that
 * they can be reviewed side by side — duplicate or near-duplicate titles are
 * one of the easiest ways to lose rankings, and that is only visible when they
 * sit next to each other.
 *
 * Length targets Google actually truncates at:
 *   title       ≈ 60 characters (the brand suffix is part of that budget)
 *   description ≈ 155 characters
 *
 * The homepage strings are fixed by the brief and are duplicated verbatim in
 * index.html, which is what non-JS crawlers read.
 */

const BRAND = "GenieStudio";

export const SITE_URL = "https://geniestudio.in";
export const SITE_NAME = BRAND;
export const DEFAULT_IMAGE = `${SITE_URL}/uploads/1786601041_1786601041120-705832864.png`;

/** Absolute URLs only — crawlers ignore relative canonicals and og:url. */
export const absolute = (path = "/") => {
  if (!path) return `${SITE_URL}/`;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * Service-page schema, shared by the shoot pages so they stay consistent.
 * Each is a Service provided by the one LocalBusiness declared in index.html —
 * linking by @id rather than redefining the business keeps the graph coherent.
 *
 * Lives here rather than beside the <Seo> component so that Seo.jsx exports
 * only a component, which is what React Fast Refresh needs.
 */
export function serviceSchema({ name, description, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absolute(path),
    serviceType: name,
    provider: { "@id": `${SITE_URL}/#localbusiness` },
    areaServed: { "@type": "City", name: "Visakhapatnam" },
    providerMobility: "static",
  };
}

/** The five services the site is being optimised around. */
export const SERVICES = [
  {
    key: "podcast",
    name: "Podcast Shoots",
    path: "/services/podcast-shoots",
    description:
      "Studio-grade Podcast Shoots in Visakhapatnam — multi-camera video, clean audio and full post-production for creators and brands building a podcast.",
  },
  {
    key: "product",
    name: "Product Shoots",
    path: "/services/product-shoots",
    description:
      "Product Shoots in Visakhapatnam built to sell — e-commerce, catalogue and lifestyle product photography with lighting and retouching that converts.",
  },
  {
    key: "corporate",
    name: "Corporate Shoots",
    path: "/services/corporate-shoots",
    description:
      "Corporate Shoots in Visakhapatnam — team portraits, office culture photography and brand visuals that give your company real visual authority.",
  },
  {
    key: "event",
    name: "Event Shoots",
    path: "/services/event-shoots",
    description:
      "Event Shoots in Visakhapatnam — complete coverage of launches, conferences and corporate events, delivered fast and edited for immediate use.",
  },
  {
    key: "professional",
    name: "Professional Shoots",
    path: "/services/professional-shoots",
    description:
      "Professional Shoots in Visakhapatnam — personal branding portraits and headshots for founders, leaders and professionals who need to look the part.",
  },
];

/**
 * Business Portfolio Shoots is a sixth offering that predates the five the
 * brief names. It keeps its page and its sitemap entry; it is simply not part
 * of the SERVICES list that drives the headline keyword set.
 */
export const SEO = {
  // Must stay byte-identical to the <title> and description in index.html.
  // Non-JS crawlers read index.html; Google reads whichever the React layer
  // renders last. If the two disagree, Google sees a title that flips between
  // crawls, which is exactly the state that stops it trusting either one.
  home: {
    path: "/",
    title: "Genie Studio | Photography, Podcast, Product & Professional Shoots",
    description:
      "Genie Studio is a professional creative studio in Visakhapatnam offering photography, podcast shoots, product shoots, corporate shoots, event shoots, professional shoots and business portfolio photography.",
  },
  about: {
    path: "/about",
    title: `About ${BRAND} | Creative Photography & Video Studio`,
    description:
      "Meet GenieStudio — the Visakhapatnam creative studio behind Podcast Shoots, Product Shoots, Corporate Shoots and Event Shoots for brands that care how they look.",
  },
  services: {
    path: "/services",
    title: `Our Services | Podcast, Product, Corporate & Event Shoots`,
    description:
      "Explore GenieStudio's services: Podcast Shoots, Product Shoots, Corporate Shoots, Event Shoots and Professional Shoots, produced end to end in Visakhapatnam.",
  },
  portfolio: {
    path: "/portfolio",
    title: `Portfolio | ${BRAND} Photography & Video Work`,
    description:
      "Browse GenieStudio's portfolio of Podcast Shoots, Product Shoots, Corporate Shoots, Event Shoots and Professional Shoots produced for brands in Visakhapatnam.",
  },
  gallery: {
    path: "/gallery",
    title: `Gallery | ${BRAND} Studio Photography`,
    description:
      "A visual gallery of work from GenieStudio — product, corporate, event, podcast and professional photography shot in our Visakhapatnam studio and on location.",
  },
  contact: {
    path: "/contact",
    title: `Contact ${BRAND} | Book a Shoot in Visakhapatnam`,
    description:
      "Book Podcast Shoots, Product Shoots, Corporate Shoots, Event Shoots or Professional Shoots with GenieStudio in Visakhapatnam. Tell us about your project.",
  },
  blogs: {
    path: "/blogs",
    title: `Blog | Photography & Video Insights by ${BRAND}`,
    description:
      "Practical guides on podcast production, product photography, corporate branding and event coverage from the GenieStudio team in Visakhapatnam.",
  },
  businessPortfolio: {
    path: "/services/business-portfolio-shoots",
    title: `Business Portfolio Shoots | ${BRAND}`,
    description:
      "Business Portfolio Shoots in Visakhapatnam — complete visual storytelling that packages your brand, team and product into one coherent set of images.",
  },
};

/** Service pages, keyed the same way as SEO above so pages import one shape. */
export const SERVICE_SEO = Object.fromEntries(
  SERVICES.map((service) => [
    service.key,
    {
      path: service.path,
      name: service.name,
      title: `${service.name} in Visakhapatnam | ${BRAND}`,
      description: service.description,
    },
  ])
);

/** Every indexable route, used to generate sitemap.xml. */
export const ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "monthly" },
  ...SERVICES.map((s) => ({ path: s.path, priority: "0.9", changefreq: "monthly" })),
  { path: "/services/business-portfolio-shoots", priority: "0.8", changefreq: "monthly" },
  { path: "/portfolio", priority: "0.8", changefreq: "weekly" },
  { path: "/gallery", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/blogs", priority: "0.7", changefreq: "weekly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
];

export { BRAND };
