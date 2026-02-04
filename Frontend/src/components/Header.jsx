import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    { name: "Contact", path: "/contact" }

  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-black shadow-md" : "bg-transparent"}`} >
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link to="/" className="flex items-center gap-3">
            <img src="/GenieStudio.png" alt="Geine Studio" className="h-10 md:h-11 w-cover" />
            <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-white">
              Geine<span className="text-[var(--accent-color)]">Studio</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="relative text-sm lg:text-base xl:text-lg font-medium  tracking-wide text-white" >
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[var(--accent-color)]" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+919966888428" className=" mx-6 inline-flex items-center pl-4 pr-1.5 py-1 rounded-full bg-white text-black text-xs sm:text-sm lg:text-base font-medium border border-white shadow-sm hover:shadow-md transition-all" >
              <span className="mr-2 whitespace-nowrap">
                +91 9966888428
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
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-white text-sm">
                {item.name}
              </Link>
            ))}

          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;