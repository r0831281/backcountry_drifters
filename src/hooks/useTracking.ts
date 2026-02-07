import { useEffect, useState } from 'react';
import { collectTrackingData, trackSession, type TrackingData } from '../lib/analytics';

/**
 * Hook to manage tracking and fingerprinting
 */
export function useTracking() {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track session on mount
    trackSession()
      .then((data) => {
        setTrackingData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error tracking session:', error);
        setLoading(false);
      });
  }, []);

  /**
   * Collect fresh tracking data with optional location
   */
  const refreshTrackingData = async (includeLocation = false) => {
    setLoading(true);
    try {
      const data = await collectTrackingData(includeLocation);
      setTrackingData(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return {
    trackingData,
    loading,
    refreshTrackingData,
  };
}
