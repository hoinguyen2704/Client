import { Route, Navigate } from 'react-router-dom';

import UserLayout from '@/components/layout/UserLayout';
import Profile from '@/pages/user/Profile';
import AddressBook from '@/pages/user/AddressBook';
import PaymentMethods from '@/pages/user/PaymentMethods';
import Orders from '@/pages/user/Orders';
import OrderTracking from '@/pages/user/OrderTracking';
import Vouchers from '@/pages/user/Vouchers';
import MyReviews from '@/pages/user/MyReviews';
import RecentlyViewed from '@/pages/user/RecentlyViewed';
import Notifications from '@/pages/user/Notifications';
import Support from '@/pages/user/Support';
import UserSettings from '@/pages/user/Settings';

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
