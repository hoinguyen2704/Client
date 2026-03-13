import { Route } from 'react-router-dom';

import Home from '@/pages/public/Home';
import Search from '@/pages/public/Search';
import ProductsPage from '@/pages/public/Products';
import Compare from '@/pages/public/Compare';
import Wishlist from '@/pages/public/Wishlist';
import Blog from '@/pages/public/Blog';
import BlogDetail from '@/pages/public/BlogDetail';
import ProductDetail from '@/pages/public/ProductDetail';
import FlashSale from '@/pages/public/FlashSale';
import Contact from '@/pages/public/Contact';
import About from '@/pages/public/About';
import Terms from '@/pages/public/Terms';
import Privacy from '@/pages/public/Privacy';
import Cart from '@/pages/public/Cart';
import Checkout from '@/pages/public/Checkout';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import ForgotPassword from '@/pages/public/ForgotPassword';
import Forbidden from '@/pages/public/Forbidden';

export const publicRoutes = (
  <>
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
  </>
);
