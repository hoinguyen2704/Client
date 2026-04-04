import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { LoadingScreen } from './components/loading/Skeleton';
import { publicRoutes } from './routers/publicRoutes';
import { userRoutes } from './routers/userRoutes';
import { adminRoutes } from './routers/adminRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public + User Routes (inside MainLayout) */}
              <Route path="/" element={<MainLayout />}>
                {publicRoutes}
                {userRoutes}
              </Route>

              {/* Admin Routes (separate layout) */}
              {adminRoutes}

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
          }}
          richColors
          closeButton
        />
      </HelmetProvider>
    </ErrorBoundary>
  );
}
