import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { PageContainer } from '../components/layout';
import { Button, Card, CardContent, CardTitle, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collectTrackingData } from '../lib/analytics';
import { validateEmail } from '../lib/validation';
import { sanitizeEmail, sanitizeText } from '../lib/sanitization';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const { signIn, signInWithGoogle, signOut, user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Load failed attempts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('loginAttempts');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const now = Date.now();

        // Check if lockout period has expired (15 minutes)
        if (data.lockedUntil && data.lockedUntil > now) {
          setIsLocked(true);
          setLockoutTime(data.lockedUntil);
          setFailedAttempts(data.attempts || 0);
        } else if (data.lockedUntil && data.lockedUntil <= now) {
          // Lockout expired, reset
          localStorage.removeItem('loginAttempts');
          setFailedAttempts(0);
          setIsLocked(false);
        } else if (data.lastAttempt && now - data.lastAttempt < 900000) { // 15 minutes
          setFailedAttempts(data.attempts || 0);
        } else {
          // Attempts expired, reset
          localStorage.removeItem('loginAttempts');
          setFailedAttempts(0);
        }
      } catch (e) {
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || !lockoutTime) return;

    const interval = setInterval(() => {
      const remaining = lockoutTime - Date.now();
      if (remaining <= 0) {
        setIsLocked(false);
        setLockoutTime(null);
        setFailedAttempts(0);
        localStorage.removeItem('loginAttempts');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && userProfile) {
      console.log('User is authenticated');
      console.log('User:', user.email);
      console.log('User Profile:', userProfile);

      // Only redirect to admin dashboard if user is admin
      if (userProfile.role === 'admin') {
        console.log('User is admin, redirecting to dashboard');
        navigate('/dashboard/admin');
      } else {
        // Non-admin user - save their data but don't let them log in
        console.log('User is not admin, logging out...');
        setError('Access denied. This login is for administrators only. Your information has been saved.');

        // Record as failed attempt (non-admin trying to access admin area)
        (async () => {
          try {
            console.log('[Login] Recording non-admin access attempt to Firestore...');
            const trackingData = await collectTrackingData(false).catch(() => null);
            const docData: any = {
              type: 'failed',
              email: sanitizeEmail(user.email || '') || 'unknown',
              timestamp: Timestamp.now(),
              attemptNumber: 1,
              isLocked: false,
              reason: 'non-admin user attempted admin login',
            };

            if (trackingData) {
              const tracking: any = {};
              if (trackingData.fingerprint) tracking.fingerprint = trackingData.fingerprint;
              if (trackingData.ipAddress) tracking.ipAddress = trackingData.ipAddress;
              if (trackingData.country) tracking.country = trackingData.country;
              if (trackingData.userAgent) tracking.userAgent = trackingData.userAgent;
              if (Object.keys(tracking).length > 0) {
                docData.tracking = tracking;
              }
            }

            const docRef = await addDoc(collection(db, 'loginAttempts'), docData);
            console.log('[Login] Non-admin attempt saved to Firestore:', docRef.id);
          } catch (error) {
            console.error('Failed to record non-admin attempt to Firestore:', error);
          }
        })();

        // Sign out and redirect after a delay
        setTimeout(async () => {
          try {
            await signOut();
            navigate('/');
          } catch (err) {
            console.error('Sign out error:', err);
            navigate('/');
          }
        }, 3000);
      }
    }
  }, [user, userProfile, navigate]);

  const recordFailedAttempt = async () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    const data: any = {
      attempts: newAttempts,
      lastAttempt: Date.now(),
    };

    // Lock account after 5 failed attempts for 15 minutes
    if (newAttempts >= 5) {
      const lockedUntil = Date.now() + 900000; // 15 minutes
      data.lockedUntil = lockedUntil;
      setIsLocked(true);
      setLockoutTime(lockedUntil);
      setError('Too many failed attempts. Account locked for 15 minutes.');
    }

    localStorage.setItem('loginAttempts', JSON.stringify(data));

    // Save to Firestore - update existing record or create new
    try {
      console.log('[Login] Recording failed attempt to Firestore...');
      const trackingData = await collectTrackingData(false).catch(() => null);

      // Build tracking data
      const tracking: any = {};
      if (trackingData) {
        if (trackingData.fingerprint) tracking.fingerprint = trackingData.fingerprint;
        if (trackingData.ipAddress) tracking.ipAddress = trackingData.ipAddress;
        if (trackingData.country) tracking.country = trackingData.country;
        if (trackingData.userAgent) tracking.userAgent = trackingData.userAgent;
      }

      // Try to find existing recent attempt (within last 30 minutes) from same source
      const thirtyMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 1800000));
      let existingDoc = null;

      // Search by fingerprint first (most reliable)
      if (tracking.fingerprint) {
        const q = query(
          collection(db, 'loginAttempts'),
          where('type', '==', 'failed'),
          where('tracking.fingerprint', '==', tracking.fingerprint),
          where('timestamp', '>=', thirtyMinutesAgo),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          existingDoc = snapshot.docs[0];
        }
      }

      // If not found by fingerprint, try by IP
      if (!existingDoc && tracking.ipAddress) {
        const q = query(
          collection(db, 'loginAttempts'),
          where('type', '==', 'failed'),
          where('tracking.ipAddress', '==', tracking.ipAddress),
          where('timestamp', '>=', thirtyMinutesAgo),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          existingDoc = snapshot.docs[0];
        }
      }

      if (existingDoc) {
        // Update existing record
        const existingData = existingDoc.data();
        const currentAttemptNumber = (existingData.attemptNumber || 0) + 1;

        await updateDoc(doc(db, 'loginAttempts', existingDoc.id), {
          email: sanitizeEmail(email) || sanitizeText(existingData.email) || 'unknown',
          timestamp: Timestamp.now(),
          attemptNumber: currentAttemptNumber,
          isLocked: currentAttemptNumber >= 5,
          lastUpdated: Timestamp.now(),
        });

        console.log('[Login] Updated existing failed attempt record:', existingDoc.id, '(attempt #' + currentAttemptNumber + ')');
      } else {
        // Create new record
        const docData: any = {
          type: 'failed',
          email: sanitizeEmail(email) || 'unknown',
          timestamp: Timestamp.now(),
          attemptNumber: 1,
          isLocked: false,
        };

        if (Object.keys(tracking).length > 0) {
          docData.tracking = tracking;
        }

        const docRef = await addDoc(collection(db, 'loginAttempts'), docData);
        console.log('[Login] Created new failed attempt record:', docRef.id);
      }
    } catch (error) {
      console.error('Failed to record failed attempt to Firestore:', error);
    }
  };

  const recordSuccessfulLogin = async () => {
    // Clear failed attempts
    localStorage.removeItem('loginAttempts');
    setFailedAttempts(0);
    setIsLocked(false);

    // Track successful login count
    const loginCount = parseInt(localStorage.getItem('successfulLogins') || '0') + 1;
    localStorage.setItem('successfulLogins', loginCount.toString());

    // Save to Firestore - update existing record or create new
    try {
      console.log('[Login] Recording successful login to Firestore...');
      const trackingData = await collectTrackingData(false).catch(() => null);

      // Build tracking data
      const tracking: any = {};
      if (trackingData) {
        if (trackingData.fingerprint) tracking.fingerprint = trackingData.fingerprint;
        if (trackingData.ipAddress) tracking.ipAddress = trackingData.ipAddress;
        if (trackingData.country) tracking.country = trackingData.country;
        if (trackingData.userAgent) tracking.userAgent = trackingData.userAgent;
      }

      // Try to find existing recent success record (within last 24 hours) from same source
      const twentyFourHoursAgo = Timestamp.fromDate(new Date(Date.now() - 86400000));
      let existingDoc = null;

      // Search by fingerprint first
      if (tracking.fingerprint) {
        const q = query(
          collection(db, 'loginAttempts'),
          where('type', '==', 'success'),
          where('tracking.fingerprint', '==', tracking.fingerprint),
          where('timestamp', '>=', twentyFourHoursAgo),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          existingDoc = snapshot.docs[0];
        }
      }

      // If not found by fingerprint, try by IP
      if (!existingDoc && tracking.ipAddress) {
        const q = query(
          collection(db, 'loginAttempts'),
          where('type', '==', 'success'),
          where('tracking.ipAddress', '==', tracking.ipAddress),
          where('timestamp', '>=', twentyFourHoursAgo),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          existingDoc = snapshot.docs[0];
        }
      }

      if (existingDoc) {
        // Update existing record
        const existingData = existingDoc.data();
        const currentCount = (existingData.successCount || 0) + 1;

        await updateDoc(doc(db, 'loginAttempts', existingDoc.id), {
          email: sanitizeEmail(email) || sanitizeText(existingData.email) || 'unknown',
          timestamp: Timestamp.now(),
          successCount: currentCount,
          lastUpdated: Timestamp.now(),
        });

        console.log('[Login] Updated existing success record:', existingDoc.id, '(login #' + currentCount + ')');
      } else {
        // Create new record
        const docData: any = {
          type: 'success',
          email: sanitizeEmail(email) || 'unknown',
          timestamp: Timestamp.now(),
          successCount: 1,
        };

        if (Object.keys(tracking).length > 0) {
          docData.tracking = tracking;
        }

        const docRef = await addDoc(collection(db, 'loginAttempts'), docData);
        console.log('[Login] Created new success record:', docRef.id);
      }
    } catch (error) {
      console.error('Failed to record successful login to Firestore:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if locked out
    if (isLocked) {
      const remaining = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 60000) : 15;
      setError(`Account is locked. Please try again in ${remaining} minute(s).`);
      return;
    }

    // --- Validate email format before sending to Firebase ---
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    // --- Sanitize inputs ---
    const sanitizedEmail = sanitizeEmail(email);

    setLoading(true);

    try {
      await signIn(sanitizedEmail, password);
      console.log('Sign in successful, waiting for auth state update...');
      await recordSuccessfulLogin();
      // Loading will be cleared by useEffect, or after a timeout
      setTimeout(() => setLoading(false), 3000);
    } catch (err) {
      console.error('Login error:', err);
      await recordFailedAttempt();
      const remaining = 5 - (failedAttempts + 1);
      if (remaining > 0) {
        setError(`Invalid email or password. ${remaining} attempt(s) remaining before lockout.`);
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');

    // Check if locked out
    if (isLocked) {
      const remaining = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 60000) : 15;
      setError(`Account is locked. Please try again in ${remaining} minute(s).`);
      return;
    }

    setLoading(true);

    try {
      await signInWithGoogle();
      console.log('Google sign in successful, waiting for auth state update...');
      await recordSuccessfulLogin();
      // Loading will be cleared by useEffect, or after a timeout
      setTimeout(() => setLoading(false), 3000);
    } catch (err) {
      console.error('Google sign in error:', err);
      await recordFailedAttempt();
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  // Calculate remaining lockout time
  const getRemainingLockoutTime = () => {
    if (!isLocked || !lockoutTime) return '';
    const remaining = Math.ceil((lockoutTime - Date.now()) / 60000);
    return remaining > 0 ? `${remaining} minute(s)` : '';
  };

  return (
    <PageContainer>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardTitle className="text-center mb-6">
            Admin Login
          </CardTitle>
          <CardContent>
            {/* Lockout Warning */}
            {isLocked && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 animate-pulse">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Account Locked</p>
                    <p className="text-sm">Try again in {getRemainingLockoutTime()}</p>
                  </div>
                </div>
              </div>
            )}

            {error && !isLocked && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@backcountrydrifters.com"
                required
                disabled={loading}
                maxLength={254}
                autoComplete="email"
              />

              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                maxLength={128}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <p className="mt-6 text-center text-sm text-gray-600">
              For customer bookings, please visit the{' '}
              <a href="/bookings" className="text-forest-500 hover:text-forest-700 font-medium">
                bookings page
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
