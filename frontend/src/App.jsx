import React, { useEffect, useState } from 'react';
import { useAuth, SignedIn, SignedOut } from '@clerk/clerk-react';
import { setupApiInterceptors } from './services/api';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize secure API headers when token is available
  useEffect(() => {
    const initializeAuth = async () => {
      if (isSignedIn) {
        setupApiInterceptors(getToken);
      }
      setAuthInitialized(true);
    };

    if (isLoaded) {
      initializeAuth();
    }
  }, [isLoaded, isSignedIn, getToken]);

  // Render a full-page loading spinner while Clerk resolves session state
  if (!isLoaded || !authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 text-primary mx-auto" />
          <p className="mt-4 text-textMuted text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}