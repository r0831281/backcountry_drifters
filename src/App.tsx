import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header, Footer, ProtectedRoute } from './components/layout';
import { PrivacyNotice } from './components/ui';
import { Home } from './pages/Home';

const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })));
const Bookings = lazy(() => import('./pages/Bookings').then((module) => ({ default: module.Bookings })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
      Loading page…
    </div>
  );
}

function App() {
  useEffect(() => {
    const consent = localStorage.getItem('privacy_consent');
    if (consent !== 'true') return;

    const initAnalytics = async () => {
      try {
        const { trackSession, trackPageView } = await import('./lib/analytics');
        await trackSession();
        trackPageView('App Load');
      } catch (error) {
        console.warn('Analytics failed to initialize', error);
      }
    };

    void initAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes - Admin Only */}
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </div>
          <Footer />
          <PrivacyNotice />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
