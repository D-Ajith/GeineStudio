import { useEffect, lazy, Suspense } from "react";
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
import Corporateshoots from './pages/Corporateshoots';
import Eventshoots from './pages/Eventshoots';
import Productshoots from './pages/Productshoots';
import Podcastshoots from './pages/Podcastshoots';
import Professionalshoots from './pages/Professionalshoots';
import Businessportfolioshoots from './pages/Businessportfolioshoots';
/**
 * Admin screens are split out of the main bundle.
 *
 * They are behind a login, so no visitor ever needs them — but statically
 * imported they pulled the whole TipTap editor and every admin manager into the
 * one chunk that the homepage has to parse before it can start fetching
 * images. Splitting them frees that bandwidth and main-thread time for the
 * photographs, which are what the public pages are actually for.
 *
 * Public routes stay eagerly imported on purpose: a visitor navigating
 * Home → Portfolio should never wait on a chunk request.
 */
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminBlogs = lazy(() => import("./pages/AdminBlogs"));
const AdminImages = lazy(() => import("./pages/AdminImages"));
const AdminPortfolio = lazy(() => import("./pages/AdminPortfolio"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/Blogdetail";
import ProtectedRoute from "./components/ProtectedRoute";
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
        {/* Only the lazy admin routes can suspend; public routes render
            synchronously exactly as before, so nothing about the visitor-facing
            pages changes. */}
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services/corporate-shoots" element={<Corporateshoots />} />
          <Route path="/services/event-shoots" element={<Eventshoots />} />
          <Route path="/services/product-shoots" element={<Productshoots />} />
          <Route path="/services/podcast-shoots" element={<Podcastshoots />} />
          <Route path="/services/professional-shoots" element={<Professionalshoots />} />
          <Route path="/services/business-portfolio-shoots" element={<Businessportfolioshoots />} />
          <Route path="/admin" element={<AdminLogin />} />

          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute>
                <AdminBlogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/images"
            element={
              <ProtectedRoute>
                <AdminImages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/portfolio"
            element={
              <ProtectedRoute>
                <AdminPortfolio />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <AdminGallery />
              </ProtectedRoute>
            }
          />

          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/*" element={<BlogDetail />} />        </Routes>
        </Suspense>
      </main>
      <FloatingSocial />
      <Footer />
    </div>
  );
}
export default App;