import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import { isAdmin } from '../../types';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, userProfile, signOut } = useAuth();
  const location = useLocation();

  // Track scroll position for header background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close mobile menu on any navigation
  const handleMobileNavClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinkClasses = (path: string) => {
    const base = 'relative text-sm font-medium transition-colors duration-200 py-1';
    return isActivePath(path)
      ? `${base} text-forest-600 nav-link-active`
      : `${base} text-gray-600 hover:text-forest-600`;
  };

  const mobileNavLinkClasses = (path: string) => {
    const base = 'px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200';
    return isActivePath(path)
      ? `${base} bg-forest-50 text-forest-600 border-l-2 border-trout-gold`
      : `${base} text-gray-600 hover:bg-gray-50 hover:text-forest-600`;
  };

  return (
    <header
      className={`
        sticky top-0 z-30
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isScrolled
          ? 'bg-white/95 backdrop-blur-custom shadow-soft'
          : 'bg-white shadow-none'
        }
      `}
    >
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="container-custom" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            aria-label="Backcountry Drifters Fly Fishing - Home"
          >
            {/* <img
              src="/logo.png"
              alt="Backcountry Drifters"
              className="h-10 md:h-12 w-auto"
            /> */}
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-forest transition-opacity duration-200 group-hover:opacity-80">
                Backcountry Drifters
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Fly Fishing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClasses('/')}>
              Home
            </Link>
            <Link to="/bookings" className={navLinkClasses('/bookings')}>
              Bookings
            </Link>
            <Link to="/resources" className={navLinkClasses('/resources')}>
              Resources
            </Link>
            <Link to="/about" className={navLinkClasses('/about')}>
              About
            </Link>

            {/* Show admin link and sign out only for admin users */}
            {user && userProfile && isAdmin(userProfile) && (
              <>
                <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
                <Link to="/dashboard/admin" className={navLinkClasses('/dashboard/admin')}>
                  Admin Dashboard
                </Link>
                <span className="text-sm text-gray-600">
                  {userProfile.displayName}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="
              md:hidden p-2 rounded-lg text-gray-600
              hover:bg-gray-100 hover:text-gray-800
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-trout-gold focus-visible:ring-offset-2
            "
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            <svg
              className="w-6 h-6 transition-transform duration-200"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-nav"
          className={`
            md:hidden overflow-hidden
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileMenuOpen
              ? 'max-h-[500px] opacity-100 pb-4'
              : 'max-h-0 opacity-0 pb-0'
            }
          `}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="border-t border-gray-100 pt-3">
            <div className="flex flex-col gap-1">
              <Link to="/" className={mobileNavLinkClasses('/')} onClick={handleMobileNavClick}>
                Home
              </Link>
              <Link to="/bookings" className={mobileNavLinkClasses('/bookings')} onClick={handleMobileNavClick}>
                Bookings
              </Link>
              <Link to="/resources" className={mobileNavLinkClasses('/resources')} onClick={handleMobileNavClick}>
                Resources
              </Link>
              <Link to="/about" className={mobileNavLinkClasses('/about')} onClick={handleMobileNavClick}>
                About
              </Link>

              {/* Show admin dashboard only for admin users */}
              {user && userProfile && isAdmin(userProfile) && (
                <>
                  <Link to="/dashboard/admin" className={mobileNavLinkClasses('/dashboard/admin')} onClick={handleMobileNavClick}>
                    Admin Dashboard
                  </Link>
                  <div className="mt-3 pt-3 border-t border-gray-100 px-4">
                    <div className="text-sm text-gray-600 mb-3 px-2">
                      Signed in as <span className="font-medium">{userProfile.displayName}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        handleSignOut();
                        handleMobileNavClick();
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
