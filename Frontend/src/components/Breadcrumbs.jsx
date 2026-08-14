import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Visible breadcrumb trail: Home > Services > Podcast Shoots
 *
 * Two jobs. For visitors it makes the site hierarchy obvious and gives a
 * one-click way back up. For Google it is a second, human-visible confirmation
 * of the same structure the BreadcrumbList JSON-LD describes — Google prefers
 * structured data that matches something actually rendered on the page, and
 * breadcrumb trails are one of the things it will show in place of the raw URL
 * in a result.
 *
 * Takes the SAME array shape as the `breadcrumbs` prop on <Seo>, so a page
 * declares its trail once and passes it to both.
 *
 * Uses react-router <Link> rather than <a href>, so following a crumb is a
 * client-side navigation instead of a full document reload.
 */
export default function Breadcrumbs({ items = [], className = "" }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />
              )}

              {isLast ? (
                // The current page is not a link — and aria-current tells a
                // screen reader which crumb you are actually on.
                <span aria-current="page" className="font-semibold">
                  {item.name}
                </span>
              ) : (
                <Link to={item.path} className="hover:underline opacity-80 hover:opacity-100">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
