import { Route, Navigate } from 'react-router-dom';

import UserLayout from '@/components/layout/UserLayout';
import Profile from '@/views/pages/account/Profile';
import AddressBook from '@/views/pages/account/AddressBook';
import PaymentMethods from '@/views/pages/account/PaymentMethods';
import Orders from '@/views/pages/account/Orders';
import OrderTracking from '@/views/pages/account/OrderTracking';
import Vouchers from '@/views/pages/account/Vouchers';
import MyReviews from '@/views/pages/account/MyReviews';
import RecentlyViewed from '@/views/pages/account/RecentlyViewed';
import Notifications from '@/views/pages/account/Notifications';
import Support from '@/views/pages/account/Support';
import UserSettings from '@/views/pages/account/Settings';

export const userRoutes = (
  <Route path="user" element={<UserLayout />}>
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
