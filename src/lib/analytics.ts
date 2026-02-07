import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';
import { app } from './firebase';

// Initialize Firebase Analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;

try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Firebase Analytics not available:', error);
}

/**
 * Browser fingerprinting and tracking data collection
 */
export interface TrackingData {
  // Browser & Device
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  timezone: string;
  timezoneOffset: number;

  // Connection
  connectionType?: string;
  effectiveType?: string;

  // Location (if permitted)
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;

  // External IP (requires API call)
  ipAddress?: string;
  country?: string;
  city?: string;
  region?: string;

  // Timestamps
  timestamp: Date;
  sessionStart: Date;

  // Fingerprint hash
  fingerprint: string;
}

/**
 * Generate a browser fingerprint hash
 */
function generateFingerprint(data: Partial<TrackingData>): string {
  const components = [
    data.userAgent,
    data.platform,
    data.screenWidth,
    data.screenHeight,
    data.colorDepth,
    data.timezone,
    data.language,
  ].join('|');

  // Simple hash function (for production, consider using a proper hashing library)
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get user's IP address and location info from external API
 * Uses ipify.org (no rate limits) for IP, then ipapi.co for location
 */
async function getIPInfo(): Promise<Partial<TrackingData>> {
  try {
    // First try ipapi.co (includes location data)
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    return {
      ipAddress: data.ip,
      country: data.country_name,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.warn('ipapi.co failed, trying fallback:', error);

    // Fallback: just get IP address without location
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000)
      });
      const ipData = await ipResponse.json();

      return {
        ipAddress: ipData.ip,
      };
    } catch (fallbackError) {
      console.warn('All IP APIs failed:', fallbackError);
      return {};
    }
  }
}

/**
 * Get user's geolocation (requires permission)
 */
async function getGeolocation(): Promise<Partial<TrackingData>> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationAccuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn('Geolocation permission denied:', error);
        resolve({});
      },
      { timeout: 5000 }
    );
  });
}

/**
 * Collect comprehensive tracking data
 */
export async function collectTrackingData(includeLocation = false): Promise<TrackingData> {
  const now = new Date();
  const sessionStart = new Date(sessionStorage.getItem('sessionStart') || now.toISOString());

  // Save session start if not exists
  if (!sessionStorage.getItem('sessionStart')) {
    sessionStorage.setItem('sessionStart', now.toISOString());
  }

  // Get connection info (if available)
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  // Collect basic data
  const basicData: Partial<TrackingData> = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: Array.from(navigator.languages || [navigator.language]),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    connectionType: connection?.type,
    effectiveType: connection?.effectiveType,
    timestamp: now,
    sessionStart,
  };

  // Get IP info (always)
  const ipInfo = await getIPInfo();

  // Get geolocation (if requested)
  const locationInfo = includeLocation ? await getGeolocation() : {};

  // Merge all data
  const fullData = {
    ...basicData,
    ...ipInfo,
    ...locationInfo,
  } as TrackingData;

  // Generate fingerprint
  fullData.fingerprint = generateFingerprint(fullData);

  return fullData;
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, additionalData?: Record<string, any>) {
  if (!analytics) return;

  logEvent(analytics, 'page_view', {
    page_title: pageName,
    page_path: window.location.pathname,
    ...additionalData,
  });
}

/**
 * Track booking submission
 */
export function trackBookingSubmit(bookingData: {
  tripId: string;
  tripTitle: string;
  guestCount: number;
  preferredDate: string;
}) {
  if (!analytics) return;

  logEvent(analytics, 'booking_submit', {
    trip_id: bookingData.tripId,
    trip_title: bookingData.tripTitle,
    guest_count: bookingData.guestCount,
    preferred_date: bookingData.preferredDate,
  });
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (!analytics) return;

  logEvent(analytics, eventName, eventData);
}

/**
 * Set user properties for analytics
 */
export function setAnalyticsUserProperties(properties: Record<string, any>) {
  if (!analytics) return;

  setUserProperties(analytics, properties);
}

/**
 * Track user session
 */
export async function trackSession() {
  const trackingData = await collectTrackingData(false);

  if (analytics) {
    setUserProperties(analytics, {
      browser: trackingData.userAgent.split(' ')[0],
      platform: trackingData.platform,
      timezone: trackingData.timezone,
      country: trackingData.country || 'unknown',
      fingerprint: trackingData.fingerprint,
    });
  }

  // Store in session storage
  sessionStorage.setItem('trackingData', JSON.stringify(trackingData));

  return trackingData;
}

/**
 * Get stored tracking data from session
 */
export function getStoredTrackingData(): TrackingData | null {
  const stored = sessionStorage.getItem('trackingData');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
