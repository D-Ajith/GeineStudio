import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingSocial from "./components/FloatingSocial";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import DeferredSplashCursor from "./components/DeferredSplashCursor";
/**
 * Every route except Home is code-split.
 *
 * Home stays eagerly imported because a visitor landing on "/" must not wait an
 * extra network round trip for its chunk — that would push LCP out, which is
 * the opposite of the goal.
 *
 * Everything else is loaded on navigation. Admin matters most (it dragged the
 * entire TipTap editor into the initial bundle) but the public pages add up
 * too: a visitor reading the homepage was downloading and parsing the Portfolio
 * grid, the Dome gallery and six service pages they may never open.
 */
const About = lazy(() => import("./pages/About"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Contact = lazy(() => import("./pages/Contact"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Services = lazy(() => import("./pages/Services"));
const Corporateshoots = lazy(() => import("./pages/Corporateshoots"));
const Eventshoots = lazy(() => import("./pages/Eventshoots"));
const Productshoots = lazy(() => import("./pages/Productshoots"));
const Podcastshoots = lazy(() => import("./pages/Podcastshoots"));
const Professionalshoots = lazy(() => import("./pages/Professionalshoots"));
const Businessportfolioshoots = lazy(() => import("./pages/Businessportfolioshoots"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetail = lazy(() => import("./pages/Blogdetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminBlogs = lazy(() => import("./pages/AdminBlogs"));
const AdminImages = lazy(() => import("./pages/AdminImages"));
const AdminPortfolio = lazy(() => import("./pages/AdminPortfolio"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
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
      <DeferredSplashCursor />
      <ScrollToTop />
      <Header />
      {/* A plain wrapper, not <main>: every route renders its own <main>, and
          two nested main landmarks make a screen reader's landmark list
          ambiguous ("Document should not have more than one main landmark").
          The flex-grow behaviour is identical. */}
      <div className="flex-grow">
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
          <Route path="/blog/*" element={<BlogDetail />} />
          {/* Apache rewrites unmatched paths to index.html, so without this a
              bad URL rendered a blank page on a 200 — a soft 404 to Google.
              NotFound sends noindex instead. Must stay last. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
      <FloatingSocial />
      <Footer />
    </div>
  );
}
export default App;