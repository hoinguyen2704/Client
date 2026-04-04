import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components';

const UserLayout = lazy(() => import('@/components/layout/UserLayout'));
const Profile = lazy(() => import('@/views/pages/account/Profile'));
const AddressBook = lazy(() => import('@/views/pages/account/AddressBook'));
const PaymentMethods = lazy(() => import('@/views/pages/account/PaymentMethods'));
const Orders = lazy(() => import('@/views/pages/account/Orders'));
const OrderTracking = lazy(() => import('@/views/pages/account/OrderTracking'));
const Vouchers = lazy(() => import('@/views/pages/account/Vouchers'));
const MyReviews = lazy(() => import('@/views/pages/account/MyReviews'));
const RecentlyViewed = lazy(() => import('@/views/pages/account/RecentlyViewed'));
const Notifications = lazy(() => import('@/views/pages/account/Notifications'));
const Support = lazy(() => import('@/views/pages/account/Support'));
const UserSettings = lazy(() => import('@/views/pages/account/Settings'));

export const userRoutes = (
  <Route path="user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
    <Route index element={<Navigate to="profile" replace />} />
    <Route path="profile" element={<Profile />} />
    <Route path="address" element={<AddressBook />} />
    <Route path="payment" element={<PaymentMethods />} />
    <Route path="orders" element={<Orders />} />
    <Route path="orders/:id" element={<OrderTracking />} />
    <Route path="tracking" element={<OrderTracking />} />
    <Route path="vouchers" element={<Vouchers />} />
    <Route path="reviews" element={<MyReviews />} />
    <Route path="recently-viewed" element={<RecentlyViewed />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="settings" element={<UserSettings />} />
    <Route path="support" element={<Support />} />
  </Route>
);
