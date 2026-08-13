import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#f7f6f3] text-[#111]">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 md:py-20 " >
        <div className=" grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-14">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://geniestudio.in/Images%20For%20GenieStudio/GenieStudio.png"
                alt="Genie Studio"
                width="30" height="93"
                loading="lazy"
                decoding="async"
                className="h-8 sm:h-9 w-cover"
              />
              <span className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-semibold">
                Genie
                <span className="text-[var(--accent-color)]">Studio</span>
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

          <div className="grid grid-cols-2 gap-4 sm:space-y-6 sm:block">

            <div>
              <h3 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Address
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-[#555] leading-relaxed">
                5A-2, KP Icon, Yendada,
                <br />
                Visakhapatnam,
                <br />
                Andhra Pradesh – 530045
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Contact
              </h3>
              <div className="space-y-1 text-xs sm:text-sm lg:text-base text-[#555]">
                <a
                  href="tel:+919032845433"
                  className="block hover:text-[#111] transition-colors"
                >
                  +91 9032845433
                </a>

                <a
                  href="mailto:admin@geniestudio.in"
                  className="block hover:text-[#111] transition-colors"
                >
                  admin@geniestudio.in
                </a>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:col-span-2">
            <div>
              <h3 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Quick links
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm lg:text-base text-[#555]">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/portfolio">Portfolio</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>


            <div>
              <h3 className="font-semibold mb-2 text-base sm:text-base lg:text-lg">
                Services
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm lg:text-base text-[#555]">
                <ul>
                  <li><a href="/services/corporate-shoots">Corporate Shoots</a></li>
                  <li><a href="/services/event-shoots">Event Shoots</a></li>
                  <li><a href="/services/product-shoots">Product Shoots</a></li>
                  <li><a href="/services/podcast-shoots">Podcast Shoots</a></li>
                  <li><a href="/services/professional-shoots">Professional Shoots</a></li>
                  <li><a href="/services/business-portfolio-shoots">Business Portfolio Shoots</a></li>
                </ul>
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
              {[
                {
                  Icon: Instagram,
                  link: "https://www.instagram.com/itsgeniestudio_official/",
                },
                {
                  Icon: Linkedin,
                  link: "https://www.linkedin.com/in/yourprofile",
                },
                {
                  Icon: Youtube,
                  link: "https://www.youtube.com/@itsgeniemedia_official",
                },
              ].map(({ Icon, link }, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#ddd] flex items-center justify-center text-[#111] transition-colors hover:bg-[#111] hover:text-white " >
                  <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
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