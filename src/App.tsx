import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { toast } from 'sonner';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Global promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore benign Vite websocket errors
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('WebSocket')) {
        event.preventDefault();
        return;
      }
      if (event.reason?.message && event.reason.message.includes('WebSocket')) {
        event.preventDefault();
        return;
      }
      
      console.error('Unhandled Promise Rejection:', event.reason);
      toast.error(`Error: ${event.reason?.message || 'Unexpected error occurred'}`);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="social-pipeline-theme">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/" />} />
            
            <Route path="/" element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
              <Route index element={<DashboardPage />} />
              <Route path="workspace/:workspaceId" element={<WorkspacePage />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
