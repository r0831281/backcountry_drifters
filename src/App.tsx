import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header, Footer, ProtectedRoute } from './components/layout';
import { PrivacyNotice } from './components/ui';
import { Home, About, Bookings, Login, AdminDashboard } from './pages';
import { trackSession, trackPageView } from './lib/analytics';

function App() {
  useEffect(() => {
    // Initialize tracking on app mount (respects privacy consent)
    const consent = localStorage.getItem('privacy_consent');
    if (consent === 'true') {
      trackSession();
      trackPageView('App Load');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow">
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
          </div>
          <Footer />
          <PrivacyNotice />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
