import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/guards/ProtectedRoute';

const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
const Dashboard = lazy(() => import('@/views/admin/dashboard/Dashboard'));
const AdminOrders = lazy(() => import('@/views/admin/order/Orders'));
const OrderDetail = lazy(() => import('@/views/admin/order/OrderDetail'));
const Products = lazy(() => import('@/views/admin/product/Products'));
const ProductForm = lazy(() => import('@/views/admin/product/ProductForm'));
const Categories = lazy(() => import('@/views/admin/category/Categories'));
const Customers = lazy(() => import('@/views/admin/user/Customers'));
const CustomerDetail = lazy(() => import('@/views/admin/user/CustomerDetail'));
const AdminVouchers = lazy(() => import('@/views/admin/coupon/Vouchers'));
const Settings = lazy(() => import('@/views/admin/setting/Settings'));
const Feedbacks = lazy(() => import('@/views/admin/review/Feedbacks'));
const AdminChatbot = lazy(() => import('@/views/admin/chatbot/Chatbot'));
const CMS = lazy(() => import('@/views/admin/cms/CMS'));
const Tickets = lazy(() => import('@/views/admin/ticket/Tickets'));
const FlashSales = lazy(() => import('@/views/admin/flashsale/FlashSales'));

export const adminRoutes = (
  <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
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
    <Route path="vouchers" element={<AdminVouchers />} />
    <Route path="flash-sales" element={<FlashSales />} />
    <Route path="settings" element={<Settings />} />
    <Route path="feedbacks" element={<Feedbacks />} />
    <Route path="chatbot" element={<AdminChatbot />} />
    <Route path="cms" element={<CMS />} />
    <Route path="tickets" element={<Tickets />} />
  </Route>
);
