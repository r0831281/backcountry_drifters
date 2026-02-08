import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function AnalyticsTracker() {
  const location = useLocation();
  const initialized = useRef(false);

  // Handle route changes
  useEffect(() => {
    const track = async () => {
      const consent = localStorage.getItem('privacy_consent');
      if (consent !== 'true') return;

      try {
        const { trackSession, trackPageView } = await import('../lib/analytics');

        if (!initialized.current) {
          await trackSession();
          initialized.current = true;
        }

        trackPageView(document.title || 'Backcountry Drifters');
      } catch (err) {
        console.warn('Analytics error:', err);
      }
    };

    void track();
  }, [location]);

  // Handle late consent (e.g. user accepts banner)
  useEffect(() => {
    const handleConsentChange = () => {
      const consent = localStorage.getItem('privacy_consent');
      if (consent === 'true') {
        // Initialize immediately upon consent
        import('../lib/analytics').then(({ trackSession, trackPageView }) => {
          if (!initialized.current) {
             void trackSession();
             initialized.current = true;
          }
          trackPageView(document.title || 'Backcountry Drifters');
        });
      }
    };

    window.addEventListener('privacy_consent_changed', handleConsentChange);
    return () => window.removeEventListener('privacy_consent_changed', handleConsentChange);
  }, []);

  return null;
}
