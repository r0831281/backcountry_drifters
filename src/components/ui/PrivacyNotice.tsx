import { useState, useEffect } from 'react';

/**
 * Privacy notice banner for GDPR/CCPA compliance
 * Shows on first visit and stores consent in localStorage
 */
export function PrivacyNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('privacy_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy_consent', 'true');
    localStorage.setItem('privacy_consent_date', new Date().toISOString());
    setIsVisible(false);
    window.dispatchEvent(new Event('privacy_consent_changed'));
  };

  const handleDecline = () => {
    localStorage.setItem('privacy_consent', 'false');
    localStorage.setItem('privacy_consent_date', new Date().toISOString());
    setIsVisible(false);
    window.dispatchEvent(new Event('privacy_consent_changed'));
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl"
      role="dialog"
      aria-labelledby="privacy-notice-title"
      aria-describedby="privacy-notice-description"
    >
      <div className="container-custom py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3
              id="privacy-notice-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              🍪 We Value Your Privacy
            </h3>
            <p
              id="privacy-notice-description"
              className="text-sm text-gray-600 leading-relaxed max-w-3xl"
            >
              We use cookies and collect analytics data (including IP address, location, browser info, and device fingerprinting) to improve your experience and analyze website traffic. By clicking "Accept", you consent to our use of cookies and data collection.
            </p>
            <a
              href="#privacy-policy"
              className="text-sm text-trout-gold hover:underline mt-2 inline-block"
            >
              Learn more about our privacy practices
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleDecline}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-3 text-sm font-medium text-white bg-trout-gold hover:bg-trout-gold-dark rounded-lg transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
