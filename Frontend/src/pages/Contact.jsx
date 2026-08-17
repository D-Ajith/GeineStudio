import React from 'react'
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { useTargetWidth } from "../lib/useResponsiveImage";
import { bestVariantUrl } from "../lib/imageManifest";
import Seo from "../components/Seo";
import { SEO } from "../lib/seoConfig";
// import emailjs from '@emailjs/browser';
const Contact = () => {
  // Hero paints via CSS background-image, which cannot carry a srcSet.
  const targetWidth = useTargetWidth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    bookingDate: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setStatus(null);
  //   emailjs
  //     .send(
  //       import.meta.env.VITE_EMAILJS_SERVICE_ID,
  //       import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  //       {
  //         from_name: formData.name,
  //         from_email: formData.email,
  //         phone: formData.phone || 'Not provided',
  //         service: formData.service,
  //         booking_date: new Date(formData.bookingDate).toLocaleDateString('en-IN', {
  //           day: '2-digit',
  //           month: 'short',
  //           year: 'numeric',
  //         }),
  //         message: formData.message,
  //         date: new Date().toLocaleDateString('en-IN', {
  //           day: '2-digit',
  //           month: 'short',
  //           year: 'numeric',
  //         }),
  //       },
  //       import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  //     )
  //     .then(() => {
  //       setStatus('success');
  //       setFormData({
  //         name: '',
  //         email: '',
  //         phone: '',
  //         service: '',
  //         bookingDate: '',
  //         message: '',
  //       });
  //     })
  //     .catch(() => setStatus('error'))
  //     .finally(() => setLoading(false));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // The button lives outside a <form>, so the `required` attributes never
    // run — check here before hitting the network.
    const { name, email, phone, service, bookingDate } = formData;
    if (!name.trim() || !email.trim() || !phone.trim() || !service || !bookingDate) {
      setStatus("error");
      console.warn("Contact form: please fill in all required fields.");
      return;
    }

    setLoading(true);
    setStatus(null);

    // Abort rather than spin forever if the server hangs.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://geniestudio.in/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          bookingDate: formData.bookingDate,
          message: formData.message,
        }),
        signal: controller.signal,
      });

      // Read as text first. response.json() throws "Unexpected end of JSON
      // input" on an empty or HTML body (PHP fatal, 500 page, WAF block),
      // which would surface as a confusing crash instead of a clean error.
      const rawBody = await response.text();

      let result = null;
      if (rawBody) {
        try {
          result = JSON.parse(rawBody);
        } catch {
          console.error(
            "Contact form: server returned non-JSON response",
            response.status,
            rawBody.slice(0, 500)
          );
        }
      }

      if (response.ok && result?.success) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          bookingDate: "",
          message: "",
        });
      } else {
        setStatus("error");
        console.error("Contact form failed:", {
          status: response.status,
          message: result?.message ?? "Server did not return a valid JSON response.",
        });
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Contact form: request timed out after 30s.");
      } else {
        console.error("Contact form error:", error);
      }
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+91 9032845433',
      link: 'tel:+919032845433',
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'admin@geniestudio.in',
      link: 'mailto:admin@geniestudio.in',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: '5A-2, Kp Icon, Yendada, Vishakapatanam, near to MK gold cost, Yendada, Endada, Andhra Pradesh 530045',
      link: 'https://maps.google.com',
    },
    {
      icon: Clock,
      title: 'Hours',
      details: 'Mon–Fri: 9AM–6PM, Sat: 10AM–4PM',
      link: null,
    },
  ];
  return (
    <main className="w-full overflow-x-hidden">
      <Seo
        {...SEO.contact}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: SEO.contact.path },
        ]}
      />



      <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[55vh] xl:min-h-[50vh] text-white overflow-hidden flex items-center bg-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${bestVariantUrl(
              "https://geniestudio.in/uploads/1786602496_1786602495602-162665034.jpg",
              targetWidth
            )}')`,
          }}
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="fade-up"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Get In Touch
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Let’s discuss how we can bring your vision to life through professional photography and videography.          </p>
        </div>
      </section>


      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">

            <div className="lg:col-span-2 self-start bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 transition-shadow duration-500" data-aos="fade-right">

              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-slate-900">
                  Send Us a Message
                </h2>
                <p className="text-sm sm:text-base text-slate-600">Fill out the form below and we'll get back to you shortly</p>
              </div>

              {/* A real <form>, not a <div>. Every label is now tied to its
                  control by htmlFor/id — previously none of them were, so a
                  screen reader read each field as an unlabelled edit box —
                  and submitting with Enter from a field works, which it did
                  not when the button sat outside a form. handleSubmit already
                  calls preventDefault, so the network path is unchanged. */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="group">
                    <label htmlFor="contact-name" className="block text-sm font-semibold mb-1.5 text-slate-700 group-focus-within:text-slate-900 transition-colors">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your Name"
                      required
                      className="w-full px-4 py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 bg-white cursor-pointer caret-black" />
                  </div>

                  <div className="group">
                    <label htmlFor="contact-email" className="block text-sm font-semibold mb-1.5 text-slate-700 group-focus-within:text-slate-900 transition-colors">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      placeholder="Enter your Email"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 bg-white cursor-pointer caret-black" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5" >
                  <div className="group">
                    <label htmlFor="contact-phone" className="block text-sm font-semibold mb-1.5 text-slate-700 group-focus-within:text-slate-900 transition-colors">
                      Phone Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="Enter your Phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 bg-white cursor-pointer caret-black" required
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="contact-service" className="block text-sm font-semibold mb-1.5 text-slate-700 group-focus-within:text-slate-900 transition-colors">
                      Service *
                    </label>
                    <select
                      id="contact-service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl bg-white text-black cursor-pointer focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300">
                      <option value="">Select a service</option>

                      <option value="Podcast Shoots">Podcast Shoots</option>
                      <option value="Corporate Shoots">Corporate Shoots</option>
                      <option value="Event Shoots">Event Shoots</option>
                      <option value="Professional Shoots">Professional Shoots</option>
                      <option value="Business Portfolio">Business Portfolio</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Animation 2D or 3D">Animation 2D or 3D</option>
                      <option value="Video Editing">Video Editing</option>
                      <option value="Figma">Figma</option>
                      <option value="Event Coverage">Event Coverage</option>
                      <option value="Commercial Shoot">Commercial Shoot</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label htmlFor="contact-booking-date" className="block text-sm font-semibold mb-2 text-slate-700 group-focus-within:text-slate-900 transition-colors">
                    Booking Date *
                  </label>

                  <div className="relative">
                    <input
                      id="contact-booking-date"
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl bg-white text-slate-900 cursor-pointer caret-black focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 appearance-none shadow-sm hover:border-slate-300"
                    />

                    {/* Custom Calendar Icon — purely decorative next to a date
                        input that already announces itself as one. */}
                    <div aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      📅
                    </div>
                  </div>
                </div>
                <div className="group">
                  <label htmlFor="contact-message" className="block text-sm font-semibold mb-1.5 text-slate-700 group-focus-within:text-slate-900 transition-colors">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    placeholder="Enter your Message"
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 bg-white cursor-pointer"
                  />
                </div>

                {/* Both outcomes are announced now: success politely via
                    role="status", failure assertively via role="alert". Before
                    this, the only feedback was a colour change a screen-reader
                    user never heard about. */}
                {status === 'success' && (
                  <div role="status" className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-sm sm:text-base text-green-700 font-semibold flex items-center gap-2">
                      <svg aria-hidden="true" className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Message sent successfully!</span>
                    </p>
                  </div>
                )}

                {status === 'error' && (
                  <div role="alert" className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm sm:text-base text-red-700 font-semibold flex items-center gap-2">
                      <svg aria-hidden="true" className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Failed to send message. Please try again.</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-[#6B4A2D] text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" aria-hidden="true" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-5 sm:space-y-6" data-aos="fade-left">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-7 transform hover:shadow-3xl transition-shadow duration-500">
                <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-900">
                  Contact Information
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="group flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#F7F6F3] from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-0.5">{item.title}</h4>
                        {item.link ? (
                          <a
                            href={item.link}
                            className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors duration-300 break-words block"
                          >
                            {item.details}
                          </a>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-600 break-words">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#6B4A2D] text-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-7 relative overflow-hidden" data-aos="fade-left">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full -ml-10 sm:-ml-12 -mb-10 sm:-mb-12"></div>
                <div className="relative">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">
                    Quick Response
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    We typically respond within 24 hours. For urgent inquiries, please call us directly.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 md:py-16 lg:py-20 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-8 sm:mb-10" data-aos="fade-right">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
              Our Studio Location
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-4">
              Visit our studio for professional photography and creative sessions
            </p>
          </div>

          <div className="relative h-[300px] sm:h-[350px] md:h-[450px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white ring-1 ring-slate-200" data-aos="fade">

            <iframe
              title="Studio Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.3097152730043!2d83.35916647863445!3d17.777135439803757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b852ac6e3ff%3A0x5dc73dbf634423d7!2sGenie%20Media%20and%20Studio!5e0!3m2!1sen!2sin!4v1768910647816!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg">
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                📍 Genie Media & Studio
              </p>
              <p className="text-[10px] sm:text-xs text-slate-600">
                Visakhapatnam, Andhra Pradesh
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-100 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 text-slate-900" data-aos="fade-left">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 px-4" data-aos="fade-right">
            Let’s create impactful visuals together. Get in touch with us today.          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4" >
            <a
              href="tel:+919032845433"
              className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-[#6B4A2D] to-slate-700 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300 transform hover:scale-105"
              data-aos="fade-right"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Call Now</span>
            </a>
            <a
              href="/portfolio"
              className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-white text-slate-900 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 border-2 border-slate-200 transform hover:scale-105"
              data-aos="fade-left"
            >
              <span>View Portfolio</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Contact;