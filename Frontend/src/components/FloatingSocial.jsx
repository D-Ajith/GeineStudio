import { useState } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaPhoneAlt,
  FaTimes,
} from "react-icons/fa";

const FloatingSocial = () => {
  const [open, setOpen] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Hi Genie Studio 👋

I'm interested in your services:

1. Corporate Shoots
2. Event Shoots
3. Product Shoots
4. Podcast Shoots
5. Professional Shoots
6. Business Portfolio Shoots

Please let me know more details.`
  );

  return (
    <div className="fixed right-4 bottom-4 md:right-5 md:bottom-5 z-50 flex flex-col items-center">

      {/* pointer-events-none already blocked the mouse while collapsed, but the
          three links stayed in the tab order behind an invisible panel. */}
      <div
        id="floating-contact-actions"
        inert={!open}
        className={`flex flex-col items-center gap-2 mb-2 transition-all duration-300
          ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
      >
        <a
          href="tel:+919966888428"
          aria-label="Call Genie Studio on +91 99668 88428"
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#6B4A2D] text-white shadow-md hover:bg-[var(--accent-color)] hover:text-black transition"
        >
          <FaPhoneAlt size={14} aria-hidden="true" />
        </a>

        <a
          href={`https://wa.me/+919966888428?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Genie Studio on WhatsApp"
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:scale-105 transition"
        >
          <FaWhatsapp size={16} aria-hidden="true" />
        </a>

        <a
          href="https://www.instagram.com/itsgeniestudio_official/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Genie Studio on Instagram"
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-md hover:scale-105 transition"
        >
          <FaInstagram size={15} aria-hidden="true" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close contact options" : "Open contact options"}
        aria-expanded={open}
        aria-controls="floating-contact-actions"
        className="w-12 h-12 md:w-13 md:h-13 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:scale-105 transition"
      >
        {open ? <FaTimes size={16} aria-hidden="true" /> : <FaWhatsapp size={20} aria-hidden="true" />}
      </button>
    </div>
  );
};

export default FloatingSocial;
