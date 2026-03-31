import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingSocial from "./components/FloatingSocial";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import SplashCursor from "@/components/SplashCursor";
import Gallery from "./pages/Gallery";
import Services from './pages/Services';
import CorporateShoots from './pages/Corporateshoots';
import EventShoots from './pages/Eventshoots';
import ProductShoots from './pages/Productshoots';
import PodcastShoots from './pages/Podcastshoots';
import ProfessionalShoots from './pages/Professionalshoots';
import BusinessPortfolioShoots from './pages/BusinessportfolioShoots';
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
          <Route path="/services" element={<Services />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/corporate-shoots" element={<CorporateShoots />} />
          <Route path="/services/event-shoots" element={<EventShoots />} />
          <Route path="/services/product-shoots" element={<ProductShoots />} />
          <Route path="/services/podcast-shoots" element={<PodcastShoots />} />
          <Route path="/services/professional-shoots" element={<ProfessionalShoots />} />
          <Route path="/services/business-portfolio-shoots" element={<BusinessPortfolioShoots />} />
        </Routes>
      </main>
      <FloatingSocial />
      <Footer />
    </div>
  );
}
export default App;