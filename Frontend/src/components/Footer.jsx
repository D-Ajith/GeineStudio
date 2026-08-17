import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#f7f6f3] text-[#111]">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 md:py-20 " >
        <div className=" grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-14">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Decorative: the wordmark beside it already says the name. */}
              <img
                src="https://geniestudio.in/Images%20For%20GenieStudio/GenieStudio.png"
                alt=""
                width="30" height="93"
                loading="lazy"
                decoding="async"
                className="h-8 sm:h-9 w-cover"
              />
              <span className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-semibold">
                Genie
                <span className="text-[var(--accent-color-on-light)]">Studio</span>
              </span>
            </div>

            <p className="text-sm sm:text-sm lg:text-base text-[#555] leading-relaxed max-w-sm">
              Capturing moments, stories, and brands with creativity,
              precision, and professional excellence.
            </p>
            <Link
              to="/services"
              className=" inline-flex items-center gap-2 px-4 sm:px-6  py-2.5 sm:py-3 rounded-full bg-[#6b4a2d] text-white text-xs sm:text-sm lg:text-base font-medium w-fit transition-colors hover:bg-[#6b4a2d] ">
              More services <span>↗</span>
            </Link>
          </div>

          {/* These column titles are h2, not h3. They used to be h3 while the
              deepest heading above them on a sparse page (Gallery, 404, an
              empty Blog list) was the h1 — a skipped level, which is what
              "Heading elements are not in a sequentially-descending order"
              was reporting. Classes are untouched, so they look the same. */}
          <div className="grid grid-cols-2 gap-4 sm:space-y-6 sm:block">

            <div>
              <h2 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Address
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-[#555] leading-relaxed">
                5A-2, KP Icon, Yendada,
                <br />
                Visakhapatnam,
                <br />
                Andhra Pradesh – 530045
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Contact
              </h2>
              <div className="space-y-1 text-xs sm:text-sm lg:text-base text-[#555]">
                <a
                  href="tel:+919032845433"
                  className="block tap-target hover:text-[#111] transition-colors"
                >
                  +91 9032845433
                </a>

                <a
                  href="mailto:admin@geniestudio.in"
                  className="block tap-target hover:text-[#111] transition-colors"
                >
                  admin@geniestudio.in
                </a>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:col-span-2">
            <div>
              <h2 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Quick links
              </h2>
              <ul className="space-y-1 text-xs sm:text-sm lg:text-base text-[#555]">
                <li><Link to="/" className="inline-block tap-target">Home</Link></li>
                <li><Link to="/about" className="inline-block tap-target">About</Link></li>
                <li><Link to="/portfolio" className="inline-block tap-target">Portfolio</Link></li>
                <li><Link to="/services" className="inline-block tap-target">Services</Link></li>
                <li><Link to="/contact" className="inline-block tap-target">Contact</Link></li>
              </ul>
            </div>


            <div>
              <h2 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Services
              </h2>
              {/* The inner <ul> was a direct child of the outer <ul> — only
                  <li> may sit there, which is what Lighthouse's "Lists contain
                  only <li> elements" audit was failing on. Same six links,
                  one list. */}
              <ul className="space-y-1 text-xs sm:text-sm lg:text-base text-[#555]">
                <li><a href="/services/corporate-shoots" className="inline-block tap-target">Corporate Shoots</a></li>
                <li><a href="/services/event-shoots" className="inline-block tap-target">Event Shoots</a></li>
                <li><a href="/services/product-shoots" className="inline-block tap-target">Product Shoots</a></li>
                <li><a href="/services/podcast-shoots" className="inline-block tap-target">Podcast Shoots</a></li>
                <li><a href="/services/professional-shoots" className="inline-block tap-target">Professional Shoots</a></li>
                <li><a href="/services/business-portfolio-shoots" className="inline-block tap-target">Business Portfolio Shoots</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-[#ddd] mt-8 sm:mt-12 pt-5 sm:pt-6">
          <div
            className=" flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <p className="text-sm sm:text-sm text-[#555] text-center md:text-left">
              © {new Date().getFullYear()} Genie Studio. All rights reserved.
            </p>

            <div className="flex gap-2 sm:gap-3">
              {/* Icon-only links carry no text, so without a label a screen
                  reader announces them as "link" three times over. */}
              {[
                {
                  Icon: Instagram,
                  link: "https://www.instagram.com/itsgeniestudio_official/",
                  label: "Follow Genie Studio on Instagram",
                },
                {
                  Icon: Linkedin,
                  link: "https://www.linkedin.com/in/yourprofile",
                  label: "Follow Genie Studio on LinkedIn",
                },
                {
                  Icon: Youtube,
                  link: "https://www.youtube.com/@itsgeniemedia_official",
                  label: "Watch Genie Studio on YouTube",
                },
              ].map(({ Icon, link, label }, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className=" w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#ddd] flex items-center justify-center text-[#111] transition-colors hover:bg-[#111] hover:text-white " >
                  <Icon size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;