import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Services", path: "/services" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
    { name: "Blog", path: "/blogs" }

  ];
  const serviceItems = [
    { name: "Podcast Shoots", path: "/services/podcast-shoots" },
    { name: "Product Shoots", path: "/services/product-shoots" },
    { name: "Corporate Shoots", path: "/services/corporate-shoots" },
    { name: "Event Shoots", path: "/services/event-shoots" },
    { name: "Professional Shoots", path: "/services/professional-shoots" },
    { name: "Business Portfolio", path: "/services/business-portfolio-shoots" },
  ];
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-black shadow-md" : "bg-transparent"}`} >
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link to="/" className="flex items-center gap-3">
            {/* 117×264 WebP rather than the 409×921 PNG the favicon still uses —
                the logo never renders above 44px tall. width/height are set so
                the header does not reflow while it loads. */}
            <img src="https://geniestudio.in/Images%20For%20GenieStudio/GenieStudio.png" alt="Genie Studio" width="30" height="93"
              className="h-10 md:h-11 w-cover" fetchPriority="high" decoding="async" />
            <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-white">
              Genie<span className="text-[var(--accent-color)]">Studio</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              if (item.name === "Services") {
                return (
                  <div
                    key={item.path}
                    className="relative group"
                    onMouseEnter={() => setServiceOpen(true)}
                    onMouseLeave={() => setServiceOpen(false)}
                  >
                    <Link
                      to="/services"
                      className="flex items-center gap-1 cursor-pointer text-sm lg:text-base xl:text-lg font-medium tracking-wide text-white"
                    >
                      Services
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${serviceOpen ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </Link>

                    <div className={`absolute top-full left-0 mt-3 w-56 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 
          ${serviceOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>

                      {serviceItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative text-sm lg:text-base xl:text-lg font-medium tracking-wide text-white"
                >
                  {item.name}
                  {isActive(item.path) && (
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[var(--accent-color)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+919032845433" className=" mx-6 inline-flex items-center pl-4 pr-1.5 py-1 rounded-full bg-white text-black text-xs sm:text-sm lg:text-base font-medium border border-white shadow-sm hover:shadow-md transition-all" >
              <span className="mr-2 whitespace-nowrap">
                +91 9032845433
              </span>

              <span className=" w-8 h-8 rounded-full bg-[#6b4a2d] flex items-center justify-center text-white" >
                <Phone size={14} />
              </span>
            </a>

          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white" >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`lg:hidden transition-all duration-300 ${menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`} >
          <div className="bg-black border-t border-white/10 py-4">
            {navItems.map((item) => {
              if (item.name === "Services") {
                return (
                  <div key={item.path} className="flex flex-col">

                    <div className="flex items-center justify-between px-6 py-3">

                      <Link
                        to="/services"
                        onClick={() => setMenuOpen(false)}
                        className="text-white text-sm"
                      >
                        Services
                      </Link>

                      <button
                        onClick={() => setServiceOpen(!serviceOpen)}
                        className="text-white text-sm"
                      >
                        {serviceOpen ? "-" : "+"}
                      </button>

                    </div>

                    <div className={`transition-all duration-300 ${serviceOpen ? "max-h-96" : "max-h-0 overflow-hidden"}`}>
                      {serviceItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setMenuOpen(false)}
                          className="block px-10 py-2 text-sm text-gray-300"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 text-white text-sm"
                >
                  {item.name}
                </Link>
              );
            })}

          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;