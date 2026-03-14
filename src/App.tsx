import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { publicRoutes } from './routers/publicRoutes';
import { userRoutes } from './routers/userRoutes';
import { adminRoutes } from './routers/adminRoutes';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
