import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest-800 text-white relative overflow-hidden mt-16 md:mt-20">

      {/* Gold accent line at top */}
      <div className="divider-gold mb-3" aria-hidden="true" />

      <div className="container-custom py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-3 text-gradient-gold">
              Backcountry Drifters Fly Fishing
            </h3>
            <p className="text-forest-200 text-sm leading-relaxed max-w-xs">
              Experience world-class fly fishing in the pristine waters of the Alberta
              foothills and Calgary area with Backcountry Drifters.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="text-forest-200 hover:text-trout-gold transition-colors duration-200 text-sm inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings"
                  className="text-forest-200 hover:text-trout-gold transition-colors duration-200 text-sm inline-block"
                >
                  Book a Trip
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-forest-200 hover:text-trout-gold transition-colors duration-200 text-sm inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-forest-200 hover:text-trout-gold transition-colors duration-200 text-sm inline-block"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-forest-200">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-trout-gold flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Calgary, Alberta</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-trout-gold flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:backcountrydriftersflyfishing@gmail.com"
                  className="hover:text-trout-gold transition-colors duration-200"
                >
                  backcountrydriftersflyfishing@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-trout-gold flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:+14038192870"
                  className="hover:text-trout-gold transition-colors duration-200"
                >
                  403 819 2870
                </a>
              </li>
              <li>
                  <a
                          href="https://www.instagram.com/backcountry_drifters/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          className="hover:text-trout-gold transition-colors duration-200 text-xl"
                        >
                          <FaInstagram />
                  </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-forest-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-forest-300">
            &copy; {currentYear} Backcountry Drifters Fly Fishing. All rights reserved.
          </p>
          <p className="text-xs text-forest-400">
            Crafted with care in Calgary, Alberta | Designed by <a href="https://jo-qu.com" target="_blank" rel="noopener noreferrer" className="hover:text-trout-gold transition-colors duration-200">jo-qu.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
