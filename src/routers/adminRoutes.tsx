import { Route, Navigate } from 'react-router-dom';

import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/views/admin/dashboard/Dashboard';
import AdminOrders from '@/views/admin/order/Orders';
import OrderDetail from '@/views/admin/order/OrderDetail';
import Products from '@/views/admin/product/Products';
import ProductForm from '@/views/admin/product/ProductForm';
import Categories from '@/views/admin/category/Categories';
import Customers from '@/views/admin/user/Customers';
import CustomerDetail from '@/views/admin/user/CustomerDetail';
import Promotions from '@/views/admin/coupon/Promotions';
import AdminVouchers from '@/views/admin/coupon/Vouchers';
import Settings from '@/views/admin/setting/Settings';
import Feedbacks from '@/views/admin/review/Feedbacks';
import AdminChatbot from '@/views/admin/chatbot/Chatbot';
import CMS from '@/views/admin/cms/CMS';
import Tickets from '@/views/admin/ticket/Tickets';

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
