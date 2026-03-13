import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import Chatbot from './components/Chatbot';

// Public Pages
import Home from './pages/public/Home';
import Search from './pages/public/Search';
import ProductsPage from './pages/public/Products';
import Compare from './pages/public/Compare';
import Wishlist from './pages/public/Wishlist';
import Blog from './pages/public/Blog';
import BlogDetail from './pages/public/BlogDetail';
import ProductDetail from './pages/public/ProductDetail';
import FlashSale from './pages/public/FlashSale';
import Contact from './pages/public/Contact';
import About from './pages/public/About';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import Forbidden from './pages/public/Forbidden';

// User Pages
import Profile from './pages/user/Profile';
import AddressBook from './pages/user/AddressBook';
import PaymentMethods from './pages/user/PaymentMethods';
import Orders from './pages/user/Orders';
import OrderTracking from './pages/user/OrderTracking';
import Vouchers from './pages/user/Vouchers';
import MyReviews from './pages/user/MyReviews';
import RecentlyViewed from './pages/user/RecentlyViewed';
import Notifications from './pages/user/Notifications';
import Support from './pages/user/Support';
import UserSettings from './pages/user/Settings';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import Categories from './pages/admin/Categories';
import Customers from './pages/admin/Customers';
import CustomerDetail from './pages/admin/CustomerDetail';
import Promotions from './pages/admin/Promotions';
import AdminVouchers from './pages/admin/Vouchers';
import Settings from './pages/admin/Settings';
import Feedbacks from './pages/admin/Feedbacks';
import AdminChatbot from './pages/admin/Chatbot';
import CMS from './pages/admin/CMS';
import Tickets from './pages/admin/Tickets';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="compare" element={<Compare />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<BlogDetail />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="flash-sale" element={<FlashSale />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="403" element={<Forbidden />} />
          
          {/* User Dashboard Routes (Nested inside MainLayout for header/footer, or separate) */}
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
        </Route>

        {/* Admin Routes */}
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
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
