import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingSocial from "./components/FloatingSocial";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import SplashCursor from "@/components/SplashCursor";
import Gallery from "./pages/Gallery";
import "aos/dist/aos.css";
function App() {
  const location = useLocation();
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 120,
      mirror: false,
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <SplashCursor />
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <FloatingSocial />
      <Footer />
    </div>
  );
}
export default App;