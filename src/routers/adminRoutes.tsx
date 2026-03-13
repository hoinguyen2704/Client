import { Route, Navigate } from 'react-router-dom';

import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import AdminOrders from '@/pages/admin/Orders';
import OrderDetail from '@/pages/admin/OrderDetail';
import Products from '@/pages/admin/Products';
import ProductForm from '@/pages/admin/ProductForm';
import Categories from '@/pages/admin/Categories';
import Customers from '@/pages/admin/Customers';
import CustomerDetail from '@/pages/admin/CustomerDetail';
import Promotions from '@/pages/admin/Promotions';
import AdminVouchers from '@/pages/admin/Vouchers';
import Settings from '@/pages/admin/Settings';
import Feedbacks from '@/pages/admin/Feedbacks';
import AdminChatbot from '@/pages/admin/Chatbot';
import CMS from '@/pages/admin/CMS';
import Tickets from '@/pages/admin/Tickets';

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="orders" element={<AdminOrders />} />
    <Route path="orders/:id" element={<OrderDetail />} />
    <Route path="products" element={<Products />} />
    <Route path="products/new" element={<ProductForm />} />
    <Route path="products/:id" element={<ProductForm />} />
    <Route path="categories" element={<Categories />} />
    <Route path="customers" element={<Customers />} />
    <Route path="customers/:id" element={<CustomerDetail />} />
    <Route path="promotions" element={<Promotions />} />
    <Route path="vouchers" element={<AdminVouchers />} />
    <Route path="settings" element={<Settings />} />
    <Route path="feedbacks" element={<Feedbacks />} />
    <Route path="chatbot" element={<AdminChatbot />} />
    <Route path="cms" element={<CMS />} />
    <Route path="tickets" element={<Tickets />} />
  </Route>
);
