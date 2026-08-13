import { Link } from "react-router-dom";
import Seo from "../components/Seo";

/**
 * Catch-all route.
 *
 * Apache rewrites every unmatched path to index.html, so a typo'd or stale URL
 * used to return HTTP 200 with a blank page. Google treats that as a "soft
 * 404": the URL looks valid, gets crawled, and eats crawl budget that should go
 * to real pages — and an infinite space of them can be discovered from bad
 * inbound links.
 *
 * A static host cannot return a real 404 status for a SPA route, so the fix is
 * `noindex`: the page is explicitly excluded from the index, while `follow`
 * still lets Google walk the links back to real content.
 */
export default function NotFound() {
  return (
    <main className="w-full min-h-[60vh] flex items-center justify-center px-6 py-20 bg-white">
      <Seo
        title="Page Not Found | GenieStudio"
        description="This page could not be found. Explore GenieStudio's Podcast, Product, Corporate, Event and Professional Shoots instead."
        path="/404"
        noindex
      />

      <div className="max-w-xl text-center">
        <p className="text-[#6B4A2D] font-semibold text-sm uppercase tracking-wider">
          Error 404
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-5">
          We couldn't find that page
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
          The page you're looking for may have moved or no longer exists. Head back
          to the homepage, or take a look at what we shoot.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 text-sm sm:text-base bg-[#6B4A2D] text-white rounded-full font-semibold hover:shadow-2xl transition-all duration-300"
          >
            Back to Home
          </Link>
          <Link
            to="/services"
            className="px-6 py-3 text-sm sm:text-base border border-[#6B4A2D] text-[#6B4A2D] rounded-full font-semibold hover:bg-[#6B4A2D] hover:text-white transition-all duration-300"
          >
            View Our Services
          </Link>
        </div>
      </div>
    </main>
  );
}
